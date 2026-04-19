// Safe invoke — works in browser (no Tauri) for dev/testing
type TauriInvoke = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>

function getInvoke(): TauriInvoke {
  const w = window as Window & { __TAURI__?: { core?: { invoke?: TauriInvoke } } }
  return w.__TAURI__?.core?.invoke ?? ((_cmd, _args) => {
    console.warn('Tauri not available — using mock data')
    return Promise.reject(new Error('not-in-tauri'))
  })
}

export const invoke: TauriInvoke = (cmd, args) => getInvoke()(cmd, args)

import type { Bastion, Tunnel, AppSettings } from '@/types'

export const api = {
  // ── Bastions ──────────────────────────────────────────────────────────────
  listBastions: () =>
    invoke<Bastion[]>('list_bastions'),

  saveBastion: (bastion: Omit<Bastion, 'id' | 'status' | 'targets'>) =>
    invoke<Bastion>('save_bastion', { bastion }),

  deleteBastion: (id: string) =>
    invoke<void>('delete_bastion', { id }),

  testBastion: (id: string) =>
    invoke<{ ok: boolean; latencyMs?: number; error?: string }>('test_bastion', { id }),

  // ── Targets ───────────────────────────────────────────────────────────────
  saveTarget: (target: Omit<Bastion['targets'][0], 'id'>) =>
    invoke<Bastion['targets'][0]>('save_target', { target }),

  deleteTarget: (id: string) =>
    invoke<void>('delete_target', { id }),

  probeTarget: (bastionId: string, targetId: string) =>
    invoke<{ reachable: boolean; error?: string }>('probe_target', { bastion_id: bastionId, target_id: targetId }),

  // ── Tunnels ───────────────────────────────────────────────────────────────
  listTunnels: () =>
    invoke<Tunnel[]>('list_tunnels'),

  openTunnel: (bastionId: string, targetId: string, ttlMinutes: number) =>
    invoke<Tunnel>('open_tunnel', { bastion_id: bastionId, target_id: targetId, ttl_minutes: ttlMinutes }),

  closeTunnel: (tunnelId: string) =>
    invoke<void>('close_tunnel', { tunnel_id: tunnelId }),

  extendTunnel: (tunnelId: string, extraMinutes: number) =>
    invoke<Tunnel>('extend_tunnel', { tunnel_id: tunnelId, extra_minutes: extraMinutes }),

  // ── Settings ──────────────────────────────────────────────────────────────
  getSettings: () =>
    invoke<AppSettings>('get_settings'),

  saveSettings: (settings: AppSettings) =>
    invoke<void>('save_settings', { settings }),
}
