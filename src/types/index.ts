// ── Screens ───────────────────────────────────────────────────────────────────
export type Screen = 'home' | 'tunnels' | 'settings' | 'docs' | 'support'

// ── Target types ──────────────────────────────────────────────────────────────
export type TargetType = 'postgres' | 'mysql' | 'redis' | 'mongodb' | 'http' | 'other'

// ── Bastion ───────────────────────────────────────────────────────────────────
export type BastionStatus = 'online' | 'offline' | 'checking' | 'unknown'

export interface Bastion {
  id: string
  name: string
  host: string
  user: string
  sshPort: number        // default 22
  keyPath: string        // path to private SSH key
  status: BastionStatus
  targets: Target[]
  lastChecked?: string   // ISO
}

// ── Target (service behind the bastion) ──────────────────────────────────────
export interface Target {
  id: string
  bastionId: string
  name: string
  type: TargetType
  remoteHost: string
  remotePort: number
  localPort: number
}

// ── Active SSH tunnel ──────────────────────────────────────────────────────────
export type TunnelStatus = 'active' | 'stopped' | 'error'

export interface Tunnel {
  id: string
  bastionId: string
  targetId: string
  // denormalized for display
  bastionName: string
  targetName: string
  targetType: TargetType
  remoteHost: string
  remotePort: number
  localPort: number
  startedAt: string   // ISO
  expiresAt: string   // ISO
  status: TunnelStatus
  pid?: number
}

// ── App settings ──────────────────────────────────────────────────────────────
export interface AppSettings {
  defaultTtlMinutes: number
  serverAliveInterval: number
  serverAliveCountMax: number
  strictHostKeyChecking: boolean
}
