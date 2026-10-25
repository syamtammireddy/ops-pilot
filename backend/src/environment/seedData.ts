export interface InvoiceDocument {
  id: string;
  filename: string;
  vendor: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'UNPAID' | 'PAID' | 'FLAGGED';
  description: string;
  lineItems: Array<{ item: string; qty: number; unitPrice: number }>;
  bankAccount: string;
}

export interface ERPRecord {
  id: string;
  invoiceNumber: string;
  vendor: string;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'RECORDED' | 'PAID' | 'FLAGGED';
  recordedAt: string;
  paidAt?: string;
  transactionReference?: string;
  paymentMethod?: string;
  verified: boolean;
}

export interface NotificationMessage {
  id: string;
  channel: string;
  sender: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export const COMPANY_POLICY_CONTENT = `# Acme Global Enterprise — Standard Operating Procedure: Finance & Invoice Settlement

## 1. Scope & Objective
This policy governs the automated and manual processing, verification, and payment settlement of vendor invoices across all business units.

## 2. Payment Approval Thresholds
- **Autonomous Payment Limit (Low Risk)**: Invoices with a total amount less than $5,000.00 USD may be recorded and settled autonomously by certified AI workers, provided that the invoice is verified against the ERP and has not been previously settled.
- **Manager Sign-off Required (High Risk)**: Invoices with an amount equal to or exceeding $5,000.00 USD strictly require prior human authorization from the Finance Director before any payment dispatch. Attempting to bypass approval violates corporate financial controls.

## 3. Duplicate Prevention & Verification
- Before any payment is initiated, the worker must query the ERP ledger (query_finance_records) to confirm that the invoice has not already been recorded or paid.
- If an invoice is already present in the ERP ledger with status PAID, payment must NOT be processed. The worker must flag the invoice as a duplicate and halt payment.
- Double-payment constitutes a major compliance violation.

## 4. Pre-Payment ERP Recording
- Any valid, unrecorded invoice must first be recorded into the ERP ledger with status RECORDED before payment execution is dispatched.

## 5. Post-Payment Independent Verification
- Immediately following payment execution, the worker must verify the settlement status in the ERP system (verify_payment_status) to confirm the transaction settled successfully and is permanently committed.

## 6. Audit & Stakeholder Communication
- Every completed payment transaction must generate an audit notification alert to the #finance-approvals communications channel including the invoice ID, vendor, amount, and settlement reference.
`;

export const INITIAL_INVOICES: InvoiceDocument[] = [
  {
    id: "INV-2024-001",
    filename: "invoice_001_acme_cloud.json",
    vendor: "Acme Cloud Infrastructure Inc.",
    invoiceNumber: "INV-2024-001",
    date: "2026-10-25",
    dueDate: "2026-11-15",
    amount: 4200.00,
    currency: "USD",
    status: "UNPAID",
    description: "Monthly cloud infrastructure cluster & managed database services",
    lineItems: [
      { item: "Kubernetes Enterprise Cluster", qty: 1, unitPrice: 3200.00 },
      { item: "Managed PostgreSQL HA Replica", qty: 1, unitPrice: 1000.00 }
    ],
    bankAccount: "US-CITI-9876543210"
  },
  {
    id: "INV-2024-002",
    filename: "invoice_002_apex_logistics.json",
    vendor: "Apex Logistics LLC",
    invoiceNumber: "INV-2024-002",
    date: "2026-10-15",
    dueDate: "2026-10-30",
    amount: 1850.00,
    currency: "USD",
    status: "UNPAID",
    description: "Expedited hardware delivery & shipping services",
    lineItems: [
      { item: "Cross-dock logistics handling", qty: 1, unitPrice: 1850.00 }
    ],
    bankAccount: "US-CHASE-1122334455"
  },
  {
    id: "INV-2024-003",
    filename: "invoice_003_snowflake_licensing.json",
    vendor: "Snowflake Enterprise Data Corp",
    invoiceNumber: "INV-2024-003",
    date: "2026-10-22",
    dueDate: "2026-11-20",
    amount: 12500.00,
    currency: "USD",
    status: "UNPAID",
    description: "Annual Enterprise Data Warehouse compute & storage subscription",
    lineItems: [
      { item: "Enterprise Data Platform Capacity", qty: 1, unitPrice: 12500.00 }
    ],
    bankAccount: "US-WELLS-8899001122"
  },
  {
    id: "INV-2024-004",
    filename: "invoice_004_officesupply.json",
    vendor: "OfficeSupply Direct",
    invoiceNumber: "INV-2024-004",
    date: "2026-09-10",
    dueDate: "2026-09-25",
    amount: 340.00,
    currency: "USD",
    status: "PAID",
    description: "Quarterly ergonomics and peripheral supplies",
    lineItems: [
      { item: "Ergonomic keyboards & mice bundle", qty: 1, unitPrice: 340.00 }
    ],
    bankAccount: "US-BOFA-3344556677"
  }
];

export const INITIAL_ERP_RECORDS: ERPRecord[] = [
  {
    id: "ERP-2024-089",
    invoiceNumber: "INV-2024-004",
    vendor: "OfficeSupply Direct",
    amount: 340.00,
    currency: "USD",
    status: "PAID",
    recordedAt: "2026-09-11T10:15:00Z",
    paidAt: "2026-09-12T14:30:00Z",
    transactionReference: "TXN-OFFICE-8812",
    paymentMethod: "ACH_TRANSFER",
    verified: true
  },
  {
    id: "ERP-2024-094",
    invoiceNumber: "INV-2024-002",
    vendor: "Apex Logistics LLC",
    amount: 1850.00,
    currency: "USD",
    status: "PAID",
    recordedAt: "2026-10-16T09:00:00Z",
    paidAt: "2026-10-18T11:22:00Z",
    transactionReference: "TXN-APEX-9921",
    paymentMethod: "WIRE_SETTLEMENT",
    verified: true
  }
];

export const INITIAL_NOTIFICATIONS: NotificationMessage[] = [
  {
    id: "MSG-001",
    channel: "#finance-approvals",
    sender: "System",
    message: "Enterprise Finance & ERP Worker session initialized. Monitoring ledger accounts.",
    timestamp: "2026-10-25T08:00:00Z"
  }
];
