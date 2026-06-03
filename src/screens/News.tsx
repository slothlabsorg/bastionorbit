import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { NewsItem, BadgeTone, NewsItemType } from '@/types/news'
import { loadNews, refreshNews, markRead, getUnreadIds } from '@/lib/news'
import { api } from '@/lib/tauri'
import { MOCK_FEED } from '@/data/news-mock'

// ── Badge chip ────────────────────────────────────────────────────────────────

const TONE_CLASS: Record<BadgeTone, string> = {
  primary: 'bg-primary/15 text-primary border-primary/20',
  success: 'bg-success/15 text-success border-success/20',
  warning: 'bg-warning/15 text-warning border-warning/20',
  danger:  'bg-danger/15  text-danger  border-danger/20',
  neutral: 'bg-bg-surface text-text-muted border-border',
}

const TYPE_DEFAULT_TONE: Record<NewsItemType, BadgeTone> = {
  news:         'neutral',
  announcement: 'primary',
  tip:          'success',
  changelog:    'primary',
  ad:           'neutral',
}

function Badge({ label, tone }: { label: string; tone: BadgeTone }) {
  return (
    <span className={`inline-flex items-center text-[9px] font-mono font-semibold tracking-wider uppercase border rounded px-1.5 py-0.5 ${TONE_CLASS[tone]}`}>
      {label}
    </span>
  )
}

// ── Lightweight markdown renderer ─────────────────────────────────────────────
// Supports: ## heading, - bullets, **bold**, plain paragraphs

function BodyText({ text }: { text: string }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (!line.trim()) return null
        if (line.startsWith('## ') || line.startsWith('# ')) {
          return <p key={i} className="text-text-primary text-xs font-semibold mt-2 first:mt-0">{line.replace(/^#+\s*/, '')}</p>
        }
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-primary flex-shrink-0 mt-0.5 text-xs">•</span>
              <span className="text-text-secondary text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: boldify(line.replace(/^[-*]\s*/, '')) }} />
            </div>
          )
        }
        return (
          <p key={i} className="text-text-secondary text-xs leading-relaxed"
            dangerouslySetInnerHTML={{ __html: boldify(line) }} />
        )
      })}
    </div>
  )
}

function boldify(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="font-mono text-primary bg-primary/10 px-1 rounded">$1</code>')
}

// ── Image with placeholder ─────────────────────────────────────────────────────

function NewsImage({ url, alt }: { url: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="w-full h-28 bg-bg-surface rounded-lg border border-border flex items-center justify-center">
        <svg className="w-8 h-8 text-text-muted/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    )
  }
  return (
    <img
      src={url} alt={alt}
      onError={() => setFailed(true)}
      className="w-full h-28 object-cover rounded-lg border border-border"
    />
  )
}

// ── Single news card ───────────────────────────────────────────────────────────

