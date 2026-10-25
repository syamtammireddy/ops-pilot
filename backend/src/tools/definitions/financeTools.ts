import { z } from 'zod';
import { ToolDefinition } from '../../agent/types';

export const queryFinanceRecordsTool: ToolDefinition = {
  name: 'query_finance_records',
  description: 'Queries the company ERP system (Odoo / NetSuite simulation) for existing ledger records, payment transactions, and invoice settlement status.',
  riskLevel: 'LOW',
  parameters: {
    type: 'object',
    properties: {
      invoiceNumber: {
        type: 'string',
        description: 'Invoice number to look up in the ERP ledger (e.g. "INV-2024-001")'
      },
      vendor: {
        type: 'string',
        description: 'Vendor name to filter ledger entries'
      },
      status: {
        type: 'string',
        enum: ['DRAFT', 'RECORDED', 'PAID', 'FLAGGED'],
        description: 'Filter records by status in the ERP'
      }
    }
  },
  execute: async (args: any, context) => {
    const schema = z.object({
      invoiceNumber: z.string().optional(),
      vendor: z.string().optional(),
      status: z.enum(['DRAFT', 'RECORDED', 'PAID', 'FLAGGED']).optional()
    });
    const parsed = schema.parse(args);
    const records = context.environment.queryFinanceRecords(parsed);
    return {
      recordsFound: records.length,
      records
    };
  }
};

export const recordInvoiceTool: ToolDefinition = {
  name: 'record_invoice',
  description: 'Registers an incoming, verified vendor invoice into the company ERP ledger with status RECORDED. This is required by policy before any payment can be executed.',
  riskLevel: 'MEDIUM',
  parameters: {
    type: 'object',
    properties: {
      invoiceNumber: {
        type: 'string',
        description: 'The invoice number to register (e.g. "INV-2024-001")'
      }
    },
    required: ['invoiceNumber']
  },
  execute: async (args: any, context) => {
    const schema = z.object({
      invoiceNumber: z.string().min(1, 'invoiceNumber is required')
    });
    const parsed = schema.parse(args);
    const result = context.environment.recordInvoice(parsed.invoiceNumber);
    return result;
  }
};

export const executePaymentTool: ToolDefinition = {
  name: 'execute_payment',
  description: 'Dispatches payment settlement for an invoice recorded in the ERP system via bank ACH/Wire. High-value payments ($5,000 or greater) are automatically intercepted by the Policy Engine for human manager approval.',
  riskLevel: 'HIGH',
  parameters: {
    type: 'object',
    properties: {
      invoiceNumber: {
        type: 'string',
        description: 'The invoice number to settle (e.g. "INV-2024-001")'
      },
      amount: {
        type: 'number',
        description: 'The exact settlement amount in USD'
      }
    },
    required: ['invoiceNumber', 'amount']
  },
  execute: async (args: any, context) => {
    const schema = z.object({
      invoiceNumber: z.string().min(1, 'invoiceNumber is required'),
      amount: z.number().positive('amount must be greater than 0')
    });
    const parsed = schema.parse(args);
    const result = context.environment.executePayment(parsed.invoiceNumber, parsed.amount);
    return result;
  }
};

export const verifyPaymentStatusTool: ToolDefinition = {
  name: 'verify_payment_status',
  description: 'Independently inspects the ERP ledger to verify that the specified invoice has settled, is marked PAID, and holds a confirmed bank transaction reference.',
  riskLevel: 'LOW',
  parameters: {
    type: 'object',
    properties: {
      invoiceNumber: {
        type: 'string',
        description: 'Invoice number to verify in the ERP ledger'
      }
    },
    required: ['invoiceNumber']
  },
  execute: async (args: any, context) => {
    const schema = z.object({
      invoiceNumber: z.string().min(1, 'invoiceNumber is required')
    });
    const parsed = schema.parse(args);
    const verification = context.environment.verifyPaymentStatus(parsed.invoiceNumber);
    return verification;
  }
};
