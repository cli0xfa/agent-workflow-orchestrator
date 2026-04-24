import { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import FlowEditor from './components/FlowEditor'
import NodePanel from './components/NodePanel'
import PropertyPanel from './components/PropertyPanel'
import { Workflow, WorkflowNode, WorkflowEdge } from './types'

function App() {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null)
  const [workflow, setWorkflow] = useState<Workflow>({
    id: 'demo',
    name: 'New Workflow',
    description: '',
    nodes: [
      { id: 'start', type: 'start', position: { x: 100, y: 200 }, data: { label: 'Start' } },
      { id: 'agent1', type: 'agent', position: { x: 300, y: 200 }, data: { label: 'Agent', model: { provider: 'openai', model: 'gpt-4o-mini' }, systemPrompt: 'You are a helpful assistant.' } },
      { id: 'end', type: 'end', position: { x: 500, y: 200 }, data: { label: 'End' } },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'agent1' },
      { id: 'e2', source: 'agent1', target: 'end' },
    ],
  })

  const updateNodeData = (nodeId: string, data: any) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n),
    }))
    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...data } } : null)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#0f172a' }}>
      <ReactFlowProvider>
        <NodePanel />
        <div style={{ flex: 1, position: 'relative' }}>
          <FlowEditor
            workflow={workflow}
            setWorkflow={setWorkflow}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
          />
        </div>
        <PropertyPanel
          selectedNode={selectedNode}
          updateNodeData={updateNodeData}
          workflow={workflow}
        />
      </ReactFlowProvider>
    </div>
  )
}

export default App
