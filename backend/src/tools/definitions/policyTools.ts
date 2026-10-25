import { z } from 'zod';
import { ToolDefinition } from '../../agent/types';

export const searchCompanyPolicyTool: ToolDefinition = {
  name: 'search_company_policy',
  description: 'Searches internal company operating procedures, finance SOPs, approval thresholds, duplicate prevention rules, and payment verification guidelines.',
  riskLevel: 'LOW',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Policy topic or keyword (e.g. "threshold", "approval", "duplicate", "verification", "limits")'
      }
    }
  },
  execute: async (args: any, context) => {
    const schema = z.object({
      query: z.string().optional()
    });
    const parsed = schema.parse(args);
    const result = context.environment.searchCompanyPolicy(parsed.query);
    return result;
  }
};

export const readCompanyPolicyTool: ToolDefinition = {
  name: 'read_company_policy',
  description: 'Reads company operating policy or specific SOP clauses to understand business rules, spending authority, and compliance checks.',
  riskLevel: 'LOW',
  parameters: {
    type: 'object',
    properties: {
      sectionName: {
        type: 'string',
        description: 'Optional section heading such as "Approval Thresholds", "Duplicate Prevention", "Verification", or leave empty to read entire policy'
      }
    }
  },
  execute: async (args: any, context) => {
    const schema = z.object({
      sectionName: z.string().optional()
    });
    const parsed = schema.parse(args);
    const content = context.environment.readCompanyPolicy(parsed.sectionName);
    return {
      section: parsed.sectionName || 'FULL_POLICY',
      policyContent: content
    };
  }
};
