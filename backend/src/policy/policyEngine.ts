import { PolicyDecision, RiskLevel } from '../agent/types';
import { SandboxEnvironment } from '../environment/sandboxEnvironment';

export interface PolicyEvaluationResult {
  decision: PolicyDecision;
  riskLevel: RiskLevel;
  reason: string;
  metadata?: Record<string, any>;
}

export class PolicyEngine {
  public static readonly AUTONOMOUS_PAYMENT_LIMIT = 5000.00;

  /**
   * Evaluates a proposed tool call and arguments against corporate governance policies.
   */
  public evaluate(
    toolName: string, 
    args: Record<string, any>, 
    environment: SandboxEnvironment
  ): PolicyEvaluationResult {
    switch (toolName) {
      // Read-only inspection tools
      case 'search_documents':
      case 'read_document':
      case 'search_company_policy':
      case 'read_company_policy':
      case 'query_finance_records':
      case 'verify_payment_status':
        return {
          decision: 'ALLOW',
          riskLevel: 'LOW',
          reason: `Read-only inspection tool '${toolName}' is fully authorized under autonomous operations policy.`
        };

      // Notification and human escalation
      case 'send_notification':
      case 'request_human_approval':
        return {
          decision: 'ALLOW',
          riskLevel: 'LOW',
          reason: `Communication tool '${toolName}' is authorized for stakeholder notification.`
        };

      // ERP Invoice registration
      case 'record_invoice':
        return {
          decision: 'ALLOW',
          riskLevel: 'MEDIUM',
          reason: `Recording invoice '${args.invoiceNumber || 'unknown'}' in ERP ledger is permitted as a standard pre-payment bookkeeping step.`
        };

      // Payment execution — strict policy gate
      case 'execute_payment': {
        const amount = typeof args.amount === 'number' ? args.amount : 0;
        const invoiceNumber = args.invoiceNumber;

        // Check if invoice has already been paid in ERP (duplicate check)
        if (invoiceNumber) {
          const records = environment.queryFinanceRecords({ invoiceNumber });
          const alreadyPaid = records.some(r => r.status === 'PAID');
          if (alreadyPaid) {
            return {
              decision: 'DENY',
              riskLevel: 'HIGH',
              reason: `Corporate Policy Violation: Invoice '${invoiceNumber}' is already marked PAID in the ERP ledger. Double-payment is strictly prohibited.`
            };
          }
        }

        // Check value threshold ($5,000 limit)
        if (amount >= PolicyEngine.AUTONOMOUS_PAYMENT_LIMIT) {
          return {
            decision: 'REQUIRE_APPROVAL',
            riskLevel: 'HIGH',
            reason: `Payment amount of $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} meets or exceeds the autonomous limit of $${PolicyEngine.AUTONOMOUS_PAYMENT_LIMIT.toLocaleString('en-US', { minimumFractionDigits: 2 })}. Company policy mandates human Finance Manager approval before funds dispatch.`,
            metadata: {
              amount,
              threshold: PolicyEngine.AUTONOMOUS_PAYMENT_LIMIT,
              invoiceNumber
            }
          };
        }

        return {
          decision: 'ALLOW',
          riskLevel: 'MEDIUM',
          reason: `Payment of $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} is below the $${PolicyEngine.AUTONOMOUS_PAYMENT_LIMIT.toLocaleString('en-US', { minimumFractionDigits: 2 })} threshold and authorized for autonomous settlement.`
        };
      }

      default:
        return {
          decision: 'DENY',
          riskLevel: 'HIGH',
          reason: `Unauthorized tool '${toolName}'. Corporate safety policy restricts execution to registered enterprise tools.`
        };
    }
  }
}

export const policyEngineInstance = new PolicyEngine();
