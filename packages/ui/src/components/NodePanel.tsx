import { Bot, Wrench, Brain, GitBranch, Play, Square } from 'lucide-react'

const nodeTypes = [
  { type: 'agent', label: 'Agent', icon: Bot, color: '#3b82f6', desc: 'LLM-powered agent' },
  { type: 'tool', label: 'Tool', icon: Wrench, color: '#10b981', desc: 'External tool call' },
  { type: 'memory', label: 'Memory', icon: Brain, color: '#f59e0b', desc: 'Store/retrieve context' },
  { type: 'condition', label: 'Condition', icon: GitBranch, color: '#8b5cf6', desc: 'Branch logic' },
  { type: 'start', label: 'Start', icon: Play, color: '#22c55e', desc: 'Entry point' },
  { type: 'end', label: 'End', icon: Square, color: '#ef4444', desc: 'Exit point' },
]

export default function NodePanel() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div style={{
      width: 220,
      background: '#1e293b',
      borderRight: '1px solid #334155',
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 14, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Nodes</h3>
      {nodeTypes.map((nt) => {
        const Icon = nt.icon
        return (
          <div
            key={nt.type}
            draggable
            onDragStart={(e) => onDragStart(e, nt.type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              background: '#0f172a',
              borderRadius: 8,
              border: '1px solid #334155',
              cursor: 'grab',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = nt.color
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = '#334155'
            }}
          >
            <Icon size={18} color={nt.color} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{nt.label}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{nt.desc}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
