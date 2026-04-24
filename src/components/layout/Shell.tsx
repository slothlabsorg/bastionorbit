import React from 'react'
import type { Screen, Bastion } from '@/types'
import { Titlebar } from './Titlebar'
import { Sidebar } from './Sidebar'
import { StatusBar } from './StatusBar'

interface ShellProps {
  screen: Screen
  onNavigate: (screen: Screen) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  bastions: Bastion[]
  activeBastionId: string | null
  onSelectBastion: (id: string) => void
  onAddBastion: () => void
  activeTunnelCount: number
  children: React.ReactNode
}

export function Shell({
  screen, onNavigate, sidebarCollapsed, onToggleSidebar,
  bastions, activeBastionId, onSelectBastion, onAddBastion,
  activeTunnelCount, children,
}: ShellProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Titlebar activeTunnelCount={activeTunnelCount} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          screen={screen}
          onNavigate={onNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={onToggleSidebar}
          bastions={bastions}
          activeBastionId={activeBastionId}
          onSelectBastion={onSelectBastion}
          onAddBastion={onAddBastion}
        />

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>

      <StatusBar activeTunnelCount={activeTunnelCount} bastionCount={bastions.length} />
    </div>
  )
}

export default Shell
