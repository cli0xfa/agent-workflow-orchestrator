import { WorkflowNode, ExecutionContext, NodeExecutionResult, ToolNodeData } from '../types';
import { BaseNodeExecutor } from './base';

export class ToolNodeExecutor extends BaseNodeExecutor {
  async execute(node: WorkflowNode, ctx: ExecutionContext): Promise<NodeExecutionResult> {
    const data = node.data as ToolNodeData;
    const logs: string[] = [];

    try {
      logs.push(`[Tool:${node.id}] Type: ${data.toolType}`);

      let result: unknown;

      switch (data.toolType) {
        case 'http': {
          const { url, method = 'GET', headers = {}, body } = data.config;
          const interpolatedUrl = this.interpolateTemplate(url as string, ctx);
          const response = await fetch(interpolatedUrl, {
            method: method as string,
            headers: headers as Record<string, string>,
            body: body ? JSON.stringify(body) : undefined,
          });
          result = await response.json().catch(() => ({}));
          break;
        }
        case 'custom': {
          const { code } = data.config;
          if (typeof code === 'string') {
            // eslint-disable-next-line no-new-func
            const fn = new Function('ctx', 'variables', 'nodeOutputs', code);
            result = fn(ctx, ctx.variables, ctx.nodeOutputs);
          }
          break;
        }
        default:
          result = { message: 'MCP tools require external server connection', config: data.config };
      }

      logs.push(`[Tool:${node.id}] Completed`);
      return { success: true, output: result, logs };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logs.push(`[Tool:${node.id}] Error: ${msg}`);
      return { success: false, error: msg, logs };
    }
  }
}
