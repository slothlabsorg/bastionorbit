import { AnimatePresence } from 'framer-motion'
import type { Tunnel } from '@/types'
import { TunnelCard } from '@/components/ui/TunnelCard'
import { EmptyState } from '@/components/ui/EmptyState'

interface TunnelsProps {
  tunnels: Tunnel[]
  onStop: (id: string) => void
  onExtend: (id: string, minutes: number) => void
}

export function Tunnels({ tunnels, onStop, onExtend }: TunnelsProps) {
  const active = tunnels.filter(t => t.status === 'active')

  if (active.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <EmptyState
          variant="no-tunnels"
          title="No active tunnels"
          description="Open a tunnel from the Home screen or by clicking a bastion in the sidebar."
        />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-text-primary font-display font-bold text-lg">Active Tunnels</h1>
            <p className="text-text-muted text-xs mt-0.5">{active.length} tunnel{active.length !== 1 ? 's' : ''} running</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-success text-xs font-medium">{active.length} active</span>
          </div>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {active.map(tunnel => (
              <TunnelCard
                key={tunnel.id}
                tunnel={tunnel}
                onStop={onStop}
                onExtend={onExtend}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default Tunnels
