import { WorkflowNode, ExecutionContext, NodeExecutionResult } from '../types';

export abstract class BaseNodeExecutor {
  abstract execute(node: WorkflowNode, ctx: ExecutionContext): Promise<NodeExecutionResult>;

  protected interpolateTemplate(template: string, ctx: ExecutionContext): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const value = ctx.variables[key] ?? ctx.nodeOutputs.get(key);
      return value !== undefined ? String(value) : `{{${key}}}`;
    });
  }
}
