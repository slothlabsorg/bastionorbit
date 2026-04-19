import React from 'react'

function AppLogo() {
  const [failed, setFailed] = React.useState(false)
  if (failed) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-primary">
        <rect x="2" y="3" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  return (
    <img
      src="/images/bastionorbit-icon.png"
      alt="Bastion Orbit"
      width={22} height={22}
      className="rounded-md object-cover flex-shrink-0"
      onError={() => setFailed(true)}
    />
  )
}

interface TitlebarProps {
  activeTunnelCount?: number
}

export function Titlebar({ activeTunnelCount = 0 }: TitlebarProps) {
  return (
    <div
      data-tauri-drag-region
      className="h-12 flex items-center px-4 border-b border-border-subtle bg-bg-base flex-shrink-0 select-none"
      style={{ paddingLeft: '80px' }}
    >
      {/* Center — brand */}
      <div className="flex-1 flex items-center justify-center gap-2">
        <AppLogo />
        <span className="font-display font-bold text-text-primary text-sm tracking-wide">Bastion Orbit</span>
      </div>

      {/* Right — active tunnels badge */}
      <div className="flex items-center gap-3">
        {activeTunnelCount > 0 ? (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-text-muted text-xs">
              {activeTunnelCount} tunnel{activeTunnelCount !== 1 ? 's' : ''} active
            </span>
          </div>
        ) : (
          <span className="text-text-muted text-xs">No active tunnels</span>
        )}
      </div>
    </div>
  )
}

export default Titlebar
