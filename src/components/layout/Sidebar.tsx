import { motion } from 'framer-motion'
import type { Screen, Bastion } from '@/types'
import { StatusDot } from '@/components/ui/Badge'

interface SidebarProps {
  screen: Screen
  onNavigate: (screen: Screen) => void
  collapsed: boolean
  onToggleCollapse: () => void
  bastions: Bastion[]
  activeBastionId: string | null
  onSelectBastion: (id: string) => void
  onAddBastion: () => void
  newsUnread?: number
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconHome() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function IconTunnel() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
  )
}

function IconSettings() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  )
}

function IconBook() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  )
}

function IconHeart() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  )
}

function IconPlus() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}

function IconNews() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>
    </svg>
  )
}

function IconCollapse({ collapsed }: { collapsed: boolean }) {
  return (
    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

function IconServer() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
      <line x1="6" y1="6" x2="6.01" y2="6"/>
      <line x1="6" y1="18" x2="6.01" y2="18"/>
    </svg>
  )
}

// ── Bastion item ──────────────────────────────────────────────────────────────

function BastionItem({
  bastion,
  isActive,
  collapsed,
  onSelect,
}: {
  bastion: Bastion
  isActive: boolean
  collapsed: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md transition-colors text-left ${
        isActive
          ? 'bg-primary/10 text-text-primary'
          : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
      }`}
      style={{ width: collapsed ? '36px' : 'calc(100% - 8px)', margin: '0 4px' }}
      title={collapsed ? bastion.name : undefined}
    >
      <span className="flex-shrink-0 text-text-muted"><IconServer /></span>
      {!collapsed && (
        <>
          <span className="flex-1 text-xs font-medium truncate">{bastion.name}</span>
          <StatusDot status={bastion.status} />
        </>
      )}
    </button>
  )
}

// ── Nav definitions ───────────────────────────────────────────────────────────

const topNav = [
  { id: 'home'    as Screen, label: 'Home',    icon: <IconHome /> },
  { id: 'tunnels' as Screen, label: 'Tunnels', icon: <IconTunnel /> },
  { id: 'news'    as Screen, label: 'News',    icon: <IconNews /> },
]

const bottomNav = [
  { id: 'settings' as Screen, label: 'Settings', icon: <IconSettings /> },
  { id: 'docs'     as Screen, label: 'Docs',     icon: <IconBook /> },
  { id: 'support'  as Screen, label: 'Support',  icon: <IconHeart /> },
]

// ── Sidebar ────────────────────────────────────────────────────────────────────

export function Sidebar({
  screen, onNavigate, collapsed, onToggleCollapse,
  bastions, activeBastionId, onSelectBastion, onAddBastion,
  newsUnread = 0,
}: SidebarProps) {
  const w = collapsed ? 48 : 200

  return (
    <motion.div
      className="flex flex-col h-full bg-bg-elevated border-r border-border flex-shrink-0 overflow-hidden"
      animate={{ width: w }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Top nav */}
      <div className="py-2 border-b border-border-subtle flex-shrink-0">
        {topNav.map(item => {
          const badge = item.id === 'news' && newsUnread > 0 ? newsUnread : undefined
          const isActive = screen === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 w-full transition-colors rounded-lg mx-1 px-3 py-1.5 ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
              }`}
              style={{ width: 'calc(100% - 8px)' }}
              title={collapsed ? item.label : undefined}
            >
              <span className="relative flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {item.icon}
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary border border-bg-elevated" />
                )}
              </span>
              {!collapsed && <span className="text-xs font-medium whitespace-nowrap flex-1">{item.label}</span>}
              {!collapsed && badge !== undefined && badge > 0 && !isActive && (
                <span className="ml-auto text-[9px] font-mono bg-primary/15 text-primary rounded px-1 py-0.5 flex-shrink-0">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Bastions section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 min-h-0">
        {!collapsed && (
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Bastions</span>
            <button
              onClick={onAddBastion}
              className="text-text-muted hover:text-primary transition-colors"
              title="Add bastion"
            >
              <IconPlus />
            </button>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center mb-1">
            <button
              onClick={onAddBastion}
              className="p-1.5 text-text-muted hover:text-primary transition-colors rounded-md hover:bg-bg-surface"
              title="Add bastion"
            >
              <IconPlus />
            </button>
          </div>
        )}

        <div className="space-y-0.5 px-1">
          {bastions.map(b => (
            <BastionItem
              key={b.id}
              bastion={b}
              isActive={b.id === activeBastionId}
              collapsed={collapsed}
              onSelect={() => onSelectBastion(b.id)}
            />
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="py-2 border-t border-border-subtle flex-shrink-0">
        {bottomNav.map(item => {
          const isSupport = item.id === 'support'
          const isActive = screen === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-3 w-full transition-colors rounded-lg mx-1 px-3 py-2 ${
                isActive
                  ? isSupport ? 'bg-rose-500/10 text-rose-400' : 'bg-primary/10 text-primary'
                  : isSupport
                    ? 'text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
              }`}
              style={{ width: 'calc(100% - 8px)' }}
              title={collapsed ? item.label : undefined}
            >
              <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          )
        })}

        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-3 w-full px-3 py-2 text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors rounded-lg mx-1 mt-1"
          style={{ width: 'calc(100% - 8px)' }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            <IconCollapse collapsed={collapsed} />
          </span>
          {!collapsed && <span className="text-xs whitespace-nowrap">Collapse</span>}
        </button>
      </div>
    </motion.div>
  )
}

export default Sidebar
