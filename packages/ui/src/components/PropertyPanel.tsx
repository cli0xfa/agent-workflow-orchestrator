import { useState } from 'react'
import { Workflow, WorkflowNode } from '../types'
import { Play, Save, Download } from 'lucide-react'

interface Props {
  selectedNode: WorkflowNode | null
  updateNodeData: (nodeId: string, data: any) => void
  workflow: Workflow
}

export default function PropertyPanel({ selectedNode, updateNodeData, workflow }: Props) {
  const [runResult, setRunResult] = useState<any>(null)
  const [running, setRunning] = useState(false)

  const runWorkflow = async () => {
    setRunning(true)
    setRunResult(null)
    try {
      const res = await fetch(`/api/workflows/${workflow.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: 'Hello from the workflow editor!' }),
      })
      const data = await res.json()
      setRunResult(data)
    } catch (e) {
      setRunResult({ error: String(e) })
    }
    setRunning(false)
  }

  const exportWorkflow = () => {
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflow.id}.json`
    a.click()
  }

  if (!selectedNode) {
    return (
      <div style={{
        width: 300,
        background: '#1e293b',
        borderLeft: '1px solid #334155',
        padding: 16,
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, color: '#94a3b8' }}>Properties</h3>
        <p style={{ color: '#64748b', fontSize: 13 }}>Select a node to edit properties</p>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={runWorkflow} disabled={running} style={btnStyle(running ? '#475569' : '#3b82f6')}>
            <Play size={14} /> {running ? 'Running...' : 'Run Workflow'}
          </button>
          <button onClick={exportWorkflow} style={btnStyle('#0f172a')}>
            <Download size={14} /> Export JSON
          </button>
        </div>

        {runResult && (
          <div style={{ marginTop: 16, padding: 12, background: '#0f172a', borderRadius: 8, fontSize: 12 }}>
            <pre style={{ margin: 0, color: '#e2e8f0', overflow: 'auto' }}>{JSON.stringify(runResult, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  const data = selectedNode.data

  return (
    <div style={{
      width: 300,
      background: '#1e293b',
      borderLeft: '1px solid #334155',
      padding: 16,
      overflow: 'auto',
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 14, color: '#94a3b8' }}>
        {data.label || selectedNode.type} Properties
      </h3>

      <Field label="Label">
        <input
          value={data.label || ''}
          onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
          style={inputStyle}
        />
      </Field>

      {selectedNode.type === 'agent' && (
        <>
          <Field label="Model Provider">
            <select
              value={data.model?.provider || 'openai'}
              onChange={(e) => updateNodeData(selectedNode.id, {
                model: { ...data.model, provider: e.target.value }
              })}
              style={inputStyle}
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="deepseek">DeepSeek</option>
              <option value="ollama">Ollama</option>
            </select>
          </Field>
          <Field label="Model">
            <input
              value={data.model?.model || ''}
              onChange={(e) => updateNodeData(selectedNode.id, {
                model: { ...data.model, model: e.target.value }
              })}
              style={inputStyle}
              placeholder="gpt-4o-mini, claude-3-5-sonnet..."
            />
          </Field>
          <Field label="System Prompt">
            <textarea
              value={data.systemPrompt || ''}
              onChange={(e) => updateNodeData(selectedNode.id, { systemPrompt: e.target.value })}
              style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
            />
          </Field>
          <Field label="Temperature">
            <input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={data.temperature ?? 0.7}
              onChange={(e) => updateNodeData(selectedNode.id, { temperature: parseFloat(e.target.value) })}
              style={inputStyle}
            />
          </Field>
        </>
      )}

      {selectedNode.type === 'tool' && (
        <>
          <Field label="Tool Type">
            <select
              value={data.toolType || 'http'}
              onChange={(e) => updateNodeData(selectedNode.id, { toolType: e.target.value })}
              style={inputStyle}
            >
              <option value="http">HTTP Request</option>
              <option value="mcp">MCP Server</option>
              <option value="custom">Custom Code</option>
            </select>
          </Field>
        </>
      )}

      {selectedNode.type === 'memory' && (
        <>
          <Field label="Memory Type">
            <select
              value={data.memoryType || 'short-term'}
              onChange={(e) => updateNodeData(selectedNode.id, { memoryType: e.target.value })}
              style={inputStyle}
            >
              <option value="short-term">Short-term</option>
              <option value="long-term">Long-term</option>
            </select>
          </Field>
          <Field label="Operation">
            <select
              value={data.operation || 'store'}
              onChange={(e) => updateNodeData(selectedNode.id, { operation: e.target.value })}
              style={inputStyle}
            >
              <option value="store">Store</option>
              <option value="retrieve">Retrieve</option>
              <option value="clear">Clear</option>
            </select>
          </Field>
        </>
      )}

      {selectedNode.type === 'condition' && (
        <Field label="Expression">
          <input
            value={data.expression || ''}
            onChange={(e) => updateNodeData(selectedNode.id, { expression: e.target.value })}
            style={inputStyle}
            placeholder="{{score}} > 0.5"
          />
        </Field>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: '#0f172a',
  border: '1px solid #334155',
  borderRadius: 6,
  color: '#e2e8f0',
  fontSize: 13,
  boxSizing: 'border-box',
  outline: 'none',
}

function btnStyle(bg: string): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '10px 16px',
    background: bg,
    border: '1px solid #334155',
    borderRadius: 6,
    color: '#e2e8f0',
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 500,
  }
}
