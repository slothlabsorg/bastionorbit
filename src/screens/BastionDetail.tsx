import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Bastion, Tunnel, Target, TargetType } from '@/types'
import { StatusDot, TargetTypeBadge, TunnelStatusBadge } from '@/components/ui/Badge'
import { Callout } from '@/components/ui/Callout'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'

interface BastionDetailProps {
  bastion: Bastion
  tunnels: Tunnel[]
  onOpenTunnel: (bastionId: string, targetId: string, ttlMinutes: number) => void
  onStopTunnel: (id: string) => void
  onExtendTunnel: (id: string, minutes: number) => void
  onTestBastion: (id: string) => void
  onAddTarget: (target: Omit<Target, 'id'>) => void
}

// ── TTL remaining (one-liner for target row) ──────────────────────────────────

function ttlLabel(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0) return 'Expired'
  const m = Math.floor(ms / 60_000)
  const s = Math.floor((ms % 60_000) / 1000)
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

// ── SSH command for copying ───────────────────────────────────────────────────

function sshCommand(bastion: Bastion, target: Target): string {
  const portFlag = bastion.sshPort !== 22 ? ` -p ${bastion.sshPort}` : ''
  return `ssh -N -L ${target.localPort}:${target.remoteHost}:${target.remotePort} ${bastion.user}@${bastion.host}${portFlag} -i ${bastion.keyPath} -o ServerAliveInterval=60`
}

// ── Add target modal ──────────────────────────────────────────────────────────

const TARGET_TYPES: TargetType[] = ['postgres', 'mysql', 'redis', 'mongodb', 'http', 'other']
const TYPE_DEFAULTS: Record<TargetType, number> = {
  postgres: 5432, mysql: 3306, redis: 6379, mongodb: 27017, http: 8080, other: 0,
}

