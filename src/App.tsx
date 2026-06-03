import { useState, useEffect } from 'react'
import type { Screen, Bastion, Tunnel, Target } from '@/types'
import { api } from '@/lib/tauri'
import { mockBastions, mockTunnels } from '@/mock/data'
import { Shell } from '@/components/layout/Shell'
import { AddBastionWizard } from '@/components/ui/AddBastionWizard'
import { UpdaterModal } from '@/components/UpdaterModal'
import { News } from '@/screens/News'
import { getUnreadIds } from '@/lib/news'
import { MOCK_FEED } from '@/data/news-mock'
import { Home } from '@/screens/Home'
import { Tunnels } from '@/screens/Tunnels'
import { BastionDetail } from '@/screens/BastionDetail'
import { Settings } from '@/screens/Settings'
import { Docs } from '@/screens/Docs'
import { Support } from '@/screens/Support'

function getUrlParam(key: string): string | null {
  try { return new URL(window.location.href).searchParams.get(key) } catch { return null }
}
const URL_SCREEN  = (getUrlParam('screen') as Screen | null) ?? 'home'
const URL_MOCK    = getUrlParam('mock') === '1'
const URL_UPDATER = getUrlParam('updater') === '1'
const URL_NEWS    = getUrlParam('news')    === '1'

const MOCK_NEWS_INFO = {
  version: '1.1.0',
  body: `## What's new in v1.1.0\n\n- Multi-bastion management from a single window\n- Target probing — test connectivity before opening a tunnel\n- Auto-reconnect on transient SSH errors\n- ServerAlive keepalive settings\n- Status indicators with real-time bastion reachability`,
}

let idCounter = 100

