import { 
  InvoiceDocument, 
  ERPRecord, 
  NotificationMessage, 
  COMPANY_POLICY_CONTENT, 
  INITIAL_INVOICES, 
  INITIAL_ERP_RECORDS, 
  INITIAL_NOTIFICATIONS 
} from './seedData';
import { v4 as uuidv4 } from 'uuid';

export class SandboxEnvironment {
  private invoices: InvoiceDocument[] = [];
  private erpRecords: ERPRecord[] = [];
  private notifications: NotificationMessage[] = [];
  private companyPolicy: string = COMPANY_POLICY_CONTENT;
  private failureModeEnabled: boolean = false;
  private failureCount: number = 0;

  constructor() {
    this.reset();
  }

  public reset(): void {
    // Deep clone initial state so mutations are purely in-sandbox
    this.invoices = JSON.parse(JSON.stringify(INITIAL_INVOICES));
    this.erpRecords = JSON.parse(JSON.stringify(INITIAL_ERP_RECORDS));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
    this.companyPolicy = COMPANY_POLICY_CONTENT;
    this.failureCount = 0;
  }

  public toggleFailureMode(enabled?: boolean): boolean {
    if (typeof enabled === 'boolean') {
      this.failureModeEnabled = enabled;
    } else {
      this.failureModeEnabled = !this.failureModeEnabled;
    }
    // When re-enabling failure mode, reset failureCount so next payment triggers failure
    if (this.failureModeEnabled) {
      this.failureCount = 0;
    }
    return this.failureModeEnabled;
  }

  public isFailureModeEnabled(): boolean {
    return this.failureModeEnabled;
  }

  public getFailureCount(): number {
    return this.failureCount;
  }

  public getState() {
    return {
      invoices: this.invoices,
      erpRecords: this.erpRecords,
      notifications: this.notifications,
      failureModeEnabled: this.failureModeEnabled,
      failureCount: this.failureCount
    };
  }

  // --- Document Operations ---
  public searchDocuments(query?: string, status?: string): InvoiceDocument[] {
    let results = [...this.invoices];

    if (status) {
      results = results.filter(inv => inv.status.toLowerCase() === status.toLowerCase());
    }

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(inv => 
        inv.vendor.toLowerCase().includes(q) ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.description.toLowerCase().includes(q) ||
        inv.filename.toLowerCase().includes(q)
      );
    }

