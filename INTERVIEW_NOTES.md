# OpsPilot — Technical Interview Preparation Guide

> Direct, code-grounded answers to probable interview questions for CentrAlign AI.

---

### 1. Why did you not use LangGraph, CrewAI, or AutoGen?
**Answer**: 
In a hiring assignment, relying on large third-party agent frameworks often obscures whether a candidate truly understands agentic execution or is merely gluing together vendor abstractions. By implementing the agent loop directly in TypeScript (`backend/src/agent/agentLoop.ts`), every stage of the lifecycle—prompt assembly, structured tool calling, governance policy gating, state updates, failure observation, human pause/resume, and independent outcome verification—is explicit, transparent, and easy to explain line-by-line. It also avoids heavy dependency overhead, obscure framework bugs, and latency penalties.

---

### 2. How is the agent actually autonomous?
**Answer**: 
The agent is autonomous because **no procedural workflow sequence is hardcoded**. 
In `backend/src/agent/agentLoop.ts`, the loop is:
```typescript
while (task.status === 'EXECUTING') {
  const history = this.buildConversationHistory(task);
  const action = await this.llmProvider.getNextAction(task.goal, history, step);
  // Evaluates policy, executes tool, captures observation, loops...
}
```
The model is given only the natural-language goal and the tool registry. At each step, the model observes the output of the previous tool (e.g., invoice details, ERP records, or company policies) and dynamically decides what tool to invoke next. If an invoice is missing, it reads documents; if an invoice is not registered in ERP, it registers it; if payment fails with a retryable error, it adapts and retries; if an invoice is already paid, it halts to avoid double-payment.

---

### 3. How do you prevent the LLM from executing dangerous actions?
**Answer**: 
Through strict **principle of least privilege and external policy enforcement**:
1. **No Arbitrary Shell/Code Execution**: The model is never given bash or terminal access. It only has access to 10 typed tools with explicit Zod argument schemas (`backend/src/tools/definitions/`).
2. **External Policy Engine Gatekeeper (`backend/src/policy/policyEngine.ts`)**: Even if the model attempts to call an unauthorized tool or execute a payment exceeding policy limits, the Policy Engine runs *outside* the LLM context. Unregistered tools are flagged as `DENY`, and high-value payments ($\ge \$5,000$) are flagged as `REQUIRE_APPROVAL`, halting execution immediately before any side effect can occur in the sandbox.

---

### 4. How does the policy engine work?
**Answer**: 
In `backend/src/policy/policyEngine.ts`, `PolicyEngine.evaluate(toolName, args, environment)` evaluates proposed tool calls before execution:
- **`ALLOW`**: Low-risk inspection tools (`search_documents`, `read_document`, `read_company_policy`, `query_finance_records`), pre-payment ERP invoice registration, and payments $< \$5,000.00$.
- **`REQUIRE_APPROVAL`**: When `toolName === 'execute_payment'` and `args.amount >= 5000.00`. It transitions task state to `WAITING_FOR_APPROVAL` and stores a `PendingApproval` record in `TaskStore`. The loop pauses until a human manager calls `/api/tasks/:id/approve`.
- **`DENY`**: If an invoice is already marked `PAID` in the ERP ledger, attempting to execute payment returns `DENY` to enforce duplicate fraud prevention.

---

### 5. How does failure recovery work?
**Answer**: 
When a tool fails in `SandboxEnvironment` (e.g. `executePayment` under failure mode), the tool does not crash or throw an unhandled exception. Instead, it returns a structured observation:
```json
{
  "success": false,
  "error": "GATEWAY_TIMEOUT",
  "message": "Bank settlement gateway timed out during transaction settlement. No funds debited.",
  "retryable": true
}
```
This observation is recorded in the task history and fed to the LLM on the next turn. In `backend/src/agent/llmProvider.ts`, the model reads `retryable: true` and the error context. Rather than aborting, the agent generates an action explanation: *"Payment settlement encountered transient error. Adapting by executing immediate retry."* and re-invokes `execute_payment`, recovering autonomously.

---

### 6. How do you know the task is actually complete?
**Answer**: 
We never treat the LLM declaring completion or a tool returning HTTP 200 as proof of task completion. 
When the agent declares completion, `backend/src/verification/verifier.ts` triggers an independent verification probe directly against the database and company state. Only when all ground-truth criteria pass is the task marked `COMPLETED` with an `EvidenceDossier`. If verification fails, the failure details are returned to the agent as an observation so it can adapt or escalate.

---

### 7. Why is verification separate from execution?
**Answer**: 
In enterprise operations, tool execution often experiences "phantom success" or partial failures:
- An API returns `200 OK` for an HTTP request, but an async worker dropped the message before database commitment.
- An ERP payment is dispatched, but the settlement reference was not committed to the accounts payable ledger.
- The amount written to the ledger does not reconcile with the original invoice document.
Separating execution from independent verification prevents the AI worker from hallucinating success.

