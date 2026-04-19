import type { BastionStatus, TargetType } from '@/types'

export function StatusDot({ status }: { status: BastionStatus }) {
  const colors: Record<BastionStatus, string> = {
    online:   'bg-success',
    offline:  'bg-danger',
    checking: 'bg-warning animate-pulse',
    unknown:  'bg-text-muted',
  }
  return <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${colors[status]}`} />
}

export function TargetTypeBadge({ type }: { type: TargetType }) {
  const map: Record<TargetType, { label: string; color: string }> = {
    postgres: { label: 'PG',    color: 'text-info bg-info/10 border-info/20' },
    mysql:    { label: 'MySQL', color: 'text-warning bg-warning/10 border-warning/20' },
    redis:    { label: 'Redis', color: 'text-danger bg-danger/10 border-danger/20' },
    mongodb:  { label: 'Mongo', color: 'text-success bg-success/10 border-success/20' },
    http:     { label: 'HTTP',  color: 'text-accent bg-accent/10 border-accent/20' },
    other:    { label: 'Other', color: 'text-text-muted bg-bg-surface border-border' },
  }
  const { label, color } = map[type]
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${color}`}>
      {label}
    </span>
  )
}

export function TunnelStatusBadge({ active }: { active: boolean }) {
  return active
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/10 text-success border border-success/20"><span className="w-1 h-1 rounded-full bg-success animate-pulse" />Active</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-bg-surface text-text-muted border border-border">Idle</span>
}
