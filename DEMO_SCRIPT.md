# 🎬 OpsPilot — Complete Video Demo Guide & Narration Script

> **Target Duration**: 2.5 – 3.0 minutes  
> **Presenter**: Syam Tammireddi  
> **Application**: CentrAlign AI — Autonomous AI Employee Evaluation  

---

## 🛠️ Step 0: Pre-Recording Setup (Do this before hitting record)

1. Open your browser to: **[http://localhost:5173](http://localhost:5173)**
2. In the top bar, click **"Reset Sandbox"** (circular arrow button) to ensure a completely fresh company database.
3. Verify the top bar shows:
   * 🟢 **Model: Gemini 3.5 Flash (Live)**
   * 🛡️ **Sandbox: Acme Global Enterprise**
   * ⚠️ **Failure Mode: OFF**
4. Start your screen recorder (**Loom**, OBS, or Chrome extension).

---

## 🎥 The Video Script (Scene by Scene)

---

### ⏱️ [0:00 – 0:30] Scene 1: Introduction & High-Level Architecture

* **👉 WHAT BUTTON TO PRESS / POINT TO:**
  * Keep mouse cursor in the center / top bar.
  * Hover over **OpsPilot: Autonomous AI Worker** and **Model: Gemini 3.5 Flash (Live)**.

* **👀 WHAT IS OBSERVED ON SCREEN:**
  * Clean, dark-mode 3-panel enterprise operations dashboard.
  * Left: Task Objective & Scenarios.
  * Center: Autonomous Execution Trace (`IDLE`).
  * Right: Company State Panel (NetSuite ERP Ledger, Document Vault, Slack Hub).

* **🗣️ EXACT WORDS TO SAY:**
  > *"Hi everyone, my name is Syam Tammireddi, and today I'm demonstrating **OpsPilot**, an autonomous enterprise AI employee built for the CentrAlign AI engineering evaluation.*
  > 
  > *Traditional enterprise automation relies on rigid RPA scripts that break when APIs time out, or simple chatbots that can't execute real database writes.*
  > 
  > *OpsPilot is an autonomous operations worker built completely from scratch in TypeScript—without LangChain or CrewAI—running live on Google Gemini 3.5 Flash. It follows the complete **Goal → Understand → Plan → Execute → Observe → Adapt → Verify** lifecycle across documents, ERP ledgers, and communications channels."*

---

### ⏱️ [0:30 – 1:15] Scene 2: Standard Autonomous Flow ($4,200 Invoice)

* **👉 WHAT BUTTON TO PRESS:**
  1. On the left panel, click: **`1. Standard Autonomous Invoice`**.
  2. Click the blue button: **`Run Autonomous Worker`**.

* **👀 WHAT IS OBSERVED ON SCREEN:**
  * In the center panel, steps **1 to 8** stream in real-time via Server-Sent Events.
  * Each step shows a green **`ALLOW`** shield badge.
  * Step 4 specifically reads **`read_company_policy`**.
  * On the right panel, `ERP Ledger` updates in real-time: `INV-2024-001` changes to **`PAID ($4,200.00)`** with a bank transaction reference!
  * Top right badge turns green: **`COMPLETED & VERIFIED`**.

* **🗣️ EXACT WORDS TO SAY:**
  > *"Let's trigger our first scenario with a high-level natural language goal: 'Process the latest unpaid vendor invoice, follow company payment policy, and complete payment if authorized.'*
  > 
  > *Watch the live execution trace stream step-by-step:*
  > *- In **Step 1 & 2**, the agent calls `search_documents` and `read_document`, discovering an unpaid invoice from Acme Cloud for $4,200.*
  > *- In **Step 3**, it queries our NetSuite ERP ledger to confirm it hasn't already been paid.*
  > *- In **Step 4**, the worker independently consults our internal company policy manual to discover spending rules. It finds that invoices under $5,000 can be paid autonomously.*
  > *- In **Steps 5 and 6**, it registers the invoice in the ERP and dispatches an ACH bank transfer.*
  > *- In **Steps 7 and 8**, it verifies ledger status and alerts the `#finance-approvals` Slack channel.*
  > 
  > *Notice the green **ALLOW** badge on each step—every action was authorized by an independent Policy Engine before execution."*

---

### ⏱️ [1:15 – 1:55] Scene 3: Chaos Injection & Autonomous Failure Recovery

* **👉 WHAT BUTTON TO PRESS:**
  1. In the top bar, click **"Reset Sandbox"** (quick reset).
  2. On the left panel, click: **`2. Failure Injection & Recovery`**.
     *(Notice the top bar switches automatically to `Failure Mode: INJECTED (503)` in amber).*
  3. Click the blue button: **`Run Autonomous Worker`**.

* **👀 WHAT IS OBSERVED ON SCREEN:**
  * The agent discovers the invoice and prepares payment.
  * At Step 6, `execute_payment` turns **RED** with status **`FAILED`** and error: `GATEWAY_TIMEOUT (503)`.
  * **Step 7 immediately adapts**: The decision text says: *"Payment failed with retryable timeout. Verifying zero debits and re-executing transaction."*
  * Step 7 calls `execute_payment` again and turns **GREEN (SUCCESS)**!
  * The workflow finishes with **`COMPLETED & VERIFIED`**.

* **🗣️ EXACT WORDS TO SAY:**
  > *"Now let's test failure recovery, which is critical for CentrAlign's Observe → Adapt requirement. I've enabled failure injection mode, which simulates a bank payment gateway network partition.*
  > 
  > *Look at Step 6: When the agent attempts payment settlement, the gateway returns a 503 Gateway Timeout with `retryable: true`.*
  > 
  > *Instead of crashing or failing silently, OpsPilot observes the structured error from the sandbox, confirms that no funds were debited, and autonomously adapts by issuing an immediate retry.*
  > 
  > *The second payment succeeds, the ledger is updated, and the task completes successfully."*

---

### ⏱️ [1:55 – 2:35] Scene 4: High-Value Human Approval Gate ($12,500 Invoice)

* **👉 WHAT BUTTON TO PRESS:**
  1. In the top bar, click **"Reset Sandbox"**.
  2. On the left panel, click: **`3. High-Value Approval Gate`**.
  3. Click the blue button: **`Run Autonomous Worker`**.
  4. Wait ~2 seconds until execution halts.
  5. On the right panel, look at the high-priority **Manager Approval Card** that popped up.
  6. Click the green button: **`Approve & Authorize Settlement`**.

* **👀 WHAT IS OBSERVED ON SCREEN:**
  * The trace pauses at Step 6 with an amber badge: **`WAITING_FOR_APPROVAL`**.
  * The approval modal/card shows:
    * Vendor: *Snowflake Enterprise Data Corp*
    * Amount: *$12,500.00*
    * Policy Reason: *Exceeds $5,000 autonomous threshold.*
  * When you click **Approve**, the trace immediately unfreezes, dispatches the payment, and completes with **`COMPLETED & VERIFIED`**.

* **🗣️ EXACT WORDS TO SAY:**
  > *"Next: what happens when an action exceeds autonomous authority?*
  > 
  > *Here the agent discovers a $12,500 invoice for Snowflake. When it reads company policy, it discovers that any transaction equal to or exceeding $5,000 strictly requires Finance Director sign-off.*
  > 
  > *The independent Policy Engine intercepts the proposed payment, marks it `REQUIRE_APPROVAL`, and halts the loop. The LLM cannot bypass this.*
  > 
  > *The UI surfaces this manager approval card citing the exact policy violation. As Finance Director, I click **[Approve]**.*
  > 
  > *The exact same agent loop resumes, executes the disbursement, and commits the transaction to the ledger."*

---

### ⏱️ [2:35 – 3:00] Scene 5: Independent Verification & Closing

* **👉 WHAT BUTTON TO PRESS / POINT TO:**
  * Point your mouse to the **`Independent Verification Dossier`** at the top right of your screen.
  * Hover over the 5 green checkmarks.

* **👀 WHAT IS OBSERVED ON SCREEN:**
  * Box titled **Independent Verification Dossier (VERIFIED)**.
  * Shows 5 passed ground-truth checks:
    1. ✅ ERP Ledger Existence
    2. ✅ Settlement Status Verification (`PAID`)
    3. ✅ Bank Settlement Reference (`TXN-ACH-...`)
    4. ✅ Amount Integrity & Reconciliation ($12,500 matches)
    5. ✅ Stakeholder Notification Audit (`#finance-approvals`)

* **🗣️ EXACT WORDS TO SAY:**
  > *"Finally, look at this **Independent Verification Dossier**.*
  > 
  > *We never rely on the LLM's own claim or a tool's 200 OK status code as proof of success. Our standalone Verification Engine queries the actual database to confirm five ground-truth checks: ledger existence, settlement status, valid bank reference, exact line-item amount matching, and audit delivery.*
  > 
  > *All five checks pass, producing this tamper-evident audit record.*
  > 
  > *That is OpsPilot: a dependable, policy-governed, self-healing AI employee for enterprise operations. Thank you!"*

---

## 🎯 After Recording: 2 Quick Steps

1. **Paste your video link** into the CentrAlign form under **"Demo Video Link *"**.
2. **Push your code to GitHub**:
   ```bash
   cd /home/syam/IPS
   git push -u origin main
   ```
   Paste `https://github.com/syamtammireddy/ops-pilot` into the form under **"Github Repository link *"**.
