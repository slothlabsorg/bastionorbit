interface StatusBarProps {
  activeTunnelCount: number
  bastionCount: number
}

export function StatusBar({ activeTunnelCount, bastionCount }: StatusBarProps) {
  return (
    <div className="h-7 flex items-center justify-between px-4 border-t border-border-subtle bg-bg-base flex-shrink-0 select-none">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          {activeTunnelCount > 0 ? (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-text-secondary text-[11px] font-medium">
                {activeTunnelCount} active tunnel{activeTunnelCount !== 1 ? 's' : ''}
              </span>
            </>
          ) : (
            <>
              <div className="w-1.5 h-1.5 rounded-full bg-text-muted" />
              <span className="text-text-muted text-[11px]">No active tunnels</span>
            </>
          )}
        </div>
        <span className="text-text-muted text-[11px]">{bastionCount} bastion{bastionCount !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-text-muted text-[11px]">Bastion Orbit v0.1.0</span>
      </div>
    </div>
  )
}

export default StatusBar
