import type { NewsFeed, NewsItem } from '@/types/news'
import { MOCK_FEED } from '@/data/news-mock'

const APP_ID      = 'bastionorbit'
const FEED_URL    = 'https://slothlabs.org/news/feed.json'
const CACHE_KEY   = 'bastionorbit.newsFeed'
const CACHE_TTL   = 6 * 60 * 60 * 1000   // 6 hours
const READ_KEY    = 'bastionorbit.newsRead' // set of ids the user has seen

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Load news items for this app.
 * Returns cached data immediately when fresh; falls back to mock on network error.
 * Does NOT throw — callers always get an array (possibly empty).
 */
export async function loadNews(): Promise<NewsItem[]> {
  const cached = readCache()
  if (cached) return cached

  try {
    const res = await fetch(`${FEED_URL}?app=${APP_ID}&v=1`, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const feed: NewsFeed = await res.json()
    writeCache(feed)
    return filterItems(feed.items)
  } catch {
    // Network unavailable or fetch blocked — surface mock data so the tab
    // is never empty. In production, real feed items replace these.
    return filterItems(MOCK_FEED.items)
  }
}

/** Force-refetch ignoring the cache (e.g. pull-to-refresh). */
export async function refreshNews(): Promise<NewsItem[]> {
  clearCache()
  return loadNews()
}

/** Mark items as read so the unread dot on the sidebar can update. */
export function markRead(ids: string[]): void {
  try {
    const current = readSet(READ_KEY)
    ids.forEach(id => current.add(id))
    localStorage.setItem(READ_KEY, JSON.stringify([...current]))
  } catch { /* quota */ }
}

/** Returns IDs of items the user has not yet seen. */
export function getUnreadIds(items: NewsItem[]): string[] {
  const read = readSet(READ_KEY)
  return items.filter(i => !read.has(i.id)).map(i => i.id)
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function filterItems(items: NewsItem[]): NewsItem[] {
  const now = Date.now()
  return items
    .filter(i => !i.expiresAt || new Date(i.expiresAt).getTime() > now)
    .filter(i => i.targetApps.includes('all') || i.targetApps.includes(APP_ID))
    .sort((a, b) => b.priority - a.priority || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
}

interface CacheEntry extends NewsFeed { fetchedAt: string }

function readCache(): NewsItem[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - new Date(entry.fetchedAt).getTime() > CACHE_TTL) return null
    return filterItems(entry.items)
  } catch { return null }
}

function writeCache(feed: NewsFeed): void {
  try {
    const entry: CacheEntry = { ...feed, fetchedAt: new Date().toISOString() }
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch { /* quota */ }
}

function clearCache(): void {
  try { localStorage.removeItem(CACHE_KEY) } catch { /* ignore */ }
}

function readSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}
