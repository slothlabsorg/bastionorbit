import { motion, AnimatePresence } from 'framer-motion'
import type { Bastion, Tunnel } from '@/types'
import { StatusDot, TargetTypeBadge } from '@/components/ui/Badge'
import { TunnelCard } from '@/components/ui/TunnelCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Callout } from '@/components/ui/Callout'
import Button from '@/components/ui/Button'

interface HomeProps {
  bastions: Bastion[]
  tunnels: Tunnel[]
  onSelectBastion: (id: string) => void
  onAddBastion: () => void
  onOpenTunnel?: (bastionId: string, targetId: string, ttlMinutes: number) => void
  onStopTunnel: (id: string) => void
  onExtendTunnel: (id: string, minutes: number) => void
}

// ── Bastion card ───────────────────────────────────────────────────────────────

function BastionCard({ bastion, activeTunnelCount, onSelect }: {
  bastion: Bastion
  activeTunnelCount: number
  onSelect: () => void
}) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="text-left p-4 rounded-xl border border-border bg-bg-surface hover:border-primary/50 hover:bg-bg-surface2 transition-colors group w-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <StatusDot status={bastion.status} />
          <span className="text-text-primary font-semibold text-sm truncate">{bastion.name}</span>
        </div>
        {activeTunnelCount > 0 && (
          <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] rounded-full bg-success/10 text-success border border-success/20 font-medium">
            {activeTunnelCount} active
          </span>
        )}
      </div>

      {/* Host info */}
      <p className="text-text-muted text-[11px] font-mono truncate mb-3">
        {bastion.user}@{bastion.host}{bastion.sshPort !== 22 ? `:${bastion.sshPort}` : ''}
      </p>

      {/* Target types */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {bastion.targets.map(t => (
          <TargetTypeBadge key={t.id} type={t.type} />
        ))}
        {bastion.targets.length === 0 && (
          <span className="text-text-muted text-[11px]">No targets</span>
        )}
      </div>

      {/* Key path */}
      <p className="text-text-muted text-[10px] font-mono mt-2 truncate">{bastion.keyPath}</p>

      {/* Offline warning */}
      {bastion.status === 'offline' && (
        <div className="mt-2 pt-2 border-t border-border-subtle flex items-center gap-1.5">
          <span className="text-danger text-[11px]">Unreachable</span>
        </div>
      )}
    </motion.button>
  )
}

// ── Home ───────────────────────────────────────────────────────────────────────

export function Home({ bastions, tunnels, onSelectBastion, onAddBastion, onStopTunnel, onExtendTunnel }: HomeProps) {
  if (bastions.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          variant="welcome"
          title="Welcome to Bastion Orbit"
          description="Add your first bastion host to start creating SSH tunnels to your databases and services."
          action={{ label: 'Add bastion', onClick: onAddBastion }}
        />
      </div>
    )
  }

  const activeTunnelsByBastion = bastions.reduce<Record<string, number>>((acc, b) => {
    acc[b.id] = tunnels.filter(t => t.bastionId === b.id && t.status === 'active').length
    return acc
  }, {})

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-5 space-y-6">

        {/* Active tunnels section */}
        <AnimatePresence>
          {tunnels.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <h2 className="text-text-primary font-display font-bold text-sm">Active Tunnels</h2>
                </div>
                <span className="text-text-muted text-xs">{tunnels.filter(t => t.status === 'active').length} running</span>
              </div>
              <div className="space-y-2">
                {tunnels.filter(t => t.status === 'active').map(tunnel => (
                  <TunnelCard
                    key={tunnel.id}
                    tunnel={tunnel}
                    onStop={onStopTunnel}
                    onExtend={onExtendTunnel}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bastions grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-text-primary font-display font-bold text-lg">Bastions</h1>
              <p className="text-text-muted text-xs mt-0.5">{bastions.length} bastion{bastions.length !== 1 ? 's' : ''}</p>
            </div>
            <Button variant="primary" size="sm" onClick={onAddBastion}>+ Add bastion</Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {bastions.map((bastion, i) => (
              <motion.div
                key={bastion.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {bastion.status === 'offline' && (
                  <div className="mb-1">
                    <Callout variant="error">
                      <strong>{bastion.name}</strong> is unreachable. Check host and key.
                    </Callout>
                  </div>
                )}
                <BastionCard
                  bastion={bastion}
                  activeTunnelCount={activeTunnelsByBastion[bastion.id] ?? 0}
                  onSelect={() => onSelectBastion(bastion.id)}
                />
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Home
