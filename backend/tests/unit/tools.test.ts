import { ToolExecutor } from '../../src/tools/toolExecutor';
import { SandboxEnvironment } from '../../src/environment/sandboxEnvironment';

describe('Tool Validation & Execution Unit Tests', () => {
  let toolExecutor: ToolExecutor;
  let environment: SandboxEnvironment;
  const context = { taskId: 'test-task', environment: null as any, stepNumber: 1 };

  beforeEach(() => {
    toolExecutor = new ToolExecutor();
    environment = new SandboxEnvironment();
    context.environment = environment;
  });

  test('search_documents returns documents matching status and sorts by latest', async () => {
    const res = await toolExecutor.execute('search_documents', { status: 'UNPAID' }, context);
    expect(res.success).toBe(true);
    expect(res.result.totalFound).toBeGreaterThanOrEqual(1);
    expect(res.result.documents[0].date).toBeDefined();
  });

  test('read_document validates required documentId argument', async () => {
    const res = await toolExecutor.execute('read_document', {}, context);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });

  test('read_document returns invoice line items and amount', async () => {
    const res = await toolExecutor.execute('read_document', { documentId: 'INV-2024-001' }, context);
    expect(res.success).toBe(true);
    expect(res.result.found).toBe(true);
    expect(res.result.document.amount).toBe(4200.00);
    expect(res.result.document.vendor).toContain('Acme Cloud');
  });

  test('read_company_policy returns company finance guidelines', async () => {
    const res = await toolExecutor.execute('read_company_policy', { sectionName: 'Approval Thresholds' }, context);
    expect(res.success).toBe(true);
    expect(res.result.policyContent).toContain('$5,000.00 USD');
  });

  test('record_invoice fails when invoice does not exist in vault', async () => {
    const res = await toolExecutor.execute('record_invoice', { invoiceNumber: 'NON-EXISTENT-999' }, context);
    expect(res.success).toBe(true);
    expect(res.result.success).toBe(false);
    expect(res.result.error).toContain('not found in document vault');
  });
});