function NewsCard({ item, isNew }: { item: NewsItem; isNew: boolean }) {
  const [open, setOpen] = useState(!(item.collapsed ?? false))
  const tone: BadgeTone = item.badgeTone ?? TYPE_DEFAULT_TONE[item.type]
  const isAd = item.type === 'ad' || item.sponsored

  const borderClass = item.type === 'announcement'
    ? 'border-primary/30 bg-gradient-to-b from-primary/5 to-transparent'
    : isAd
      ? 'border-border/60'
      : 'border-border'

  const openLink = (url: string) => {
    api.openExternalUrl(url).catch(() => { window.open(url, '_blank') })
  }

  const relTime = (() => {
    const diffMs = Date.now() - new Date(item.publishedAt).getTime()
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffDays === 0) return 'today'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7)  return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return `${Math.floor(diffDays / 30)}mo ago`
  })()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`bg-bg-elevated border rounded-xl overflow-hidden ${borderClass}`}
    >
      {/* Card header */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            {item.badge && <Badge label={item.badge} tone={tone} />}
            {isAd && !item.badge && <Badge label="Sponsored" tone="neutral" />}
            {isAd && item.badge && (
              <span className="text-[9px] text-text-muted/60 font-mono">Sponsored</span>
            )}
            {isNew && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-0.5" title="Unread" />
            )}
          </div>
          <span className="text-[10px] text-text-muted/60 font-mono flex-shrink-0">{relTime}</span>
        </div>

        <h3 className="text-text-primary text-sm font-semibold leading-snug mb-0">{item.title}</h3>
      </div>

      {/* Optional image */}
      {item.image && (
        <div className="px-4 pb-2">
          <NewsImage url={item.image.url} alt={item.image.alt} />
        </div>
      )}

      {/* Body */}
      <div className="px-4 pb-1">
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="pb-2">
                <BodyText text={item.body} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        {item.collapsed !== undefined && (
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-1 text-[10px] text-text-muted hover:text-primary transition-colors pb-2"
          >
            <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
            {open ? 'Collapse' : 'Show more'}
          </button>
        )}
      </div>

      {/* Action button */}
      {item.action && (
        <div className="px-4 pb-3.5">
          <button
            onClick={() => openLink(item.action!.url)}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            {item.action.label}
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ── Loading skeleton ───────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-bg-elevated border border-border rounded-xl p-4 animate-pulse space-y-2">
          <div className="flex gap-2">
            <div className="h-4 w-12 bg-bg-surface rounded" />
            <div className="h-4 w-8 bg-bg-surface rounded ml-auto" />
          </div>
          <div className="h-4 w-3/4 bg-bg-surface rounded" />
          <div className="h-3 w-full bg-bg-surface rounded" />
          <div className="h-3 w-5/6 bg-bg-surface rounded" />
        </div>
      ))}
    </div>
  )
}

// ── Main News screen ───────────────────────────────────────────────────────────

// Allow ?mock=1 mode to show the mock feed without network calls
function isMockMode() {
  try { return new URL(window.location.href).searchParams.get('mock') === '1' } catch { return false }
}

export function News({ onVisit }: { onVisit?: () => void } = {}) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadIds, setUnreadIds] = useState<Set<string>>(new Set())
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const fetch = useCallback(async (force = false) => {
    setError(null)
    try {
      const data = isMockMode()
        ? MOCK_FEED.items.filter(i => !i.expiresAt || new Date(i.expiresAt).getTime() > Date.now())
        : force ? await refreshNews() : await loadNews()
      setItems(data)
      setUnreadIds(new Set(getUnreadIds(data)))
      setLastFetched(new Date())
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  // Mark all as read when the user visits the screen
  useEffect(() => {
    if (items.length > 0) {
      markRead(items.map(i => i.id))
      onVisit?.()
    }
  }, [items])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetch(true)
  }

  const formattedTime = lastFetched
    ? lastFetched.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle flex-shrink-0">
        <div>
          <h1 className="font-display font-bold text-text-primary text-base">News</h1>
          <p className="text-text-muted text-xs mt-0.5">
            {formattedTime ? `Updated at ${formattedTime}` : 'Updates from SlothLabs'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh feed"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-surface border border-border transition-colors disabled:opacity-50"
        >
          <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0115-6.7L21 8"/>
            <path d="M3 22v-6h6"/><path d="M21 12a9 9 0 01-15 6.7L3 16"/>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <Skeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <svg className="w-8 h-8 text-text-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-text-muted text-xs text-center">Could not load news feed</p>
            <button
              onClick={handleRefresh}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2">
            <p className="text-text-muted text-sm">Nothing here yet</p>
            <p className="text-text-muted/60 text-xs">Check back soon</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.2 }}
              >
                <NewsCard item={item} isNew={unreadIds.has(item.id)} />
              </motion.div>
            ))}
            <p className="text-center text-text-muted/50 text-[10px] pt-2 pb-1">
              News powered by{' '}
              <button
                onClick={() => api.openExternalUrl('https://slothlabs.org').catch(() => {})}
                className="hover:text-text-muted transition-colors underline-offset-2 hover:underline"
              >
                SlothLabs
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default News
