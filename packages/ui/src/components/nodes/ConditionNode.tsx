import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { GitBranch } from 'lucide-react'

export default memo(function ConditionNode({ data }: { data: any }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '2px solid #8b5cf6',
      borderRadius: 8,
      padding: '12px 16px',
      minWidth: 180,
      color: '#e2e8f0',
      fontSize: 13,
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#8b5cf6' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <GitBranch size={16} color="#8b5cf6" />
        <strong style={{ fontSize: 14 }}>{data.label || 'Condition'}</strong>
      </div>
      <div style={{ fontSize: 11, color: '#64748b', wordBreak: 'break-all' }}>
        {data.expression || 'true'}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#8b5cf6' }} />
    </div>
  )
})