export default function App() {
  const [screen, setScreen]                 = useState<Screen>(URL_SCREEN)
  const [bastions, setBastions]             = useState<Bastion[]>([])
  const [tunnels, setTunnels]               = useState<Tunnel[]>([])
  const [activeBastionId, setActiveBastionId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [wizardOpen, setWizardOpen]         = useState(false)
  const [isLoading, setIsLoading]           = useState(true)
  const [_updateInfo, setUpdateInfo]        = useState<{ version: string; body: string | null } | null>(
    URL_NEWS ? MOCK_NEWS_INFO : null
  )
  const [updaterDismissed, setUpdaterDismissed] = useState(false)
  const [newsUnread, setNewsUnread]         = useState(() =>
    getUnreadIds(MOCK_FEED.items.filter(i => !i.expiresAt || new Date(i.expiresAt).getTime() > Date.now())).length
  )

  useEffect(() => {
    const load = async () => {
      if (URL_MOCK) {
        setBastions(mockBastions)
        setTunnels(mockTunnels)
        setActiveBastionId(mockBastions[0].id)
        setIsLoading(false)
        return
      }
      try {
        const [b, t] = await Promise.all([api.listBastions(), api.listTunnels()])
        setBastions(b)
        setTunnels(t)
        if (b.length > 0) setActiveBastionId(b[0].id)
      } catch {
        // Not in Tauri — start fresh
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  function handleSelectBastion(id: string) {
    setActiveBastionId(id)
    // Show detail inline in the main content area
  }

  function handleAddBastion(bastion: Omit<Bastion, 'id' | 'status' | 'targets'>) {
    const newBastion: Bastion = {
      ...bastion,
      id: `b-${++idCounter}`,
      status: 'unknown',
      targets: [],
    }
    setBastions(prev => [...prev, newBastion])
    setActiveBastionId(newBastion.id)
  }

  function handleOpenTunnel(bastionId: string, targetId: string, ttlMinutes: number) {
    const bastion = bastions.find(b => b.id === bastionId)
    const target = bastion?.targets.find(t => t.id === targetId)
    if (!bastion || !target) return

    const startedAt = new Date().toISOString()
    const expiresAt = new Date(Date.now() + ttlMinutes * 60_000).toISOString()

    const tunnel: Tunnel = {
      id: `tun-${++idCounter}`,
      bastionId,
      targetId,
      bastionName: bastion.name,
      targetName: target.name,
      targetType: target.type,
      remoteHost: target.remoteHost,
      remotePort: target.remotePort,
      localPort: target.localPort,
      startedAt,
      expiresAt,
      status: 'active',
    }
    setTunnels(prev => [...prev, tunnel])
    // Real impl: api.openTunnel(bastionId, targetId, ttlMinutes)
  }

  function handleStopTunnel(id: string) {
    setTunnels(prev => prev.map(t => t.id === id ? { ...t, status: 'stopped' as const } : t))
    // Real impl: api.closeTunnel(id)
  }

  function handleExtendTunnel(id: string, minutes: number) {
    setTunnels(prev => prev.map(t =>
      t.id === id
        ? { ...t, expiresAt: new Date(new Date(t.expiresAt).getTime() + minutes * 60_000).toISOString() }
        : t
    ))
    // Real impl: api.extendTunnel(id, minutes)
  }

  async function handleTestBastion(id: string) {
    setBastions(prev => prev.map(b => b.id === id ? { ...b, status: 'checking' as const } : b))
    await new Promise(r => setTimeout(r, 1_500))
    // Simulate: real impl calls api.testBastion(id)
    setBastions(prev => prev.map(b =>
      b.id === id ? { ...b, status: b.host === '1.2.3.4' ? 'offline' : 'online', lastChecked: new Date().toISOString() } : b
    ))
  }

  function handleAddTarget(target: Omit<Target, 'id'>) {
    const newTarget: Target = { ...target, id: `t-${++idCounter}` }
    setBastions(prev => prev.map(b =>
      b.id === target.bastionId ? { ...b, targets: [...b.targets, newTarget] } : b
    ))
  }

  const activeTunnels = tunnels.filter(t => t.status === 'active')
  const activeBastion = bastions.find(b => b.id === activeBastionId) ?? null

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-base">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  function renderContent() {
    if (screen === 'home') {
      // If a bastion is selected, show its detail; otherwise show dashboard
      if (activeBastion && bastions.length > 0) {
        return (
          <BastionDetail
            bastion={activeBastion}
            tunnels={tunnels}
            onOpenTunnel={handleOpenTunnel}
            onStopTunnel={handleStopTunnel}
            onExtendTunnel={handleExtendTunnel}
            onTestBastion={handleTestBastion}
            onAddTarget={handleAddTarget}
          />
        )
      }
      return (
        <Home
          bastions={bastions}
          tunnels={activeTunnels}
          onSelectBastion={handleSelectBastion}
          onAddBastion={() => setWizardOpen(true)}
          onOpenTunnel={handleOpenTunnel}
          onStopTunnel={handleStopTunnel}
          onExtendTunnel={handleExtendTunnel}
        />
      )
    }
    if (screen === 'tunnels')  return <Tunnels tunnels={tunnels} onStop={handleStopTunnel} onExtend={handleExtendTunnel} />
    if (screen === 'news')     return <News onVisit={() => setNewsUnread(0)} />
    if (screen === 'settings') return <Settings />
    if (screen === 'docs')     return <Docs />
    if (screen === 'support')  return <Support />
    return null
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {(!URL_MOCK || URL_UPDATER) && (
        <UpdaterModal
          dismissed={updaterDismissed}
          onDismiss={() => setUpdaterDismissed(true)}
          onUpdateAvailable={(v, b) => setUpdateInfo({ version: v, body: b })}
        />
      )}
      <div className="flex-1 min-h-0">
        <Shell
          screen={screen}
          onNavigate={(s) => { setScreen(s); if (s === 'home' && bastions.length > 0 && !activeBastionId) setActiveBastionId(bastions[0].id) }}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(c => !c)}
          bastions={bastions}
          activeBastionId={activeBastionId}
          onSelectBastion={(id) => { handleSelectBastion(id); setScreen('home') }}
          onAddBastion={() => setWizardOpen(true)}
          activeTunnelCount={activeTunnels.length}
          newsUnread={newsUnread}
        >
          {renderContent()}
        </Shell>
      </div>
      {wizardOpen && (
        <AddBastionWizard
          onClose={() => setWizardOpen(false)}
          onSave={handleAddBastion}
        />
      )}
    </div>
  )
}
