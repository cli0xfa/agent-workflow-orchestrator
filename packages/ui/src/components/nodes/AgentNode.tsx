import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Bot } from 'lucide-react'

export default memo(function AgentNode({ data }: { data: any }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '2px solid #3b82f6',
      borderRadius: 12,
      padding: '12px 16px',
      minWidth: 180,
      color: '#e2e8f0',
      fontSize: 13,
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#3b82f6' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Bot size={16} color="#3b82f6" />
        <strong style={{ fontSize: 14 }}>{data.label || 'Agent'}</strong>
      </div>
      <div style={{ fontSize: 11, color: '#64748b' }}>
        {data.model?.provider}/{data.model?.model || 'default'}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#3b82f6' }} />
    </div>
  )
})
