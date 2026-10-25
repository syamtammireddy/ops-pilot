import { Verifier } from '../../src/verification/verifier';
import { SandboxEnvironment } from '../../src/environment/sandboxEnvironment';
import { ExecutionStep } from '../../src/agent/types';

describe('Verifier Unit Tests', () => {
  let verifier: Verifier;
  let environment: SandboxEnvironment;

  beforeEach(() => {
    verifier = new Verifier();
    environment = new SandboxEnvironment();
  });

  test('fails verification when invoice has not been recorded or paid', () => {
    const steps: ExecutionStep[] = [
      {
        stepNumber: 1,
        timestamp: new Date().toISOString(),
        decisionSummary: "Read document",
        tool: "read_document",
        arguments: { documentId: "INV-2024-001" },
        policyDecision: "ALLOW",
        policyReason: "Read is allowed",
        toolResult: {},
        observation: {},
        status: "SUCCESS"
      }
    ];

    const result = verifier.verify("task-test", "Process invoice INV-2024-001", steps, environment, "INV-2024-001");
    expect(result.passed).toBe(false);
    expect(result.dossier.status).toBe('FAILED');
    expect(result.dossier.verificationChecks.find(c => c.name === "Settlement Status Verification")?.passed).toBe(false);
  });

  test('passes verification when invoice is recorded, paid, and notified', () => {
    // Perform actions directly in sandbox
    environment.recordInvoice('INV-2024-001');
    environment.executePayment('INV-2024-001', 4200.00);
    environment.sendNotification('#finance-approvals', 'Payment confirmed for INV-2024-001');

    const steps: ExecutionStep[] = [
      {
        stepNumber: 1,
        timestamp: new Date().toISOString(),
        decisionSummary: "Pay invoice",
        tool: "execute_payment",
        arguments: { invoiceNumber: "INV-2024-001", amount: 4200.00 },
        policyDecision: "ALLOW",
        policyReason: "Allowed",
        toolResult: {},
        observation: {},
        status: "SUCCESS"
      }
    ];

    const result = verifier.verify("task-test", "Process invoice INV-2024-001", steps, environment, "INV-2024-001");
    expect(result.passed).toBe(true);
    expect(result.dossier.status).toBe('VERIFIED');
    expect(result.dossier.verificationChecks.every(c => c.passed)).toBe(true);
  });
});
