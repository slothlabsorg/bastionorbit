// ── News Feed — shared schema for all SlothLabs apps ────────────────────────
//
// Remote endpoint: GET https://slothlabs.org/news/feed.json
// Query params:    ?app=cloudorbit&v=1
//
// Response shape:
//   { "version": 1, "items": [...] }
//
// Each item follows the NewsItem interface below.
// Items with expiresAt in the past are silently dropped on the client.
// Items whose targetApps does not include the current app (or "all") are filtered.
// Higher priority items sort to the top.
//
// Monetization: items with sponsored=true or type="ad" show a "Sponsored" label.
// Advertisers pay SlothLabs to have items appear in the feed; the client always
// renders them in a clearly labeled way so users know they are paid placements.

export type NewsItemType =
  | 'news'          // general news / blog post
  | 'announcement'  // product announcement (highlighted border)
  | 'tip'           // usage tip / how-to
  | 'changelog'     // release notes inline
  | 'ad'            // paid placement (always shows Sponsored label)

export type BadgeLabel = 'NEW' | 'PRO' | 'TIP' | 'UPDATE' | 'BETA' | 'SPONSOR' | string
export type BadgeTone  = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

export interface NewsAction {
  label: string
  url: string   // opens in system browser
}

export interface NewsImage {
  url: string
  alt: string
}

export interface NewsItem {
  id: string
  type: NewsItemType
  priority: number         // 1 (lowest) – 10 (highest), higher rendered first
  publishedAt: string      // ISO-8601
  expiresAt?: string       // ISO-8601, item hidden after this date

  badge?: BadgeLabel
  badgeTone?: BadgeTone

  title: string
  body: string             // Plain text or lightweight markdown (## h2, - bullets, **bold**)
  collapsed?: boolean      // Start body collapsed when true (good for long changelogs)

  image?: NewsImage        // Optional header image; client shows placeholder when absent

  action?: NewsAction      // Primary CTA button — opens external URL

  targetApps: string[]     // e.g. ['bastionorbit'] | ['all'] | ['bastionorbit', 'cloudorbit']
  sponsored?: boolean      // true = show "Sponsored" label regardless of type
}

export interface NewsFeed {
  version: number
  items: NewsItem[]
}
