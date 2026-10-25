import { v4 as uuidv4 } from 'uuid';
import { Task, ExecutionStep, ConversationMessage } from './types';
import { LLMProvider, llmProviderInstance } from './llmProvider';
import { PolicyEngine, policyEngineInstance } from '../policy/policyEngine';
import { ToolExecutor, toolExecutorInstance } from '../tools/toolExecutor';
import { SandboxEnvironment, sandboxInstance } from '../environment/sandboxEnvironment';
import { Verifier, verifierInstance } from '../verification/verifier';
import { TaskStore, taskStoreInstance } from '../state/taskStore';

export class AgentLoop {
  constructor(
    private llmProvider: LLMProvider = llmProviderInstance,
    private policyEngine: PolicyEngine = policyEngineInstance,
    private toolExecutor: ToolExecutor = toolExecutorInstance,
    private environment: SandboxEnvironment = sandboxInstance,
    private verifier: Verifier = verifierInstance,
    private taskStore: TaskStore = taskStoreInstance
  ) {}

  /**
   * Starts a new autonomous task.
   */
  public async startTask(goal: string, maxSteps: number = 15): Promise<Task> {
    const taskId = `task-${uuidv4().substring(0, 8)}`;
    const task = this.taskStore.createTask(taskId, goal, maxSteps);

    // Run execution asynchronously
    setImmediate(async () => {
      try {
        await this.runLoop(task);
      } catch (err: any) {
        console.error(`[AgentLoop] Task ${taskId} crashed:`, err);
        this.taskStore.updateStatus(taskId, 'FAILED', err.message);
      }
    });

    return task;
  }

  /**
   * Resumes a task that was paused waiting for human approval.
   */
  public async approveTask(taskId: string): Promise<Task | null> {
    const task = this.taskStore.getTask(taskId);
    if (!task || task.status !== 'WAITING_FOR_APPROVAL' || !task.pendingApproval) {
      return null;
    }

    const approval = task.pendingApproval;
    this.taskStore.clearPendingApproval(taskId);
    this.taskStore.updateStatus(taskId, 'EXECUTING');

    // Run approved tool execution and resume loop
    setImmediate(async () => {
      try {
        const stepNum = task.steps.length + 1;
        // Execute the approved tool
        const toolResult = await this.toolExecutor.execute(
          approval.tool,
          approval.arguments,
          { taskId, environment: this.environment, stepNumber: stepNum }
        );

        const step: ExecutionStep = {
          stepNumber: stepNum,
          timestamp: new Date().toISOString(),
          decisionSummary: `[Human Approved] Executed authorized high-risk action '${approval.tool}' following Finance Director sign-off.`,
          tool: approval.tool,
          arguments: approval.arguments,
          policyDecision: 'ALLOW',
          policyReason: `Approved by human manager at ${new Date().toISOString()}. Reason: ${approval.reason}`,
          toolResult: toolResult.result || { error: toolResult.error },
          observation: toolResult.result || { error: toolResult.error, success: false },
          status: toolResult.success ? 'SUCCESS' : 'FAILED'
        };

        this.taskStore.addStep(taskId, step);

        // Resume loop
        await this.runLoop(task);
      } catch (err: any) {
        this.taskStore.updateStatus(taskId, 'FAILED', err.message);
      }
    });

    return task;
  }

  /**
   * Handles human rejection of a pending high-risk action.
   */
  public async rejectTask(taskId: string, rejectionReason?: string): Promise<Task | null> {
    const task = this.taskStore.getTask(taskId);
    if (!task || task.status !== 'WAITING_FOR_APPROVAL' || !task.pendingApproval) {
      return null;
    }

    const approval = task.pendingApproval;
    this.taskStore.clearPendingApproval(taskId);
    this.taskStore.updateStatus(taskId, 'EXECUTING');

    setImmediate(async () => {
      try {
        const stepNum = task.steps.length + 1;
        const reason = rejectionReason || "Rejected by Finance Director due to policy compliance considerations.";

        const step: ExecutionStep = {
          stepNumber: stepNum,
          timestamp: new Date().toISOString(),
          decisionSummary: `[Human Rejected] Proposed action '${approval.tool}' was rejected by Finance Director.`,
          tool: approval.tool,
          arguments: approval.arguments,
          policyDecision: 'DENY',
          policyReason: `Human rejection: ${reason}`,
          toolResult: { rejected: true, reason },
          observation: { rejected: true, message: `Action rejected by human manager: ${reason}. Adapt without performing this action.` },
          status: 'FAILED'
        };

        this.taskStore.addStep(taskId, step);

        // Resume loop so agent can adapt and conclude/notify
        await this.runLoop(task);
      } catch (err: any) {
        this.taskStore.updateStatus(taskId, 'FAILED', err.message);
      }
    });

    return task;
  }

