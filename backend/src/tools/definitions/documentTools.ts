import { z } from 'zod';
import { ToolDefinition } from '../../agent/types';

export const searchDocumentsTool: ToolDefinition = {
  name: 'search_documents',
  description: 'Searches the enterprise invoice document vault for vendor invoices by keyword (vendor name, filename, description) or status (UNPAID, PAID). Results are sorted chronologically with latest first.',
  riskLevel: 'LOW',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search keyword such as vendor name, description, or invoice ID (e.g. "Acme", "unpaid", "cloud")'
      },
      status: {
        type: 'string',
        enum: ['UNPAID', 'PAID', 'FLAGGED'],
        description: 'Filter by invoice payment status in the document vault'
      }
    }
  },
  execute: async (args: any, context) => {
    const schema = z.object({
      query: z.string().optional(),
      status: z.enum(['UNPAID', 'PAID', 'FLAGGED']).optional()
    });
    const parsed = schema.parse(args);
    const documents = context.environment.searchDocuments(parsed.query, parsed.status);
    return {
      totalFound: documents.length,
      documents: documents.map((d: any) => ({
        id: d.id,
        invoiceNumber: d.invoiceNumber,
        filename: d.filename,
        vendor: d.vendor,
        date: d.date,
        dueDate: d.dueDate,
        amount: d.amount,
        currency: d.currency,
        status: d.status,
        description: d.description
      }))
    };
  }
};

export const readDocumentTool: ToolDefinition = {
  name: 'read_document',
  description: 'Reads full details, itemized line items, vendor payment details, and banking information of a specific invoice document from the vault.',
  riskLevel: 'LOW',
  parameters: {
    type: 'object',
    properties: {
      documentId: {
        type: 'string',
        description: 'Invoice ID, invoice number, or filename (e.g. "INV-2024-001" or "invoice_001_acme_cloud.json")'
      }
    },
    required: ['documentId']
  },
  execute: async (args: any, context) => {
    const schema = z.object({
      documentId: z.string().min(1, 'documentId is required')
    });
    const parsed = schema.parse(args);
    const doc = context.environment.readDocument(parsed.documentId);
    if (!doc) {
      return {
        found: false,
        error: `Document '${parsed.documentId}' not found in company repository.`
      };
    }
    return {
      found: true,
      document: doc
    };
  }
};
