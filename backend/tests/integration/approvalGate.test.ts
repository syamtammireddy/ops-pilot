import { AgentLoop } from '../../src/agent/agentLoop';
import { LLMProvider } from '../../src/agent/llmProvider';
import { PolicyEngine } from '../../src/policy/policyEngine';
import { ToolExecutor } from '../../src/tools/toolExecutor';
import { SandboxEnvironment } from '../../src/environment/sandboxEnvironment';
import { Verifier } from '../../src/verification/verifier';
import { TaskStore } from '../../src/state/taskStore';

describe('Human Approval Gate Integration Test', () => {
  let agentLoop: AgentLoop;
  let environment: SandboxEnvironment;
  let taskStore: TaskStore;

  jest.setTimeout(20000);

  beforeEach(() => {
    environment = new SandboxEnvironment();
    taskStore = new TaskStore();
    const llmProvider = new LLMProvider();
    const policyEngine = new PolicyEngine();
    const toolExecutor = new ToolExecutor();
    const verifier = new Verifier();

    agentLoop = new AgentLoop(
      llmProvider,
      policyEngine,
      toolExecutor,
      environment,
      verifier,
      taskStore
    );
  });

  test('Halts high-value payment for human approval, resumes upon sign-off, and completes', async () => {
    const goal = "Process the Snowflake enterprise data platform invoice for $12,500.00 and execute payment.";
    const task = await agentLoop.startTask(goal, 15);

    // Wait until task reaches WAITING_FOR_APPROVAL
    let attempts = 0;
    while (task.status !== 'WAITING_FOR_APPROVAL' && task.status !== 'COMPLETED' && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    expect(task.status).toBe('WAITING_FOR_APPROVAL');
    expect(task.pendingApproval).toBeDefined();
    expect(task.pendingApproval?.riskLevel).toBe('HIGH');
    expect(task.pendingApproval?.arguments.amount).toBe(12500.00);

    // Now simulate human approval via API
    await agentLoop.approveTask(task.id);

    // Wait for resumed loop to complete
    attempts = 0;
    while (task.status !== 'COMPLETED' && task.status !== 'FAILED' && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    expect(task.status).toBe('COMPLETED');
    expect(task.pendingApproval).toBeUndefined();

    // Check that human approval step was recorded
    const approvedStep = task.steps.find(s => s.decisionSummary.includes('[Human Approved]'));
    expect(approvedStep).toBeDefined();
    expect(approvedStep?.status).toBe('SUCCESS');

    // Final state verified
    expect(task.evidence?.status).toBe('VERIFIED');
    expect(task.evidence?.amount).toBe(12500.00);
  });
});
