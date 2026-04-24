import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Square } from 'lucide-react'

export default memo(function EndNode({ data }: { data: any }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '2px solid #ef4444',
      borderRadius: 50,
      padding: '12px 24px',
      color: '#e2e8f0',
      fontSize: 13,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#ef4444' }} />
      <Square size={16} color="#ef4444" />
      <strong>{data.label || 'End'}</strong>
    </div>
  )
})