function AddTargetModal({ bastionId, onClose, onSave }: {
  bastionId: string
  onClose: () => void
  onSave: (t: Omit<Target, 'id'>) => void
}) {
  const [type, setType] = useState<TargetType>('postgres')
  const [name, setName] = useState('')
  const [remoteHost, setRemoteHost] = useState('')
  const [remotePort, setRemotePort] = useState(5432)
  const [localPort, setLocalPort] = useState(15432)

  function handleTypeChange(t: TargetType) {
    setType(t)
    setRemotePort(TYPE_DEFAULTS[t])
  }

  function handleSave() {
    onSave({ bastionId, name, type, remoteHost, remotePort, localPort })
    onClose()
  }

  const canSave = name.trim().length > 0 && remoteHost.trim().length > 0 && remotePort > 0 && localPort > 0

  return (
    <Modal open onClose={onClose} title="Add Target" width="w-[440px]">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Target name</label>
          <input className="field-input" placeholder="e.g. prod-postgres" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">Type</label>
          <div className="grid grid-cols-3 gap-2">
            {TARGET_TYPES.map(t => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`py-1.5 px-2 rounded-lg border text-xs font-medium capitalize transition-all ${
                  type === t
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-bg-surface text-text-secondary hover:border-primary/50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-text-secondary mb-1">Remote host</label>
            <input className="field-input font-mono" placeholder="db.internal" value={remoteHost} onChange={e => setRemoteHost(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Remote port</label>
            <input className="field-input font-mono" type="number" value={remotePort} onChange={e => setRemotePort(Number(e.target.value))} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Local port</label>
          <input className="field-input font-mono" type="number" value={localPort} onChange={e => setLocalPort(Number(e.target.value))} />
          <p className="text-text-muted text-[11px] mt-1">The port you'll connect to on localhost.</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-subtle">
        <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={!canSave}>Add target</Button>
      </div>
    </Modal>
  )
}

// ── Target row ────────────────────────────────────────────────────────────────

function TargetRow({ bastion, target, activeTunnel, onOpen, onStop, onExtend }: {
  bastion: Bastion
  target: Target
  activeTunnel?: Tunnel
  onOpen: (ttl: number) => void
  onStop: (id: string) => void
  onExtend: (id: string, minutes: number) => void
}) {
  const [copied, setCopied] = useState(false)
  const [showCmd, setShowCmd] = useState(false)
  const [ttlLabel_state, setTtlLabel] = useState(() => activeTunnel ? ttlLabel(activeTunnel.expiresAt) : '')

  // Update TTL every second when tunnel is active
  useState(() => {
    if (!activeTunnel) return
    const iv = setInterval(() => setTtlLabel(ttlLabel(activeTunnel.expiresAt)), 1_000)
    return () => clearInterval(iv)
  })

  async function copyCmd() {
    await navigator.clipboard.writeText(sshCommand(bastion, target))
    setCopied(true)
    setTimeout(() => setCopied(false), 2_000)
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-bg-surface">
      <div className="flex items-center gap-3 px-4 py-3">
        <TargetTypeBadge type={target.type} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-text-primary text-sm font-semibold">{target.name}</span>
            <TunnelStatusBadge active={!!activeTunnel} />
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-muted font-mono mt-0.5">
            <span>{target.remoteHost}:{target.remotePort}</span>
            <span>→</span>
            <span className="text-accent">localhost:{target.localPort}</span>
          </div>
        </div>

        {/* Controls */}
        {activeTunnel ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs font-mono text-text-secondary">{ttlLabel_state}</span>
            <Button size="xs" variant="secondary" onClick={() => onExtend(activeTunnel.id, 15)}>+15m</Button>
            <Button size="xs" variant="secondary" onClick={() => onExtend(activeTunnel.id, 30)}>+30m</Button>
            <Button size="xs" variant="danger" onClick={() => onStop(activeTunnel.id)}>Stop</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button size="xs" variant="primary" onClick={() => onOpen(30)} disabled={bastion.status === 'offline'}>30m</Button>
            <Button size="xs" variant="secondary" onClick={() => onOpen(60)} disabled={bastion.status === 'offline'}>1h</Button>
          </div>
        )}

        {/* Copy command */}
        <button
          onClick={copyCmd}
          className={`flex-shrink-0 p-1 rounded transition-colors ${copied ? 'text-success' : 'text-text-muted hover:text-text-primary'}`}
          title="Copy SSH command"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>

        <button
          onClick={() => setShowCmd(c => !c)}
          className="flex-shrink-0 p-1 text-text-muted hover:text-text-primary transition-colors"
          title="Show SSH command"
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${showCmd ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
      </div>

      {/* Progress bar for active tunnel */}
      {activeTunnel && (
        <div className="h-0.5 bg-bg-base mx-4 mb-1 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{
            width: `${Math.max(0, Math.min(100, (new Date(activeTunnel.expiresAt).getTime() - Date.now()) / (2 * 60 * 60_000) * 100))}%`,
          }} />
        </div>
      )}

      {/* SSH command */}
      <AnimatePresence>
        {showCmd && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-3 mt-1 rounded-lg bg-bg-base border border-border-subtle p-3">
              <code className="text-[11px] font-mono text-text-secondary break-all">{sshCommand(bastion, target)}</code>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── BastionDetail ──────────────────────────────────────────────────────────────

export function BastionDetail({
  bastion, tunnels, onOpenTunnel, onStopTunnel, onExtendTunnel, onTestBastion, onAddTarget,
}: BastionDetailProps) {
  const [testing, setTesting] = useState(false)
  const [addTargetOpen, setAddTargetOpen] = useState(false)

  async function handleTest() {
    setTesting(true)
    await onTestBastion(bastion.id)
    setTimeout(() => setTesting(false), 2_000)
  }

  if (bastion.targets.length === 0) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="px-6 py-5">
          <BastionHeader bastion={bastion} testing={testing} onTest={handleTest} onAddTarget={() => setAddTargetOpen(true)} />
          {bastion.status === 'offline' && (
            <div className="mt-4">
              <Callout variant="error" title="Bastion unreachable">
                Check that the host is correct and that your SSH key can authenticate.
              </Callout>
            </div>
          )}
          <div className="mt-8 flex items-center justify-center">
            <EmptyState
              variant="empty"
              title="No targets yet"
              description="Add a database or service behind this bastion to start tunneling."
              action={{ label: 'Add target', onClick: () => setAddTargetOpen(true) }}
            />
          </div>
        </div>
        {addTargetOpen && (
          <AddTargetModal bastionId={bastion.id} onClose={() => setAddTargetOpen(false)} onSave={onAddTarget} />
        )}
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-5">
        <BastionHeader bastion={bastion} testing={testing} onTest={handleTest} onAddTarget={() => setAddTargetOpen(true)} />

        {bastion.status === 'offline' && (
          <div className="mt-4">
            <Callout variant="error" title="Bastion unreachable">
              Tunnels cannot be opened while this bastion is offline.
            </Callout>
          </div>
        )}

        <div className="mt-5 space-y-2">
          {bastion.targets.map(target => {
            const activeTunnel = tunnels.find(t => t.targetId === target.id && t.status === 'active')
            return (
              <TargetRow
                key={target.id}
                bastion={bastion}
                target={target}
                activeTunnel={activeTunnel}
                onOpen={(ttl) => onOpenTunnel(bastion.id, target.id, ttl)}
                onStop={onStopTunnel}
                onExtend={onExtendTunnel}
              />
            )
          })}
        </div>
      </div>

      {addTargetOpen && (
        <AddTargetModal bastionId={bastion.id} onClose={() => setAddTargetOpen(false)} onSave={onAddTarget} />
      )}
    </div>
  )
}

function BastionHeader({ bastion, testing, onTest, onAddTarget }: {
  bastion: Bastion
  testing: boolean
  onTest: () => void
  onAddTarget: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <StatusDot status={bastion.status} />
          <h1 className="text-text-primary font-display font-bold text-lg">{bastion.name}</h1>
        </div>
        <p className="text-text-muted text-xs font-mono">
          {bastion.user}@{bastion.host}{bastion.sshPort !== 22 ? `:${bastion.sshPort}` : ''} · {bastion.keyPath}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button size="sm" variant="secondary" onClick={onTest} loading={testing}>
          {testing ? 'Testing…' : 'Test'}
        </Button>
        <Button size="sm" variant="primary" onClick={onAddTarget}>+ Target</Button>
      </div>
    </div>
  )
}

export default BastionDetail
