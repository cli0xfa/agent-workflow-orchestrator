import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Brain } from 'lucide-react'

export default memo(function MemoryNode({ data }: { data: any }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '2px solid #f59e0b',
      borderRadius: 12,
      padding: '12px 16px',
      minWidth: 180,
      color: '#e2e8f0',
      fontSize: 13,
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#f59e0b' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Brain size={16} color="#f59e0b" />
        <strong style={{ fontSize: 14 }}>{data.label || 'Memory'}</strong>
      </div>
      <div style={{ fontSize: 11, color: '#64748b' }}>
        {data.operation} / {data.memoryType}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#f59e0b' }} />
    </div>
  )
})
