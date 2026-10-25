import { PolicyEngine } from '../../src/policy/policyEngine';
import { SandboxEnvironment } from '../../src/environment/sandboxEnvironment';

describe('PolicyEngine Unit Tests', () => {
  let policyEngine: PolicyEngine;
  let environment: SandboxEnvironment;

  beforeEach(() => {
    policyEngine = new PolicyEngine();
    environment = new SandboxEnvironment();
  });

  test('ALLOWs read-only inspection tools', () => {
    const tools = [
      'search_documents',
      'read_document',
      'search_company_policy',
      'read_company_policy',
      'query_finance_records',
      'verify_payment_status'
    ];

    for (const tool of tools) {
      const result = policyEngine.evaluate(tool, {}, environment);
      expect(result.decision).toBe('ALLOW');
      expect(result.riskLevel).toBe('LOW');
    }
  });

  test('ALLOWs invoice recording in ERP as medium risk', () => {
    const result = policyEngine.evaluate('record_invoice', { invoiceNumber: 'INV-2024-001' }, environment);
    expect(result.decision).toBe('ALLOW');
    expect(result.riskLevel).toBe('MEDIUM');
  });

  test('ALLOWs payment execution below $5,000 threshold', () => {
    const result = policyEngine.evaluate('execute_payment', { invoiceNumber: 'INV-2024-001', amount: 4200.00 }, environment);
    expect(result.decision).toBe('ALLOW');
    expect(result.riskLevel).toBe('MEDIUM');
  });

  test('REQUIRES APPROVAL for payment execution equal or exceeding $5,000 threshold', () => {
    const result = policyEngine.evaluate('execute_payment', { invoiceNumber: 'INV-2024-003', amount: 12500.00 }, environment);
    expect(result.decision).toBe('REQUIRE_APPROVAL');
    expect(result.riskLevel).toBe('HIGH');
    expect(result.reason).toContain('$5,000');
  });

  test('DENIES payment if invoice is already marked PAID in ERP (duplicate prevention)', () => {
    // In seed data, INV-2024-002 is already marked PAID
    const result = policyEngine.evaluate('execute_payment', { invoiceNumber: 'INV-2024-002', amount: 1850.00 }, environment);
    expect(result.decision).toBe('DENY');
    expect(result.riskLevel).toBe('HIGH');
    expect(result.reason).toContain('Double-payment is strictly prohibited');
  });

  test('DENIES unauthorized / arbitrary tool names', () => {
    const result = policyEngine.evaluate('execute_arbitrary_shell', { cmd: 'rm -rf /' }, environment);
    expect(result.decision).toBe('DENY');
    expect(result.riskLevel).toBe('HIGH');
  });
});
