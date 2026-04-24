import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Wrench } from 'lucide-react'

export default memo(function ToolNode({ data }: { data: any }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '2px solid #10b981',
      borderRadius: 12,
      padding: '12px 16px',
      minWidth: 180,
      color: '#e2e8f0',
      fontSize: 13,
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#10b981' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Wrench size={16} color="#10b981" />
        <strong style={{ fontSize: 14 }}>{data.label || 'Tool'}</strong>
      </div>
      <div style={{ fontSize: 11, color: '#64748b' }}>{data.toolType || 'http'}</div>
      <Handle type="source" position={Position.Right} style={{ background: '#10b981' }} />
    </div>
  )
})
