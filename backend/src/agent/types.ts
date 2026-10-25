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
  decisionSummary: string; // Concise explanation of why the action was chosen
  tool: string;
  arguments: Record<string, any>;
  policyDecision: PolicyDecision;
  policyReason: string;
  toolResult: any;
  observation: any;
  status: 'SUCCESS' | 'FAILED' | 'PENDING_APPROVAL';
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

export interface ToolDefinition {
  name: string;
  description: string;
  riskLevel: RiskLevel;
  parameters: Record<string, any>; // JSON Schema format for OpenAI tool calling
  execute: (args: any, context: ToolExecutionContext) => Promise<any>;
}

export interface ToolExecutionContext {
  taskId: string;
  environment: any; // SandboxEnvironment
  stepNumber: number;
}

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string;
  tool_call_id?: string;
  tool_calls?: any[];
}
