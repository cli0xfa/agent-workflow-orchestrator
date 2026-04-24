import { WorkflowNode, ExecutionContext, NodeExecutionResult, ConditionNodeData } from '../types';
import { BaseNodeExecutor } from './base';

export class ConditionNodeExecutor extends BaseNodeExecutor {
  async execute(node: WorkflowNode, ctx: ExecutionContext): Promise<NodeExecutionResult> {
    const data = node.data as ConditionNodeData;
    const logs: string[] = [];

    try {
      logs.push(`[Condition:${node.id}] Expression: ${data.expression}`);

      // Interpolate expression
      const expr = this.interpolateTemplate(data.expression, ctx);

      // Simple condition evaluation - supports variable checks
      let result = false;
      if (expr.includes('==')) {
        const [left, right] = expr.split('==').map(s => s.trim());
        result = left === right;
      } else if (expr.includes('!=')) {
        const [left, right] = expr.split('!=').map(s => s.trim());
        result = left !== right;
      } else if (expr.includes('>')) {
        const [left, right] = expr.split('>').map(s => parseFloat(s.trim()));
        result = left > right;
      } else if (expr.includes('<')) {
        const [left, right] = expr.split('<').map(s => parseFloat(s.trim()));
        result = left < right;
      } else {
        // Truthy check
        result = !!expr && expr !== 'false' && expr !== 'undefined' && expr !== 'null';
      }

      logs.push(`[Condition:${node.id}] Result: ${result}`);
      return { success: true, output: { conditionResult: result }, logs };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logs.push(`[Condition:${node.id}] Error: ${msg}`);
      return { success: false, error: msg, logs };
    }
  }
}
