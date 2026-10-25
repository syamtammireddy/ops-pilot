import { AgentLoop } from '../../src/agent/agentLoop';
import { LLMProvider } from '../../src/agent/llmProvider';
import { PolicyEngine } from '../../src/policy/policyEngine';
import { ToolExecutor } from '../../src/tools/toolExecutor';
import { SandboxEnvironment } from '../../src/environment/sandboxEnvironment';
import { Verifier } from '../../src/verification/verifier';
import { TaskStore } from '../../src/state/taskStore';

describe('Failure Injection and Recovery Integration Test', () => {
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

  test('Observes transient gateway timeout error, adapts, retries payment, and succeeds', async () => {
    // Enable failure injection
    environment.toggleFailureMode(true);
    expect(environment.isFailureModeEnabled()).toBe(true);

    const goal = "Process the latest unpaid vendor invoice. Verify that it isn't already recorded, follow company payment policy, and complete payment if authorized.";
    const task = await agentLoop.startTask(goal, 15);

    // Wait for loop completion
    let attempts = 0;
    while (task.status !== 'COMPLETED' && task.status !== 'FAILED' && attempts < 60) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    expect(task.status).toBe('COMPLETED');

    // Trace must visibly show:
    // 1. First execute_payment failed with GATEWAY_TIMEOUT
    // 2. Second execute_payment succeeded
    const paymentSteps = task.steps.filter(s => s.tool === 'execute_payment');
    expect(paymentSteps.length).toBe(2);

    expect(paymentSteps[0].status).toBe('FAILED');
    expect(paymentSteps[0].observation.error).toBe('GATEWAY_TIMEOUT');
    expect(paymentSteps[0].observation.retryable).toBe(true);

    expect(paymentSteps[1].status).toBe('SUCCESS');
    expect(paymentSteps[1].observation.success).toBe(true);
    expect(paymentSteps[1].decisionSummary).toContain('immediate retry');

    // Verification still passes after recovery!
    expect(task.evidence?.status).toBe('VERIFIED');
  });
});
