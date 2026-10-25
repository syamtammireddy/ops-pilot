# OpsPilot — Video Walkthrough Script (3 Minutes)

> **CentrAlign AI Engineering Hiring Assignment Demo**
> **Target Duration**: 2:30 – 3:30 minutes
> **Presenter**: Candidate

---

### [0:00 – 0:20] 1. The Problem
**Visual**: Show the OpsPilot Dashboard (`http://localhost:5173`). Clean 3-panel UI with Task Launcher on left, live trace in center, company sandbox state on right.

**Narration**:
> *"Hi everyone. Traditional enterprise automation relies on rigid RPA scripts that break the moment an API times out, an invoice exceeds budget, or a duplicate record appears.
> CentrAlign AI is solving this by building autonomous AI employees that understand how a company operates, connect across documents, ERP systems, and communications channels, and autonomously execute recurring business workflows.
> Today I'm demonstrating **OpsPilot**, an autonomous enterprise AI employee that solves invoice processing, failure recovery, human governance, and independent verification."*

---

### [0:20 – 0:40] 2. The Architecture
**Visual**: Briefly transition to the Mermaid diagram in the README or highlight the 3 panels on screen.

**Narration**:
> *"Notice that we did not use LangChain, CrewAI, or an opaque framework. The core agent loop is implemented from scratch in TypeScript:
> Goal &rarr; Understand &rarr; Plan &rarr; Execute &rarr; Observe &rarr; Adapt &rarr; Verify &rarr; Complete.
> Crucially, between the LLM and the tools sits an explicit **Policy Engine** that enforces corporate financial rules, plus an **Independent Verification Engine** that validates ground truth in the database before declaring completion."*

---

### [0:40 – 1:40] 3. Primary Autonomous Scenario: Standard Invoice Settlement
**Visual**: 
1. Click preset button: **"1. Standard Autonomous Invoice"**.
2. Click **[Run Autonomous Worker]**.
3. Watch the Live Execution Trace stream step-by-step via Server-Sent Events.

**Narration**:
> *"Let's give the AI worker a natural-language goal: 'Process the latest unpaid vendor invoice, verify it isn't already recorded, follow company policy, and complete payment if authorized.'
> Watch the live trace:
> - In **Step 1**, the agent calls `search_documents`, dynamically discovering the latest unpaid invoice from Acme Cloud Infrastructure for $4,200.
> - In **Step 2**, it reads the invoice to extract vendor bank details and line items.
> - In **Step 3**, it queries our simulated ERP ledger to ensure the invoice hasn't already been paid.
> - In **Step 4**, it independently consults our internal company operating procedures (`company_policy.md`) to discover authorization limits. It reads that invoices under $5,000 can be paid autonomously.
> - In **Step 5**, it records the invoice in the ERP.
> - In **Step 6**, it dispatches ACH payment settlement.
> - In **Step 7**, it independently verifies that the ERP marked the record PAID with a bank reference.
> - In **Step 8**, it broadcasts an audit notification to Slack `#finance-approvals`."*

---

### [1:40 – 2:20] 4. Failure Injection & Autonomous Recovery
**Visual**:
1. Click preset button: **"2. Failure Injection & Recovery"** (Notice the Failure Mode toggle switches to `INJECTED (503)` in amber).
2. Click **[Run Autonomous Worker]**.
3. Focus on the payment step and the subsequent recovery step.

**Narration**:
> *"Now let's test failure recovery. I've enabled failure injection mode, which simulates a bank gateway network partition during settlement.
> When the agent calls `execute_payment`, the tool returns a `503 GATEWAY_TIMEOUT` with `retryable: true`.
> Look at the decision summary:
> Instead of crashing or failing silently, the agent observes the error, evaluates that no funds were settled, and autonomously issues an immediate retry.
> The second attempt succeeds with transaction reference `TXN-ACH-...`, and the worker continues to verification and completion."*

---

### [2:20 – 2:50] 5. Human-in-the-Loop Policy Gate
**Visual**:
1. Click preset button: **"3. High-Value Approval Gate"** (Snowflake $12,500 invoice).
2. Click **[Run Autonomous Worker]**.
3. Trace pauses with an amber badge: `WAITING_FOR_APPROVAL`.
4. High-visibility red **Approval Banner** appears on the right panel.
5. Click **[Approve & Authorize Settlement]**.
6. Trace resumes live and concludes.

**Narration**:
> *"Next, what happens when an invoice exceeds autonomous authority?
> Here is a $12,500 invoice for Snowflake. The agent checks company policy and discovers that any payment over $5,000 strictly requires manager sign-off.
> The external Policy Engine intercepts the proposed payment, marks it `REQUIRE_APPROVAL`, and halts the loop.
> The UI displays a human approval card showing the amount, vendor, and policy reason.
> As Finance Director, I click **[Approve]**.
> The exact same agent execution resumes, commits the transaction, verifies ERP state, and alerts the team."*

---

### [2:50 – 3:20] 6. Final Evidence & Independent Verification
**Visual**:
Highlight the **Independent Verification Dossier** on the right column. Point to the 5 green checkmarks.

**Narration**:
> *"Finally, look at this **Independent Verification Dossier**.
> We never trust a tool's 200 OK return code as proof of task success.
> The verification engine independently probes the database:
> 1. ERP record exists.
> 2. Status is strictly `PAID`.
> 3. Unique bank transaction reference is committed.
> 4. Settlement amount precisely reconciles with invoice line items.
> 5. Confirmation was dispatched to the communications channel.
> All five checks pass, producing this auditable dossier."*

---

### [3:20 – 3:30] Closing Statement
**Visual**: Full dashboard view showing completed task, green trace, and verified state.

**Narration**:
> *"The important part is that the agent is given an outcome, not a predefined sequence of actions. Thank you!"*
