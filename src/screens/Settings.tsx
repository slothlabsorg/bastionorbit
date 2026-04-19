import { useState } from 'react'
import Button from '@/components/ui/Button'

const TTL_OPTIONS = [
  { value: 15,  label: '15 minutes' },
  { value: 30,  label: '30 minutes' },
  { value: 60,  label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
]

export function Settings() {
  const [defaultTtl, setDefaultTtl] = useState(30)
  const [aliveInterval, setAliveInterval] = useState(60)
  const [aliveCount, setAliveCount] = useState(3)
  const [strictHostKey, setStrictHostKey] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    // Real impl calls api.saveSettings(...)
    setSaved(true)
    setTimeout(() => setSaved(false), 2_000)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-5 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-text-primary font-display font-bold text-lg">Settings</h1>
            <p className="text-text-muted text-xs">Tunnel defaults and SSH options</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Default TTL */}
          <div>
            <h2 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">Tunnel lifetime</h2>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Default TTL</label>
              <select
                className="field-input"
                value={defaultTtl}
                onChange={e => setDefaultTtl(Number(e.target.value))}
              >
                {TTL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <p className="text-text-muted text-[11px] mt-1">Tunnels auto-close after this duration.</p>
            </div>
          </div>

          {/* SSH options */}
          <div>
            <h2 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">SSH keep-alive</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">ServerAliveInterval (seconds)</label>
                <input
                  type="number"
                  className="field-input font-mono"
                  value={aliveInterval}
                  onChange={e => setAliveInterval(Number(e.target.value))}
                />
                <p className="text-text-muted text-[11px] mt-1">Seconds between SSH keep-alive packets.</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">ServerAliveCountMax</label>
                <input
                  type="number"
                  className="field-input font-mono"
                  value={aliveCount}
                  onChange={e => setAliveCount(Number(e.target.value))}
                />
                <p className="text-text-muted text-[11px] mt-1">Retries before giving up on a dead connection.</p>
              </div>
            </div>
          </div>

          {/* Strict host key */}
          <div>
            <h2 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">Security</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                className={`relative w-8 h-4 rounded-full transition-colors ${strictHostKey ? 'bg-primary' : 'bg-bg-overlay'}`}
                onClick={() => setStrictHostKey(v => !v)}
              >
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${strictHostKey ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <div>
                <p className="text-text-primary text-xs font-medium">StrictHostKeyChecking</p>
                <p className="text-text-muted text-[11px]">Reject connections to unknown hosts. Recommended for production.</p>
              </div>
            </label>
          </div>

          {/* SSH command preview */}
          <div>
            <h2 className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">Generated SSH flags</h2>
            <div className="rounded-lg bg-bg-base border border-border-subtle p-3">
              <code className="text-[11px] font-mono text-text-muted break-all">
                -o ServerAliveInterval={aliveInterval}{' '}
                -o ServerAliveCountMax={aliveCount}{' '}
                {strictHostKey ? '' : '-o StrictHostKeyChecking=no'}{' '}
                -N
              </code>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border-subtle">
          <Button variant="primary" size="sm" onClick={handleSave}>
            {saved ? '✓ Saved' : 'Save settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Settings
