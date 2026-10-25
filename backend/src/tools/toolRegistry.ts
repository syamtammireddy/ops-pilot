import { ToolDefinition } from '../agent/types';
import { searchDocumentsTool, readDocumentTool } from './definitions/documentTools';
import { searchCompanyPolicyTool, readCompanyPolicyTool } from './definitions/policyTools';
import { 
  queryFinanceRecordsTool, 
  recordInvoiceTool, 
  executePaymentTool, 
  verifyPaymentStatusTool 
} from './definitions/financeTools';
import { sendNotificationTool, requestHumanApprovalTool } from './definitions/commsTools';

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    this.register(searchDocumentsTool);
    this.register(readDocumentTool);
    this.register(searchCompanyPolicyTool);
    this.readPolicyTool = readCompanyPolicyTool;
    this.register(readCompanyPolicyTool);
    this.register(queryFinanceRecordsTool);
    this.register(recordInvoiceTool);
    this.register(executePaymentTool);
    this.register(verifyPaymentStatusTool);
    this.register(sendNotificationTool);
    this.register(requestHumanApprovalTool);
  }

  private readPolicyTool: ToolDefinition;

  public register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
  }

  public getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Generates OpenAI-compatible tool specifications for the API.
   */
  public getOpenAIToolsSchema(): Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, any>;
    };
  }> {
    return this.getAllTools().map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));
  }
}

export const toolRegistryInstance = new ToolRegistry();
