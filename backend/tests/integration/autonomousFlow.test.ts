import { AgentLoop } from '../../src/agent/agentLoop';
import { LLMProvider } from '../../src/agent/llmProvider';
import { PolicyEngine } from '../../src/policy/policyEngine';
import { ToolExecutor } from '../../src/tools/toolExecutor';
import { SandboxEnvironment } from '../../src/environment/sandboxEnvironment';
import { Verifier } from '../../src/verification/verifier';
import { TaskStore } from '../../src/state/taskStore';

describe('Autonomous Flow Integration Test', () => {
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

  test('Autonomously discovers invoice, checks policy, records, pays, and independently verifies', async () => {
    const goal = "Process the latest unpaid vendor invoice. Verify that it isn't already recorded, follow company payment policy, and complete payment if authorized.";

    const task = await agentLoop.startTask(goal, 15);

    let attempts = 0;
    while (task.status !== 'COMPLETED' && task.status !== 'FAILED' && attempts < 100) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }

    console.log('Final task status:', task.status, 'Error:', task.error);
    console.log('Steps executed:', task.steps.map(s => `${s.stepNumber}: ${s.tool} (${s.status})`));

    expect(task.status).toBe('COMPLETED');
    expect(task.steps.length).toBeGreaterThanOrEqual(5);

    const erpRecords = environment.queryFinanceRecords({ invoiceNumber: 'INV-2024-001' });
    expect(erpRecords.length).toBe(1);
    expect(erpRecords[0].status).toBe('PAID');

    expect(task.evidence?.status).toBe('VERIFIED');
    expect(task.evidence?.verificationChecks.every(c => c.passed)).toBe(true);
  });
});
