import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface UpdateInfo {
  version: string
  body: string | null
  date: string | null
}

interface DownloadProgress {
  downloaded: number
  total: number | null
}

type UpdaterState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available'; info: UpdateInfo }
  | { status: 'downloading'; progress: DownloadProgress }
  | { status: 'ready' }
  | { status: 'error'; message: string }

// Allow ?updater=1 to preview the modal with fake data (dev/screenshot mode)
function getMockParam() {
  try { return new URL(window.location.href).searchParams.get('updater') === '1' } catch { return false }
}

const MOCK_UPDATE: UpdateInfo = {
  version: '1.1.0',
  body: `## What's new in v1.1.0\n\n- Session persistence across restarts\n- Region selector when starting sessions\n- IAM / Chained / Federated auth backends\n- Sidebar cycles all active sessions\n- Environment tag dropdown no longer clips on last row\n- Credentials file now includes selected region`,
  date: new Date().toISOString(),
}

interface UpdaterModalProps {
  dismissed?: boolean
  onDismiss?: () => void
  onUpdateAvailable?: (version: string, body: string | null) => void
}

export function UpdaterModal({ dismissed: dismissedProp, onDismiss, onUpdateAvailable }: UpdaterModalProps = {}) {
  const [state, setState] = useState<UpdaterState>(
    getMockParam() ? { status: 'available', info: MOCK_UPDATE } : { status: 'idle' }
  )
  const [localDismissed, setLocalDismissed] = useState(false)
  const dismissed = dismissedProp ?? localDismissed
  const dismiss = () => { setLocalDismissed(true); onDismiss?.() }

  const checkForUpdate = useCallback(async () => {
    if (getMockParam()) return // already pre-populated
    try {
      // Dynamic import so it doesn't crash in browser/mock mode
      const { check } = await import('@tauri-apps/plugin-updater')
      const update = await check()
      if (!update) return
      const info = {
        version: update.version,
        body: update.body ?? null,
        date: update.date ?? null,
      }
      setState({ status: 'available', info })
      onUpdateAvailable?.(info.version, info.body)
    } catch {
      // Not in Tauri or no update — silent
    }
  }, [])

  // Check 3 s after mount
  useEffect(() => {
    const t = setTimeout(checkForUpdate, 3000)
    return () => clearTimeout(t)
  }, [checkForUpdate])

  const handleUpdate = useCallback(async () => {
    if (state.status !== 'available') return
    try {
      const { check } = await import('@tauri-apps/plugin-updater')
      const { relaunch } = await import('@tauri-apps/plugin-process')
      const update = await check()
      if (!update) return

      setState({ status: 'downloading', progress: { downloaded: 0, total: null } })

      await update.downloadAndInstall(event => {
        if (event.event === 'Started') {
          setState({ status: 'downloading', progress: { downloaded: 0, total: event.data.contentLength ?? null } })
        } else if (event.event === 'Progress') {
          setState(prev => {
            if (prev.status !== 'downloading') return prev
            return {
              status: 'downloading',
              progress: {
                downloaded: prev.progress.downloaded + event.data.chunkLength,
                total: prev.progress.total,
              },
            }
          })
        } else if (event.event === 'Finished') {
          setState({ status: 'ready' })
        }
      })

      await relaunch()
    } catch (err) {
      setState({ status: 'error', message: err instanceof Error ? err.message : String(err) })
    }
  }, [state])

  const isOpen = !dismissed && (state.status === 'available' || state.status === 'downloading' || state.status === 'ready' || state.status === 'error')


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-bg-elevated border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            >
              {/* Header with floating logo */}
              <div className="relative flex flex-col items-center pt-8 pb-4 px-6 bg-gradient-to-b from-primary/5 to-transparent">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <LogoOrIcon />
                </motion.div>

                <div className="mt-3 text-center">
                  <h2 className="font-display font-bold text-text-primary text-base">Update Available</h2>
                  {state.status === 'available' && (
                    <>
                      <p className="text-text-muted text-xs mt-1">
                        Version <span className="font-mono text-primary font-semibold">{state.info.version}</span> is ready to install
                      </p>
                      <p className="text-text-muted/70 text-[10px] mt-1">We ship fast — expect frequent releases</p>
                    </>
                  )}
                  {state.status === 'downloading' && (
                    <p className="text-text-muted text-xs mt-1">Downloading update…</p>
                  )}
                  {state.status === 'ready' && (
                    <p className="text-success text-xs mt-1 font-medium">Download complete — restarting…</p>
                  )}
                  {state.status === 'error' && (
                    <p className="text-danger text-xs mt-1">{state.message}</p>
                  )}
                </div>
              </div>

              {/* Changelog */}
              {state.status === 'available' && state.info.body && (
                <div className="mx-4 mb-3 rounded-xl border border-border bg-bg-surface">
                  <div className="px-3 py-2 border-b border-border-subtle">
                    <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">What's new</p>
                  </div>
                  <div className="px-3 py-2.5 max-h-36 overflow-y-auto">
                    <ChangelogBody body={state.info.body} />
                  </div>
                </div>
              )}

              {/* Progress bar */}
              {state.status === 'downloading' && (
                <div className="mx-4 mb-3">
                  <DownloadBar progress={state.progress} />
                </div>
              )}

              {/* Early release note */}
              {state.status === 'available' && (
                <p className="text-center text-text-muted/60 text-[10px] px-4 pb-2 leading-relaxed">
                  BastionOrbit is in early release — we're actively building it and shipping improvements constantly.
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 px-4 pb-5">
                {(state.status === 'available') && (
                  <>
                    <button
                      onClick={() => dismiss()}
                      className="flex-1 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface border border-border transition-colors"
                    >
                      Later
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold bg-primary text-bg-base hover:bg-primary/90 transition-colors"
                    >
                      Update Now
                    </button>
                  </>
                )}
                {state.status === 'error' && (
                  <button
                    onClick={() => dismiss()}
                    className="flex-1 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-surface border border-border transition-colors"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function LogoOrIcon() {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-border flex items-center justify-center shadow-lg">
        <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
        </svg>
      </div>
    )
  }
  return (
    <img
      src="/images/logo-bastionorbit.PNG"
      alt="BastionOrbit"
      className="w-16 h-auto drop-shadow-xl rounded-xl"
      onError={() => setFailed(true)}
    />
  )
}

function ChangelogBody({ body }: { body: string }) {
  // Render markdown-ish changelog as simple styled lines
  const lines = body.split('\n').filter(l => l.trim())
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('## ') || line.startsWith('# ')) {
          return <p key={i} className="text-text-primary text-xs font-semibold mt-2 first:mt-0">{line.replace(/^#+\s*/, '')}</p>
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-primary mt-0.5 flex-shrink-0 text-xs">•</span>
              <span className="text-text-secondary text-xs leading-relaxed">{line.replace(/^[-*]\s*/, '')}</span>
            </div>
          )
        }
        return <p key={i} className="text-text-secondary text-xs leading-relaxed">{line}</p>
      })}
    </div>
  )
}

function DownloadBar({ progress }: { progress: DownloadProgress }) {
  const pct = progress.total ? Math.round((progress.downloaded / progress.total) * 100) : null
  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)} MB`

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs text-text-secondary">Downloading…</span>
        <span className="text-xs font-mono text-text-muted">
          {pct !== null ? `${pct}%` : progress.downloaded > 0 ? mb(progress.downloaded) : ''}
        </span>
      </div>
      <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
        {pct !== null ? (
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ ease: 'linear' }}
          />
        ) : (
          <motion.div
            className="h-full w-1/3 bg-primary rounded-full"
            animate={{ x: ['0%', '200%', '0%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
    </div>
  )
}

export default UpdaterModal