---

### 8. What happens if the model selects an invalid tool or malformed arguments?
**Answer**: 
Two layers of defense:
1. **Tool Registry Check (`backend/src/tools/toolExecutor.ts`)**: If the tool name does not exist, `ToolExecutor` immediately returns `{ success: false, error: "Tool 'xyz' not found in Tool Registry." }`.
2. **Runtime Zod Validation**: In `backend/src/tools/definitions/`, every tool parses its arguments using `zod`. For example, `executePaymentTool` runs:
   ```typescript
   const schema = z.object({
     invoiceNumber: z.string().min(1),
     amount: z.number().positive()
   });
   schema.parse(args);
   ```
   If arguments are missing or malformed, Zod throws a structured validation error which is captured and returned to the model as an observation, enabling the model to self-correct its arguments on the next step.

---

### 9. How do you prevent infinite loops or runaway agent execution?
**Answer**: 
In `backend/src/agent/agentLoop.ts`, every task is configured with a strict `maxSteps` limit (default 15 steps):
```typescript
if (task.steps.length >= task.maxSteps) {
  this.taskStore.updateStatus(task.id, 'FAILED', `Execution halted: reached maximum limit of ${task.maxSteps} steps.`);
  return;
}
```
If an agent gets stuck in a repetitive loop or encounters consecutive unrecoverable errors, the guardrail terminates the loop and marks the task as failed.

---

### 10. How would you scale this for production?
**Answer**: 
To scale OpsPilot across an enterprise with thousands of concurrent workers:
1. **Durable Execution (Temporal / BullMQ)**: Replace the in-memory Node.js `while` loop with a durable workflow engine like Temporal. Temporal automatically persists state at each step, handles worker crashes, and supports long-running human approval timeouts lasting days or weeks.
2. **Persistent Storage (PostgreSQL)**: Migrate `TaskStore` and `SandboxEnvironment` from in-memory objects to PostgreSQL with transactional row-level locking.
3. **Distributed Event Streaming**: Use Redis Pub/Sub or Kafka to broadcast execution trace events to horizontally scaled frontend WebSocket / SSE gateways.

---

### 11. How would you add browser automation (Computer Use)?
**Answer**: 
Many vendor invoices are trapped behind legacy web portals without APIs. We would add a headless browser tool (using Playwright or the Chrome DevTools Protocol MCP) to the Tool Registry:
- `browser_navigate(url)`
- `browser_click(selector)`
- `browser_fill(selector, text)`
- `browser_download_file(url)`
The LLM would receive these tools, log into vendor portals, solve simple navigations, and save downloaded PDFs directly into the document vault for `read_document` to process.

---

### 12. How would you add persistent company memory / Organization Graph?
**Answer**: 
CentrAlign's core concept is the **Organization Graph**. In production, we would back the company context with a property graph (e.g. Neo4j or relational graph schema):
- **Nodes**: Vendors, Employees, Invoices, General Ledger Accounts, Approval Policies.
- **Edges**: `(:Vendor)-[:SUBMITTED]->(:Invoice)`, `(:Employee)-[:HAS_SPENDING_LIMIT]->(:Policy)`, `(:Invoice)-[:BILLED_TO]->(:Department)`.
Before taking action, the agent would query the graph to understand relationships (e.g. *"Who is the approver for Acme Cloud Infrastructure?"* or *"What is our historical payment terms with Apex Logistics?"*).

---

### 13. How would you support multi-tenancy for multiple companies?
**Answer**: 
1. **Tenant Scoping**: All tool executions and database queries would require an authenticated `tenantId` in the `ToolExecutionContext`.
2. **Isolated Environments**: Company policies, document vaults, and ERP configurations would be partitioned by tenant ID with PostgreSQL Row-Level Security (RLS) or separate database schemas.
3. **Custom Policy Engines**: Each company would configure its own approval limits, routing rules, and required verification checks in the Organization Graph.

---

### 14. What parts of OpsPilot are hardcoded vs genuinely autonomous?
**Answer**: 
- **Hardcoded**:
  - The simulated company seed data (invoice JSON files, initial ERP records).
  - The Zod validation schemas for tools.
  - The $5,000 threshold constant in the Policy Engine.
- **Genuinely Autonomous**:
  - The decision of what action to take next at each step.
  - The discovery and selection of target invoice documents from the vault.
  - The retrieval and comprehension of company policy rules from `company_policy.md`.
  - The adaptation and retry logic when receiving a transient 503 gateway failure.
  - The pause and resumption of execution upon human manager authorization.
  - The independent verification evaluation of actual environment state.
