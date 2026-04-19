import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Tunnel, TargetType } from '@/types'
import Button from './Button'
import { TargetTypeBadge } from './Badge'

function targetIcon(type: TargetType) {
  const icons: Record<TargetType, string> = {
    postgres: '🐘',
    mysql:    '🐬',
    redis:    '🔴',
    mongodb:  '🍃',
    http:     '🌐',
    other:    '⚡',
  }
  return icons[type]
}

function formatTtl(expiresAt: string): { label: string; pct: number; urgent: boolean } {
  const now = Date.now()
  const expires = new Date(expiresAt).getTime()
  const msLeft = expires - now

  if (msLeft <= 0) return { label: 'Expired', pct: 0, urgent: true }

  const minLeft = Math.floor(msLeft / 60_000)
  const secLeft = Math.floor((msLeft % 60_000) / 1_000)
  const label = minLeft > 0 ? `${minLeft}m ${secLeft}s` : `${secLeft}s`

  // Assume max TTL of 2h = 7200000ms for progress bar
  const maxMs = 2 * 60 * 60_000
  const pct = Math.max(0, Math.min(100, (msLeft / maxMs) * 100))
  return { label, pct, urgent: minLeft < 5 }
}

function sshCommand(tunnel: Tunnel): string {
  return `ssh -L ${tunnel.localPort}:${tunnel.remoteHost}:${tunnel.remotePort} ${tunnel.bastionName} -N -o ServerAliveInterval=60`
}

interface TunnelCardProps {
  tunnel: Tunnel
  onStop: (id: string) => void
  onExtend: (id: string, minutes: number) => void
}

export function TunnelCard({ tunnel, onStop, onExtend }: TunnelCardProps) {
  const [ttl, setTtl] = useState(() => formatTtl(tunnel.expiresAt))
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTtl(formatTtl(tunnel.expiresAt))
    }, 1_000)
    return () => clearInterval(interval)
  }, [tunnel.expiresAt])

  async function copyCommand() {
    await navigator.clipboard.writeText(sshCommand(tunnel))
    setCopied(true)
    setTimeout(() => setCopied(false), 2_000)
  }

  return (
    <motion.div
      layout
      className={`rounded-xl border ${ttl.urgent ? 'border-warning/40' : 'border-border'} bg-bg-surface overflow-hidden`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Type icon */}
        <span className="text-lg flex-shrink-0 leading-none">{targetIcon(tunnel.targetType)}</span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <TargetTypeBadge type={tunnel.targetType} />
            <span className="text-text-primary text-xs font-semibold truncate">{tunnel.targetName}</span>
            <span className="text-text-muted text-[10px]">{tunnel.bastionName}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-muted font-mono">
            <span className="text-accent">:{tunnel.localPort}</span>
            <span>→</span>
            <span>{tunnel.remoteHost}:{tunnel.remotePort}</span>
          </div>
        </div>

        {/* TTL + controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <p className={`text-xs font-mono font-medium ${ttl.urgent ? 'text-warning' : 'text-text-primary'}`}>
              {ttl.label}
            </p>
            <p className="text-[10px] text-text-muted">remaining</p>
          </div>

          <Button size="xs" variant="secondary" onClick={() => onExtend(tunnel.id, 15)}>+15m</Button>
          <Button size="xs" variant="secondary" onClick={() => onExtend(tunnel.id, 30)}>+30m</Button>
          <Button size="xs" variant="danger" onClick={() => onStop(tunnel.id)}>Stop</Button>

          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1 text-text-muted hover:text-text-primary transition-colors"
            title="Show SSH command"
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </div>

      {/* TTL progress bar */}
      <div className="h-0.5 bg-bg-base mx-4 mb-1 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${ttl.urgent ? 'bg-warning' : 'bg-primary'}`}
          animate={{ width: `${ttl.pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Expanded: SSH command */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mx-4 mb-3 mt-1 rounded-lg bg-bg-base border border-border-subtle p-3 flex items-start justify-between gap-3">
              <code className="text-[11px] text-text-secondary font-mono leading-relaxed break-all flex-1">
                {sshCommand(tunnel)}
              </code>
              <button
                onClick={copyCommand}
                className={`flex-shrink-0 text-xs px-2 py-1 rounded border transition-colors ${
                  copied
                    ? 'border-success/40 text-success bg-success/10'
                    : 'border-border text-text-muted hover:text-text-primary hover:border-primary/50'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default TunnelCard
