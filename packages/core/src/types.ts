/**
 * Core type definitions for the workflow orchestrator
 */

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: AgentNodeData | ToolNodeData | MemoryNodeData | ConditionNodeData | StartNodeData | EndNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, unknown>;
}

export type NodeType = 'start' | 'agent' | 'tool' | 'memory' | 'condition' | 'end';

export interface BaseNodeData {
  label: string;
}

export interface StartNodeData extends BaseNodeData {
  inputSchema?: Record<string, string>;
}

export interface AgentNodeData extends BaseNodeData {
  model: ModelConfig;
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
}

export interface ToolNodeData extends BaseNodeData {
  toolType: 'mcp' | 'http' | 'custom';
  config: Record<string, unknown>;
}

export interface MemoryNodeData extends BaseNodeData {
  memoryType: 'short-term' | 'long-term';
  operation: 'store' | 'retrieve' | 'clear';
  key?: string;
  ttl?: number;
}

export interface ConditionNodeData extends BaseNodeData {
  expression: string;
}

export interface EndNodeData extends BaseNodeData {
  outputMapping?: Record<string, string>;
}

export interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'deepseek' | 'ollama';
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface ExecutionContext {
  workflowId: string;
  runId: string;
  variables: Record<string, unknown>;
  nodeOutputs: Map<string, unknown>;
  memory: MemoryStore;
  metadata: Record<string, unknown>;
}

export interface MemoryStore {
  shortTerm: Map<string, { value: unknown; timestamp: number }>;
  longTerm: Map<string, unknown>;
}

export interface NodeExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  logs?: string[];
}

export interface ExecutionResult {
  runId: string;
  workflowId: string;
  status: 'success' | 'failed' | 'running';
  outputs: Record<string, unknown>;
  nodeResults: Map<string, NodeExecutionResult>;
  startTime: Date;
  endTime?: Date;
  error?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}
