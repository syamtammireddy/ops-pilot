export type TaskStatus = 
  | 'UNDERSTANDING'
  | 'EXECUTING'
  | 'WAITING_FOR_APPROVAL'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED';

export type PolicyDecision = 'ALLOW' | 'REQUIRE_APPROVAL' | 'DENY';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ExecutionStep {
  stepNumber: number;
  timestamp: string;
  decisionSummary: string;
  tool: string;
  arguments: Record<string, any>;
  policyDecision: PolicyDecision;
  policyReason: string;
  toolResult: any;
  observation: any;
  status: 'SUCCESS' | 'FAILED' | 'PENDING_APPROVAL';
  toolCallId?: string;
}

export interface PendingApproval {
  approvalId: string;
  stepNumber: number;
  tool: string;
  arguments: Record<string, any>;
  reason: string;
  riskLevel: RiskLevel;
  requestedAt: string;
}

export interface EvidenceCheck {
  name: string;
  passed: boolean;
  details: string;
  timestamp: string;
}

export interface EvidenceDossier {
  taskId: string;
  goal: string;
  invoiceId?: string;
  vendor?: string;
  amount?: number;
  findingSummary: string;
  actionsTaken: string[];
  verificationChecks: EvidenceCheck[];
  status: 'VERIFIED' | 'FAILED';
  completedAt: string;
}

export interface Task {
  id: string;
  goal: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  steps: ExecutionStep[];
  pendingApproval?: PendingApproval;
  evidence?: EvidenceDossier;
  error?: string;
  maxSteps: number;
}

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

export interface SandboxState {
  invoices: InvoiceDocument[];
  erpRecords: ERPRecord[];
  notifications: NotificationMessage[];
  failureModeEnabled: boolean;
  failureCount: number;
}

export interface EnvironmentInfo {
  environment: SandboxState;
  llmModel: string;
  isMockMode: boolean;
}
