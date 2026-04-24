import { useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
} from '@xyflow/react'
import { Workflow, WorkflowNode } from '../types'
import AgentNode from './nodes/AgentNode'
import ToolNode from './nodes/ToolNode'
import MemoryNode from './nodes/MemoryNode'
import StartNode from './nodes/StartNode'
import EndNode from './nodes/EndNode'
import ConditionNode from './nodes/ConditionNode'

const nodeTypes = {
  agent: AgentNode,
  tool: ToolNode,
  memory: MemoryNode,
  start: StartNode,
  end: EndNode,
  condition: ConditionNode,
}

interface Props {
  workflow: Workflow
  setWorkflow: (w: Workflow) => void
  selectedNode: WorkflowNode | null
  setSelectedNode: (n: WorkflowNode | null) => void
}

export default function FlowEditor({ workflow, setWorkflow, setSelectedNode }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow.nodes as Node[])
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow.edges as Edge[])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdges = addEdge(params, edges)
      setEdges(newEdges)
      setWorkflow({ ...workflow, edges: newEdges as any })
    },
    [edges, setEdges, workflow, setWorkflow]
  )

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      const wfNode = workflow.nodes.find(n => n.id === node.id)
      if (wfNode) setSelectedNode(wfNode)
    },
    [workflow.nodes, setSelectedNode]
  )

  const onNodesChangeWrapped = useCallback(
    (changes: any) => {
      onNodesChange(changes)
      // Sync back to workflow
      const updatedNodes = nodes.map((n, i) => {
        const change = changes.find((c: any) => c.id === n.id && c.type === 'position')
        if (change) return { ...n, position: change.position }
        return n
      })
      setWorkflow({ ...workflow, nodes: updatedNodes as any })
    },
    [nodes, onNodesChange, workflow, setWorkflow]
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChangeWrapped}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      fitView
      style={{ background: '#0f172a' }}
    >
      <Background color="#334155" gap={16} />
      <Controls style={{ background: '#1e293b', color: '#e2e8f0' }} />
      <MiniMap
        style={{ background: '#1e293b' }}
        nodeColor={(node) => {
          switch (node.type) {
            case 'agent': return '#3b82f6'
            case 'tool': return '#10b981'
            case 'memory': return '#f59e0b'
            case 'condition': return '#8b5cf6'
            case 'start': return '#22c55e'
            case 'end': return '#ef4444'
            default: return '#64748b'
          }
        }}
      />
    </ReactFlow>
  )
}
