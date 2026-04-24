import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  ExecutionContext,
  ExecutionResult,
  NodeExecutionResult,
  MemoryStore,
} from '../types';
import { MemoryManager } from '../memory';
import { AgentNodeExecutor } from '../nodes/agent';
import { ToolNodeExecutor } from '../nodes/tool';
import { MemoryNodeExecutor } from '../nodes/memory';
import { ConditionNodeExecutor } from '../nodes/condition';
import { v4 as uuidv4 } from 'uuid';

const nodeExecutors: Record<string, any> = {
  agent: new AgentNodeExecutor(),
  tool: new ToolNodeExecutor(),
  memory: new MemoryNodeExecutor(),
  condition: new ConditionNodeExecutor(),
};

export class WorkflowExecutor {
  async execute(
    workflow: Workflow,
    inputVariables: Record<string, unknown> = {}
  ): Promise<ExecutionResult> {
    const runId = uuidv4();
    const startTime = new Date();

    const ctx: ExecutionContext = {
      workflowId: workflow.id,
      runId,
      variables: { ...workflow.variables, ...inputVariables },
      nodeOutputs: new Map(),
      memory: MemoryManager.createContextMemory(),
      metadata: {},
    };

    const result: ExecutionResult = {
      runId,
      workflowId: workflow.id,
      status: 'running',
      outputs: {},
      nodeResults: new Map(),
      startTime,
    };

    try {
      // Build adjacency list
      const adjacency = this.buildAdjacency(workflow.nodes, workflow.edges);
      const nodeMap = new Map(workflow.nodes.map(n => [n.id, n]));

      // Find start node
      const startNode = workflow.nodes.find(n => n.type === 'start');
      if (!startNode) {
        throw new Error('Workflow must have a start node');
      }

      // BFS execution
      const queue: string[] = [startNode.id];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const nodeId = queue.shift()!;
        if (visited.has(nodeId)) continue;
        visited.add(nodeId);

        const node = nodeMap.get(nodeId);
        if (!node) continue;

        // Execute node
        const nodeResult = await this.executeNode(node, ctx);
        result.nodeResults.set(nodeId, nodeResult);

        if (!nodeResult.success && node.type !== 'condition') {
          result.status = 'failed';
          result.error = nodeResult.error;
          break;
        }

        ctx.nodeOutputs.set(nodeId, nodeResult.output);

        // If start node, set input as previous output
        if (node.type === 'start') {
          ctx.nodeOutputs.set('__previous_output', inputVariables.input || inputVariables);
        }

        // Route to next nodes
        const nextNodes = adjacency.get(nodeId) || [];
        for (const { target, edge } of nextNodes) {
          if (node.type === 'condition' && edge.condition) {
            const conditionResult = nodeResult.output as { conditionResult: boolean };
            if (edge.condition === 'true' && !conditionResult?.conditionResult) continue;
            if (edge.condition === 'false' && conditionResult?.conditionResult) continue;
          }
          if (!visited.has(target)) {
            queue.push(target);
          }
        }
      }

      // Collect outputs from end nodes
      const endNodes = workflow.nodes.filter(n => n.type === 'end');
      for (const endNode of endNodes) {
        const prevEdges = workflow.edges.filter(e => e.target === endNode.id);
        for (const edge of prevEdges) {
          const output = ctx.nodeOutputs.get(edge.source);
          if (output !== undefined) {
            result.outputs[endNode.id] = output;
          }
        }
      }

      if (result.status === 'running') {
        result.status = 'success';
      }
    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : String(error);
    }

    result.endTime = new Date();
    return result;
  }

  private buildAdjacency(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): Map<string, Array<{ target: string; edge: WorkflowEdge }>> {
    const adj = new Map<string, Array<{ target: string; edge: WorkflowEdge }>>();
    for (const edge of edges) {
      if (!adj.has(edge.source)) {
        adj.set(edge.source, []);
      }
      adj.get(edge.source)!.push({ target: edge.target, edge });
    }
    return adj;
  }

  private async executeNode(node: WorkflowNode, ctx: ExecutionContext): Promise<NodeExecutionResult> {
    if (node.type === 'start' || node.type === 'end') {
      return { success: true, output: ctx.nodeOutputs.get('__previous_output') };
    }

    const executor = nodeExecutors[node.type];
    if (!executor) {
      return { success: false, error: `No executor for node type: ${node.type}` };
    }

    return executor.execute(node, ctx);
  }
}