    // Sort by date descending so "latest" naturally appears first
    results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return results;
  }

  public readDocument(idOrFilename: string): InvoiceDocument | null {
    const doc = this.invoices.find(
      inv => inv.id === idOrFilename || 
             inv.invoiceNumber === idOrFilename || 
             inv.filename === idOrFilename
    );
    return doc ? JSON.parse(JSON.stringify(doc)) : null;
  }

  // --- Company Policy Operations ---
  public searchCompanyPolicy(query?: string): { query?: string; matchedSections: string[] } {
    const sections = this.companyPolicy.split('\n## ');
    if (!query) {
      return {
        matchedSections: sections.map(s => s.trim())
      };
    }

    const q = query.toLowerCase();
    const matches = sections.filter(sec => sec.toLowerCase().includes(q)).map(s => s.trim());
    return {
      query,
      matchedSections: matches.length > 0 ? matches : ["No direct policy clause matched. Read full policy for guidance."]
    };
  }

  public readCompanyPolicy(sectionName?: string): string {
    if (!sectionName) {
      return this.companyPolicy;
    }
    const sections = this.companyPolicy.split('\n## ');
    const found = sections.find(sec => sec.toLowerCase().includes(sectionName.toLowerCase()));
    return found ? `## ${found.trim()}` : this.companyPolicy;
  }

  // --- ERP / Finance Operations ---
  public queryFinanceRecords(filter?: { invoiceNumber?: string; vendor?: string; status?: string }): ERPRecord[] {
    let records = [...this.erpRecords];
    if (filter?.invoiceNumber) {
      records = records.filter(r => r.invoiceNumber.toLowerCase() === filter.invoiceNumber!.toLowerCase());
    }
    if (filter?.vendor) {
      records = records.filter(r => r.vendor.toLowerCase().includes(filter.vendor!.toLowerCase()));
    }
    if (filter?.status) {
      records = records.filter(r => r.status.toLowerCase() === filter.status!.toLowerCase());
    }
    return records;
  }

  public recordInvoice(invoiceNumber: string): { success: boolean; record?: ERPRecord; error?: string } {
    // Check if document exists
    const doc = this.invoices.find(i => i.invoiceNumber === invoiceNumber || i.id === invoiceNumber);
    if (!doc) {
      return { success: false, error: `Invoice ${invoiceNumber} not found in document vault.` };
    }

    // Check if already in ERP
    const existing = this.erpRecords.find(r => r.invoiceNumber === doc.invoiceNumber);
    if (existing) {
      return { 
        success: false, 
        error: `Invoice ${doc.invoiceNumber} is already recorded in ERP with status '${existing.status}'. Duplicate recording prevented.` 
      };
    }

    const newRecord: ERPRecord = {
      id: `ERP-2024-${String(this.erpRecords.length + 101).padStart(3, '0')}`,
      invoiceNumber: doc.invoiceNumber,
      vendor: doc.vendor,
      amount: doc.amount,
      currency: doc.currency,
      status: 'RECORDED',
      recordedAt: new Date().toISOString(),
      verified: false
    };

    this.erpRecords.push(newRecord);
    return { success: true, record: newRecord };
  }

  public executePayment(
    invoiceNumber: string, 
    amount: number
  ): { success: boolean; transactionReference?: string; error?: string; retryable?: boolean; message: string } {
    // Check failure injection mode
    if (this.failureModeEnabled && this.failureCount === 0) {
      this.failureCount++;
      return {
        success: false,
        error: "GATEWAY_TIMEOUT",
        message: "Bank settlement gateway timed out during transaction settlement. No funds were debited. Transient network partition detected.",
        retryable: true
      };
    }

    // Check if invoice exists in ERP
    const record = this.erpRecords.find(r => r.invoiceNumber === invoiceNumber);
    if (!record) {
      return {
        success: false,
        error: "INVOICE_NOT_RECORDED",
        message: `Invoice ${invoiceNumber} is not recorded in the ERP ledger. Company policy requires recording before payment settlement.`,
        retryable: false
      };
    }

    if (record.status === 'PAID') {
      return {
        success: false,
        error: "ALREADY_PAID",
        message: `Invoice ${invoiceNumber} has already been paid under transaction ${record.transactionReference}. Double-payment prevented.`,
        retryable: false
      };
    }

    // Execute settlement
    const txnRef = `TXN-ACH-${uuidv4().substring(0, 8).toUpperCase()}`;
    record.status = 'PAID';
    record.paidAt = new Date().toISOString();
    record.transactionReference = txnRef;
    record.paymentMethod = 'ACH_SETTLEMENT';
    record.verified = true;

    // Update document status in vault as well
    const doc = this.invoices.find(i => i.invoiceNumber === invoiceNumber);
    if (doc) {
      doc.status = 'PAID';
    }

    return {
      success: true,
      transactionReference: txnRef,
      message: `Payment of $${amount.toFixed(2)} for ${invoiceNumber} successfully dispatched and settled via ACH. Transaction reference: ${txnRef}.`
    };
  }

  public verifyPaymentStatus(invoiceNumber: string): { 
    verified: boolean; 
    status: string; 
    record?: ERPRecord; 
    checkTimestamp: string; 
    checks: { inLedger: boolean; isPaid: boolean; hasReference: boolean; amountMatches: boolean } 
  } {
    const record = this.erpRecords.find(r => r.invoiceNumber === invoiceNumber);
    const doc = this.invoices.find(i => i.invoiceNumber === invoiceNumber);
    const now = new Date().toISOString();

    if (!record) {
      return {
        verified: false,
        status: 'NOT_FOUND',
        checkTimestamp: now,
        checks: { inLedger: false, isPaid: false, hasReference: false, amountMatches: false }
      };
    }

    const inLedger = true;
    const isPaid = record.status === 'PAID';
    const hasReference = !!record.transactionReference;
    const amountMatches = doc ? doc.amount === record.amount : true;

    const verified = inLedger && isPaid && hasReference && amountMatches;

    return {
      verified,
      status: record.status,
      record: JSON.parse(JSON.stringify(record)),
      checkTimestamp: now,
      checks: { inLedger, isPaid, hasReference, amountMatches }
    };
  }

  public sendNotification(
    channel: string, 
    message: string, 
    metadata?: Record<string, any>
  ): NotificationMessage {
    const notif: NotificationMessage = {
      id: `MSG-${String(this.notifications.length + 1).padStart(3, '0')}`,
      channel,
      sender: "OpsPilot AI Worker",
      message,
      timestamp: new Date().toISOString(),
      metadata
    };
    this.notifications.push(notif);
    return notif;
  }
}

// Global singleton instance for the sandbox
export const sandboxInstance = new SandboxEnvironment();
