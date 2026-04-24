import { WorkflowNode, ExecutionContext, NodeExecutionResult, MemoryNodeData } from '../types';
import { BaseNodeExecutor } from './base';
import { MemoryManager } from '../memory';

export class MemoryNodeExecutor extends BaseNodeExecutor {
  async execute(node: WorkflowNode, ctx: ExecutionContext): Promise<NodeExecutionResult> {
    const data = node.data as MemoryNodeData;
    const logs: string[] = [];

    try {
      logs.push(`[Memory:${node.id}] Operation: ${data.operation}, Type: ${data.memoryType}`);

      let result: unknown;
      const key = data.key || node.id;

      switch (data.operation) {
        case 'store': {
          const input = ctx.nodeOutputs.get('__previous_output') || ctx.variables.input;
          if (data.memoryType === 'short-term') {
            MemoryManager.storeShortTerm(ctx, key, input, data.ttl);
          } else {
            MemoryManager.storeLongTerm(ctx, key, input);
          }
          result = { stored: true, key, type: data.memoryType };
          break;
        }
        case 'retrieve': {
          if (data.memoryType === 'short-term') {
            result = MemoryManager.retrieveShortTerm(ctx, key);
          } else {
            result = MemoryManager.retrieveLongTerm(ctx, key);
          }
          break;
        }
        case 'clear': {
          MemoryManager.clearMemory(ctx, data.memoryType);
          result = { cleared: true, type: data.memoryType };
          break;
        }
      }

      logs.push(`[Memory:${node.id}] Completed`);
      return { success: true, output: result, logs };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logs.push(`[Memory:${node.id}] Error: ${msg}`);
      return { success: false, error: msg, logs };
    }
  }
}
