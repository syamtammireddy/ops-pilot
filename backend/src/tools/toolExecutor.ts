import { ToolRegistry, toolRegistryInstance } from './toolRegistry';
import { ToolExecutionContext } from '../agent/types';

export class ToolExecutor {
  constructor(private registry: ToolRegistry = toolRegistryInstance) {}

  public async execute(
    toolName: string, 
    args: Record<string, any>, 
    context: ToolExecutionContext
  ): Promise<{ success: boolean; result?: any; error?: string }> {
    const tool = this.registry.getTool(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool '${toolName}' not found in Tool Registry.`
      };
    }

    try {
      const result = await tool.execute(args, context);
      return {
        success: true,
        result
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || `Execution of tool '${toolName}' failed.`
      };
    }
  }
}

export const toolExecutorInstance = new ToolExecutor();
