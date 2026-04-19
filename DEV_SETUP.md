# Dev Setup

## Prerequisites

- Node.js 18+
- Rust (stable) + `cargo`
- Tauri CLI v2: `npm install -g @tauri-apps/cli`
- (macOS) Xcode Command Line Tools

## Install

```bash
cd bastionorbit
npm install
```

## Run (browser mode — mock data, no Tauri)

```bash
npm run dev
# Open http://localhost:1422/?mock=1
```

The `?mock=1` flag loads mock bastions and tunnels so you can develop without real SSH keys.

## Run (full Tauri app)

```bash
npm run tauri dev
```

This launches the Vite dev server and the Tauri shell simultaneously.

## Build

```bash
npm run tauri build
```

Output is in `src-tauri/target/release/bundle/`.

## Tests

```bash
# TypeScript unit tests
npm test

# Playwright — interaction tests
npm run test:interactions

# Playwright — screenshot suite (captures all screens to screenshots/)
npm run screenshots
npx playwright show-report screenshots/report

# Rust unit tests
cd src-tauri && cargo test
```

## Project structure

```
bastionorbit/
├── src/
│   ├── App.tsx                       # Root — routing + state
│   ├── types/index.ts                # Bastion, Target, Tunnel types
│   ├── mock/data.ts                  # Mock bastions + tunnels for dev
│   ├── lib/tauri.ts                  # Safe Tauri invoke wrapper + api object
│   ├── styles/globals.css
│   ├── components/
│   │   ├── layout/                   # Shell, Titlebar, Sidebar, StatusBar
│   │   └── ui/                       # Button, Modal, Badge, TunnelCard, AddBastionWizard, …
│   └── screens/
│       ├── Home.tsx                  # Dashboard + BastionDetail inline
│       ├── Tunnels.tsx               # Active tunnels full-page view
│       ├── BastionDetail.tsx         # Targets list + tunnel controls
│       ├── Settings.tsx
│       ├── Docs.tsx
│       └── Support.tsx
├── src-tauri/
│   └── src/
│       ├── main.rs
│       └── commands/
│           ├── bastions.rs           # Config CRUD (bastions + targets)
│           ├── tunnels.rs            # SSH spawn/kill + TTL
│           ├── probe.rs              # Connectivity checks
│           └── settings.rs          # App settings persistence
├── tests/
│   ├── screenshots.spec.ts          # Visual snapshot suite
│   └── interactions.spec.ts         # Functional interaction tests
└── playwright.config.ts
```

## Color reference

| Role | Hex | Token |
|------|-----|-------|
| Background base | `#040d0a` | `bg-base` |
| Background elevated | `#061210` | `bg-elevated` |
| Primary (emerald) | `#10b981` | `primary` |
| Accent | `#34d399` | `accent` |
| Text primary | `#ecfdf5` | `text-primary` |

Compare with DataOrbit (violet `#8b5cf6`) and CloudOrbit (blue `#3b82f6`).
