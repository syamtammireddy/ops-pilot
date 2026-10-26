# CentrAlign AI — Hiring Submission Form Answers

### 🌐 Live Demo & Submission Links
- **Live Demo Link (Active Public HTTPS)**: [https://frames-ambient-verbal-governor.trycloudflare.com](https://frames-ambient-verbal-governor.trycloudflare.com)
- **Local Dashboard**: `http://localhost:5173` (or `http://localhost:4000`)
- **Demo Video Script**: [`DEMO_SCRIPT.md`](file:///home/syam/IPS/DEMO_SCRIPT.md) (timed 2.5 min walkthrough)

---

### 1. In 3–5 sentences, what did you build?
I built **OpsPilot**, an autonomous enterprise AI employee designed to execute recurring financial operations across documents, ERP ledgers, and communications channels. The system accepts natural language operational objectives, dynamically discovers and reads vendor invoices, queries an in-memory ERP ledger (simulating NetSuite/Odoo), and consults internal corporate operating procedures to determine spending limits and compliance rules. It enforces an independent policy engine that gates high-risk operations behind human manager approval, dynamically adapts and retries when encountering transient gateway failures, and independently verifies the real database state before producing an auditable evidence dossier. Rather than relying on external agent frameworks like LangChain or CrewAI, the entire agent decision loop, policy layer, and verification engine are engineered from scratch in clean TypeScript.

---

### 2. Briefly explain your architecture.
OpsPilot uses a decoupled 3-tier architecture:
1. **Agent Core (`backend/src/agent/`)**: Implements an autonomous evaluation loop (`Goal -> Understand -> Plan -> Execute -> Observe -> Adapt -> Verify -> Complete`). It queries an LLM (`gpt-4o-mini` with structured tool calling) to generate concise decision summaries and select tools based on prior observations.
2. **Governance & Execution Layer (`backend/src/policy/`, `backend/src/tools/`, `backend/src/verification/`)**: Proposed tool calls pass through an independent **Policy Engine** that evaluates risk and enforces corporate rules (`ALLOW`, `REQUIRE_APPROVAL`, `DENY`). Approved tools execute against a stateful sandbox (`Acme Global Enterprise`) with an in-memory ERP ledger, document vault, and Slack communication hub. Completed tasks are verified by an independent **Verification Engine** that validates ground truth in the database before signing off.
3. **Reactive UI (`frontend/src/`)**: A clean 3-panel React + Vite dashboard displaying the task launcher and scenario presets on the left, a real-time Server-Sent Events (SSE) execution trace in the center, and live company state, approval modals, and verification evidence on the right.

---

### 3. What parts of your system are genuinely autonomous?
- **Tool Selection Sequence**: The agent is given an outcome, not a predefined workflow sequence. The sequence of actions (searching documents, reading details, inspecting ERP records, looking up company policy, registering invoices, settling payments, and notifying stakeholders) emerges dynamically from the LLM’s evaluation of successive environment observations.
- **Dynamic Document Discovery**: The agent searches the invoice repository, evaluates dates and payment terms, and discovers target documents dynamically.
- **Dynamic Policy Retrieval**: The worker independently searches and reads company operating procedures (`company_policy.md`) to discover spending limits ($5,000 threshold) and duplicate rules rather than relying on prompt hardcoding.
- **Failure Adaptation & Recovery**: When a bank gateway failure occurs (e.g. 503 Gateway Timeout), the agent reads the structured error observation, notes that it is retryable with no funds debited, and autonomously adapts by issuing an immediate retry.
- **Human Escalation**: The agent identifies when proposed actions violate autonomous limits, pauses its own execution, and resumes seamlessly after human manager sign-off.

---

### 4. What is currently hard coded or manually configured?
- **Company Environment Sandbox**: The simulated company ("Acme Global Enterprise") uses seeded JSON documents and in-memory ledger arrays rather than connecting to live cloud instances of NetSuite or Odoo.
- **Autonomous Policy Limit**: The $5,000 threshold is configured in both the Policy Engine code (`AUTONOMOUS_PAYMENT_LIMIT = 5000.00`) and the searchable markdown company policy (`company_policy.md`).
- **Deterministic Mock Provider**: While production mode calls the live OpenAI API, a deterministic mock provider is included to enable reproducible unit/integration tests and offline evaluation without API keys.

---

### 5. What models, frameworks, APIs, libraries, AI coding tools, or existing projects did you use?
- **LLM Providers**: Google Gemini (`gemini-3.5-flash`) and OpenAI API (`gpt-4o-mini`) using native structured function/tool calling, plus a deterministic offline mock provider for automated CI/CD test suites.
- **Backend**: Node.js, TypeScript, Express, Zod (runtime schema validation), dotenv, cors, uuid.
- **Frontend**: React 18, TypeScript, Vite, Lucide React (icons), Server-Sent Events (SSE).
- **Testing**: Jest, ts-jest, supertest.
- **Infrastructure**: Docker, Docker Compose.
- **AI Coding Tools**: Antigravity / Gemini was used for code scaffolding, pair programming, and architectural iteration.
- **Agent Frameworks**: **None**. LangChain, CrewAI, AutoGen, and other third-party agent libraries were intentionally avoided to demonstrate complete mastery of the underlying agent loop.

---

### 6. What is the biggest technical limitation of your current solution?
The biggest technical limitation is that the sandbox environment is hosted in-memory within the Node.js process rather than being an isolated, persistent transactional datastore. If the backend process restarts during execution, ongoing task memory is lost. In a production enterprise deployment, execution state must be persisted in a transactional database (PostgreSQL) paired with a distributed durable execution engine (e.g. Temporal or BullMQ/Redis) to handle worker crashes and multi-day approval timeouts.

---

### 7. If you had another 2 weeks, what would you build/change next?
1. **CentrAlign Organization Graph Integration**: Map company entities, organizational roles, vendor agreements, and database schemas into a unified graph model, enabling the agent to reason over cross-departmental relationships.
2. **Production Enterprise Connectors**: Replace the in-memory sandbox with real REST/GraphQL connectors for NetSuite, Odoo, QuickBooks, and Stripe Treasury.
3. **Interactive Slack/Teams Bot**: Deliver human approval cards directly into Slack with interactive Block Kit `[Approve]` and `[Reject]` buttons.
4. **Browser/Computer-Use Automation**: Connect Playwright / Chrome DevTools MCP to autonomously log into legacy vendor portals and retrieve invoices that lack API endpoints.
5. **Durable Distributed Execution**: Back the agent loop with Temporal to support durable state machines, idempotency keys, and long-running human approval workflows across days or weeks.
