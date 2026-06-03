import type { NewsFeed } from '@/types/news'

// ── Mock / fallback feed ─────────────────────────────────────────────────────
// This data is shown when the remote feed is unreachable (no internet, dev
// mode, Playwright tests). It also acts as the reference for what a real
// feed payload looks like.
//
// Deploy the real feed at: https://slothlabs.org/news/feed.json
// Format must match the NewsFeed interface in src/types/news.ts

export const MOCK_FEED: NewsFeed = {
  version: 1,
  items: [
    {
      id: 'bo-v100-release',
      type: 'changelog',
      priority: 10,
      publishedAt: '2026-05-15T00:00:00Z',
      badge: 'UPDATE',
      badgeTone: 'primary',
      title: 'BastionOrbit v1.0.0',
      body: `## What's new\n\n- **SSH bastion management** — add and manage multiple bastion hosts from one place\n- **Tunnel dashboard** — open, stop, and extend SSH tunnels with TTL controls\n- **Target probing** — test connectivity to services behind your bastions\n- **Auto-reconnect** — tunnels restart automatically on transient SSH errors\n- **Status indicators** — real-time bastion reachability checks`,
      collapsed: false,
      action: { label: 'Full changelog', url: 'https://github.com/slothlabs/bastionorbit/blob/main/CHANGELOG.md' },
      targetApps: ['bastionorbit'],
    },
    {
      id: 'bo-tip-port-forwarding',
      type: 'tip',
      priority: 7,
      publishedAt: '2026-05-14T00:00:00Z',
      badge: 'TIP',
      badgeTone: 'success',
      title: 'Keep tunnels alive with ServerAlive settings',
      body: `SSH tunnels can drop silently when there's no traffic. Go to **Settings** and tune \`ServerAliveInterval\` and \`ServerAliveCountMax\` to send keepalive packets — this prevents your bastion from closing idle connections.\n\nA good starting point: interval \`30s\`, count max \`3\`.`,
      targetApps: ['bastionorbit'],
    },
    {
      id: 'bo-announcement-multi-bastion',
      type: 'announcement',
      priority: 6,
      publishedAt: '2026-05-13T00:00:00Z',
      badge: 'NEW',
      badgeTone: 'primary',
      title: 'Multi-bastion support is here',
      body: `You can now manage **multiple bastion hosts** in a single BastionOrbit session. Each bastion has its own SSH key, user, and target list.\n\nSwitch between bastions from the sidebar — active tunnel counts update per bastion so you always know what's running where.`,
      action: { label: 'Read the docs', url: 'https://slothlabs.org/bastionorbit/docs' },
      targetApps: ['bastionorbit'],
    },
    {
      id: 'slothlabs-roadmap-2026',
      type: 'news',
      priority: 5,
      publishedAt: '2026-05-10T00:00:00Z',
      badge: 'NEW',
      badgeTone: 'neutral',
      title: 'SlothLabs 2026 roadmap',
      body: `We're building a suite of developer tools that make cloud access simpler and safer. BastionOrbit is the SSH-first entry — here's what's coming next:\n\n- **BastionOrbit Pro** — team vaults, shared tunnel configs, audit logs\n- **CloudOrbit** — AWS SSO session manager with EKS support\n- **Multi-cloud** — GCP and Azure bastion support (preview)\n\nWe release fast and often. Star the repo to stay updated.`,
      collapsed: true,
      action: { label: 'Follow SlothLabs', url: 'https://github.com/slothlabs' },
      targetApps: ['all'],
    },
    {
      id: 'bo-sponsor-placeholder',
      type: 'ad',
      priority: 3,
      publishedAt: '2026-05-01T00:00:00Z',
      badge: 'SPONSOR',
      badgeTone: 'neutral',
      title: 'Want to reach infrastructure engineers?',
      body: `BastionOrbit is used by developers managing SSH access to production daily. If your tool, service, or course targets infrastructure engineers, **your ad could appear here**.\n\nSponsored placements are clearly labeled and help fund development.`,
      sponsored: true,
      action: { label: 'Advertise with SlothLabs', url: 'https://slothlabs.org/advertise' },
      targetApps: ['all'],
    },
  ],
}
