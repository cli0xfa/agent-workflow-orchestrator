import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Play } from 'lucide-react'

export default memo(function StartNode({ data }: { data: any }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '2px solid #22c55e',
      borderRadius: 50,
      padding: '12px 24px',
      color: '#e2e8f0',
      fontSize: 13,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      <Play size={16} color="#22c55e" />
      <strong>{data.label || 'Start'}</strong>
      <Handle type="source" position={Position.Right} style={{ background: '#22c55e' }} />
    </div>
  )
})