  /**
   * The central autonomous agent execution loop.
   */
  private async runLoop(task: Task): Promise<void> {
    this.taskStore.updateStatus(task.id, 'EXECUTING');

    while (task.status === 'EXECUTING') {
      // 1. Guardrail: Max Steps Protection
      if (task.steps.length >= task.maxSteps) {
        this.taskStore.updateStatus(
          task.id, 
          'FAILED', 
          `Execution halted: reached maximum limit of ${task.maxSteps} steps without verified completion.`
        );
        return;
      }

      // 2. Assemble Context / Conversation History
      const history = this.buildConversationHistory(task);

      // 3. Ask LLM for the next decision / tool call
      const action = await this.llmProvider.getNextAction(task.goal, history, task.steps.length + 1);

      // 4. Handle Completion Declaration from Agent
      if (action.isComplete) {
        this.taskStore.updateStatus(task.id, 'VERIFYING');

        // Run Independent Verification
        const verification = this.verifier.verify(
          task.id,
          task.goal,
          task.steps,
          this.environment
        );

        if (verification.passed) {
          this.taskStore.setEvidence(task.id, verification.dossier);
          return;
        } else {
          // Verification failed! Add step to inform agent and allow adaptation
          const verifyStep: ExecutionStep = {
            stepNumber: task.steps.length + 1,
            timestamp: new Date().toISOString(),
            decisionSummary: "Attempted completion, but independent verification found discrepancies in ERP/bank state.",
            tool: 'verify_payment_status',
            arguments: {},
            policyDecision: 'ALLOW',
            policyReason: "Independent verification probe",
            toolResult: { passed: false, checks: verification.dossier.verificationChecks },
            observation: {
              error: "VERIFICATION_FAILED",
              message: "Independent verification checks failed. Review ERP ledger and ensure invoice settlement and audit notification are complete.",
              failedChecks: verification.dossier.verificationChecks.filter(c => !c.passed)
            },
            status: 'FAILED'
          };
          this.taskStore.addStep(task.id, verifyStep);
          this.taskStore.updateStatus(task.id, 'EXECUTING');
          continue;
        }
      }

      // 5. Tool Call Selected by Model
      if (!action.toolCall) {
        // Model neither called a tool nor declared completion
        this.taskStore.updateStatus(task.id, 'FAILED', 'Model returned empty action.');
        return;
      }

      const { name: toolName, arguments: toolArgs } = action.toolCall;
      const stepNumber = task.steps.length + 1;

      // 6. Check Governance Policy Engine
      const policyResult = this.policyEngine.evaluate(toolName, toolArgs, this.environment);

      // CASE A: Policy requires Human Approval
      if (policyResult.decision === 'REQUIRE_APPROVAL') {
        const approval = {
          approvalId: `appr-${uuidv4().substring(0, 8)}`,
          stepNumber,
          tool: toolName,
          arguments: toolArgs,
          reason: policyResult.reason,
          riskLevel: policyResult.riskLevel,
          requestedAt: new Date().toISOString()
        };

        const pendingStep: ExecutionStep = {
          stepNumber,
          timestamp: new Date().toISOString(),
          decisionSummary: action.decisionSummary,
          tool: toolName,
          arguments: toolArgs,
          policyDecision: 'REQUIRE_APPROVAL',
          policyReason: policyResult.reason,
          toolResult: { pending: true, reason: policyResult.reason },
          observation: { pendingApproval: true, message: policyResult.reason },
          status: 'PENDING_APPROVAL'
        };

        this.taskStore.addStep(task.id, pendingStep);
        this.taskStore.setPendingApproval(task.id, approval);
        // Pause execution loop; waiting for user action via API
        return;
      }

      // CASE B: Policy Denied
      if (policyResult.decision === 'DENY') {
        const deniedStep: ExecutionStep = {
          stepNumber,
          timestamp: new Date().toISOString(),
          decisionSummary: action.decisionSummary,
          tool: toolName,
          arguments: toolArgs,
          policyDecision: 'DENY',
          policyReason: policyResult.reason,
          toolResult: { error: 'POLICY_VIOLATION', reason: policyResult.reason },
          observation: {
            success: false,
            error: 'POLICY_DENIED',
            message: policyResult.reason,
            instruction: 'The proposed tool call violated company governance policy. Adapt your plan.'
          },
          status: 'FAILED'
        };

        this.taskStore.addStep(task.id, deniedStep);
        // Continue loop so agent can adapt based on policy feedback
        continue;
      }

      // CASE C: Policy Allowed -> Execute Tool
      const toolExecution = await this.toolExecutor.execute(
        toolName,
        toolArgs,
        { taskId: task.id, environment: this.environment, stepNumber }
      );

      const step: ExecutionStep = {
        stepNumber,
        timestamp: new Date().toISOString(),
        decisionSummary: action.decisionSummary,
        tool: toolName,
        arguments: toolArgs,
        policyDecision: 'ALLOW',
        policyReason: policyResult.reason,
        toolResult: toolExecution.result || { error: toolExecution.error },
        observation: toolExecution.result || { success: false, error: toolExecution.error },
        status: (toolExecution.success && (!toolExecution.result || toolExecution.result.success !== false)) ? 'SUCCESS' : 'FAILED',
        toolCallId: action.toolCall.id
      };

      this.taskStore.addStep(task.id, step);

      // Brief yield to event loop so I/O and SSE can flush
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  /**
   * Constructs the structured conversation history formatted for the LLM.
   */
  private buildConversationHistory(task: Task): ConversationMessage[] {
    const systemPrompt = `You are OpsPilot, an autonomous Enterprise Operations & Finance AI employee for Acme Global Enterprise.
You work across company systems: Document Vault (vendor invoices), ERP Ledger (NetSuite/Odoo), Company Operating Policy, Bank Settlement Gateway, and Communications (#finance-approvals).

CORE PRINCIPLES:
1. Dynamic Discovery: Search and read real invoices from the document vault. Never guess invoice details, vendors, or amounts.
2. Compliance & Policy: Always check company operating procedures (search_company_policy / read_company_policy) to confirm spending thresholds, duplicate prevention rules, and approval mandates.
3. Order of Operations:
   - Identify invoice in document vault -> read invoice
   - Check ERP ledger for duplicates -> if already paid, flag and abort payment
   - Consult company policy -> verify spending limit
   - Record unrecorded invoice in ERP ledger
   - Execute payment settlement
   - Independently verify payment status in ERP
   - Send notification to #finance-approvals
4. Adaptation & Recovery: If an action fails with a transient error (e.g. gateway timeout), examine the error observation, verify state, and adapt or retry.
5. Verification: Independent verification of the ERP ledger and communication audit is mandatory before declaring completion.
6. Action Explanations: Every tool call must include a clear, 1-sentence decision summary explaining why you are taking that specific step.`;

    const messages: ConversationMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `OPERATIONAL GOAL: ${task.goal}` }
    ];

    for (const step of task.steps) {
      const tcId = step.toolCallId || `call_${step.stepNumber}`;
      messages.push({
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: tcId,
            type: 'function',
            function: {
              name: step.tool,
              arguments: JSON.stringify(step.arguments)
            }
          }
        ]
      });

      messages.push({
        role: 'tool',
        tool_call_id: tcId,
        content: JSON.stringify(step.observation)
      });
    }

    return messages;
  }
}

export const agentLoopInstance = new AgentLoop();
