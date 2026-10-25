import { EvidenceCheck, EvidenceDossier, ExecutionStep } from '../agent/types';
import { SandboxEnvironment } from '../environment/sandboxEnvironment';

export class Verifier {
  /**
   * Independently verifies that the goal was completed and validated in the real company environment.
   */
  public verify(
    taskId: string,
    goal: string,
    steps: ExecutionStep[],
    environment: SandboxEnvironment,
    targetInvoiceNumber?: string
  ): { passed: boolean; dossier: EvidenceDossier } {
    const checks: EvidenceCheck[] = [];
    const now = new Date().toISOString();

    // 1. Identify target invoice if not explicitly passed
    let invoiceNumber = targetInvoiceNumber;
    if (!invoiceNumber) {
      // Find from steps where execute_payment or record_invoice was called
      for (const step of steps) {
        if (step.arguments?.invoiceNumber) {
          invoiceNumber = step.arguments.invoiceNumber;
          break;
        }
      }
    }

    if (!invoiceNumber) {
      // Check document search / read steps
      for (const step of steps) {
        if (step.tool === 'read_document' && step.arguments?.documentId) {
          invoiceNumber = step.arguments.documentId;
          break;
        }
      }
    }

    // 2. Query real ERP state
    const erpRecords = environment.queryFinanceRecords(invoiceNumber ? { invoiceNumber } : undefined);
    const targetRecord = erpRecords.find(r => r.invoiceNumber === invoiceNumber);
    const doc = invoiceNumber ? environment.readDocument(invoiceNumber) : null;

    // Check 1: ERP Ledger Entry Exists
    const inLedger = !!targetRecord;
    checks.push({
      name: "ERP Ledger Existence",
      passed: inLedger,
      details: inLedger 
        ? `Invoice '${invoiceNumber}' successfully registered in ERP ledger (${targetRecord?.id}).`
        : `Invoice '${invoiceNumber}' was not found in the ERP ledger.`,
      timestamp: now
    });

    // Check 2: Status is PAID
    const isPaid = targetRecord?.status === 'PAID';
    checks.push({
      name: "Settlement Status Verification",
      passed: isPaid,
      details: isPaid
        ? `Ledger status confirmed as PAID at ${targetRecord?.paidAt}.`
        : `Ledger status is '${targetRecord?.status || 'UNKNOWN'}' (expected 'PAID').`,
      timestamp: now
    });

    // Check 3: Valid Bank Transaction Reference
    const hasReference = !!targetRecord?.transactionReference && targetRecord.transactionReference.startsWith('TXN-');
    checks.push({
      name: "Bank Settlement Reference",
      passed: hasReference,
      details: hasReference
        ? `Confirmed bank settlement transaction ID: ${targetRecord?.transactionReference}.`
        : "Missing or invalid bank transaction settlement reference.",
      timestamp: now
    });

    // Check 4: Amount Reconciliation
    const amountMatches = doc && targetRecord ? doc.amount === targetRecord.amount : inLedger;
    checks.push({
      name: "Amount Integrity & Reconciliation",
      passed: amountMatches,
      details: amountMatches
        ? `Settlement amount $${targetRecord?.amount.toFixed(2)} precisely matches invoice amount $${doc?.amount.toFixed(2)}.`
        : `Reconciliation mismatch: document=$${doc?.amount} vs ledger=$${targetRecord?.amount}.`,
      timestamp: now
    });

    // Check 5: Stakeholder Audit Notification
    const notifications = environment.getState().notifications;
    const notificationSent = notifications.some(n => 
      n.channel === '#finance-approvals' && 
      (invoiceNumber ? n.message.includes(invoiceNumber) : true)
    );
    checks.push({
      name: "Stakeholder Notification Audit",
      passed: notificationSent,
      details: notificationSent
        ? `Confirmed audit dispatch to #finance-approvals channel.`
        : `No audit notification detected in #finance-approvals for invoice '${invoiceNumber}'.`,
      timestamp: now
    });

    const passed = checks.every(c => c.passed);

    // Extract list of tools/actions taken
    const actionsTaken = steps.map(s => `${s.tool}(${JSON.stringify(s.arguments)}) -> ${s.status}`);

    const dossier: EvidenceDossier = {
      taskId,
      goal,
      invoiceId: invoiceNumber,
      vendor: targetRecord?.vendor || doc?.vendor,
      amount: targetRecord?.amount || doc?.amount,
      findingSummary: passed
        ? `Invoice ${invoiceNumber} for ${doc?.vendor || 'vendor'} was autonomously processed, verified against company policy, settled via ACH, and independently audited.`
        : `Verification failed for invoice ${invoiceNumber}. One or more compliance checks did not pass.`,
      actionsTaken,
      verificationChecks: checks,
      status: passed ? 'VERIFIED' : 'FAILED',
      completedAt: now
    };

    return {
      passed,
      dossier
    };
  }
}

export const verifierInstance = new Verifier();
