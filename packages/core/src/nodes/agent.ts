import { WorkflowNode, ExecutionContext, NodeExecutionResult, AgentNodeData } from '../types';
import { BaseNodeExecutor } from './base';
import { getProvider } from '../providers';
import { MemoryManager } from '../memory';

export class AgentNodeExecutor extends BaseNodeExecutor {
  async execute(node: WorkflowNode, ctx: ExecutionContext): Promise<NodeExecutionResult> {
    const data = node.data as AgentNodeData;
    const logs: string[] = [];

    try {
      logs.push(`[Agent:${node.id}] Using ${data.model.provider}/${data.model.model}`);

      // Interpolate system prompt with context
      const systemPrompt = this.interpolateTemplate(data.systemPrompt, ctx);

      // Build message history from short-term memory
      const history = MemoryManager.retrieveShortTerm(ctx, `_chat_${node.id}`) as Array<{role: string; content: string}> || [];

      // Get input from previous nodes or variables
      let userContent = '';
      const prevOutput = ctx.nodeOutputs.get('__previous_output');
      if (prevOutput) {
        userContent = String(prevOutput);
      } else {
        userContent = this.interpolateTemplate('{{input}}', ctx);
      }

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userContent },
      ];

      const provider = getProvider(data.model);
      const response = await provider.chat(messages, data.model);

      // Store in short-term memory
      const newHistory = [
        ...history,
        { role: 'user', content: userContent },
        { role: 'assistant', content: response.content },
      ].slice(-10); // Keep last 10 messages
      MemoryManager.storeShortTerm(ctx, `_chat_${node.id}`, newHistory);

      logs.push(`[Agent:${node.id}] Completed, tokens: ${response.usage?.totalTokens || '?'}`);

      return {
        success: true,
        output: response.content,
        logs,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logs.push(`[Agent:${node.id}] Error: ${msg}`);
      return { success: false, error: msg, logs };
    }
  }
}
