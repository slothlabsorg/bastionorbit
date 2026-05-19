<div align="center">
  <h1>🔐 BastionOrbit — SSH Tunnel Manager for macOS</h1>
  <p><strong>The free SSH tunnel manager for developers — one-click port forwarding through bastion hosts with auto-expiry TTL so you never leave a tunnel open by accident. Multi-bastion management, connectivity probes, and DataOrbit integration.</strong></p>

  [![Release](https://img.shields.io/github/v/release/slothlabsorg/bastionorbit?style=flat-square)](https://github.com/slothlabsorg/bastionorbit/releases)
  [![License: FSL-1.1-MIT](https://img.shields.io/badge/License-FSL--1.1--MIT-blue.svg?style=flat-square)](LICENSE)
  [![GitHub Sponsors](https://img.shields.io/github/sponsors/slothlabsorg?style=flat-square&logo=github&color=pink)](https://github.com/sponsors/slothlabsorg)
  [![Website](https://img.shields.io/badge/web-slothlabs.org-10B981?style=flat-square)](https://slothlabs.org/bastionorbit)
</div>

---

## What is BastionOrbit?

**BastionOrbit is the SSH tunnel manager and bastion host GUI for macOS.** Click 30m or 1h next to any target and the tunnel opens — `ssh -N -L` under the hood, with an auto-expiry timer that closes the tunnel before you forget. Manage prod, staging, and your personal VPS side-by-side; probe connectivity before opening; pair with DataOrbit for instant database access through a bastion.

If you've been pasting `ssh -L 5432:db.internal:5432 jump.prod.example.com` into your terminal sticky notes, BastionOrbit is the bastion host UI you've been wanting. It spawns the **real system `ssh` binary** (full agent / `~/.ssh/config` compatibility) wrapped in a clean native Rust app — not a re-implementation, not Electron.

Part of the [SlothLabs](https://slothlabs.org) family — native Rust, free forever.

---

## Screenshots

| Home — bastion detail | Active tunnels | Tunnels list |
|---|---|---|
| ![Home](screenshots/01-home-bastion-detail.png) | ![Active](screenshots/03-home-active-tunnels.png) | ![Tunnels](screenshots/05-tunnels-active-list.png) |

| Add bastion wizard | Settings |
|---|---|
| ![Wizard](screenshots/08-wizard-step1-config.png) | ![Settings](screenshots/11-settings.png) |

---

## Features (v0.1.0)

| Feature | Status |
|---|---|
| Add bastion hosts (host, user, SSH key path) | ✅ |
| Add targets (postgres, redis, http, …) per bastion | ✅ |
| One-click tunnel open with TTL (30m / 1h / custom) | ✅ |
| Auto-close tunnel when TTL expires | ✅ |
| Extend tunnel (+15m / +30m) without stopping | ✅ |
| Stop tunnel instantly | ✅ |
| Copy exact SSH command to clipboard | ✅ |
| SSH command preview per target | ✅ |
| Connectivity test (ssh … exit) | ✅ |
| Remote port probe (nc -z through bastion) | ✅ |
| Offline bastion detection + warning | ✅ |
| Persistent config (bastions + targets in JSON) | ✅ |
| Settings: default TTL, keep-alive, strict host checking | ✅ |

---

## Installation

### Download

Grab the latest `.dmg` / `.exe` / `.AppImage` from the [Releases](https://github.com/slothlabsorg/bastionorbit/releases) page.

### macOS (Homebrew) — coming soon

```bash
brew install slothlabs/tap/bastionorbit
```

---

## Usage

1. **Add a bastion** — click `+ Add bastion`, enter host, user, SSH port, and the path to your private key.
2. **Add a target** — in the bastion detail, click `+ Target`, enter the service name, remote host:port, and local port.
3. **Open a tunnel** — click `30m` or `1h` next to any target. The SSH process starts immediately.
4. **Use the local port** — connect your DB client (e.g. DataOrbit) to `localhost:<localPort>`.
5. **Extend or stop** — use `+15m` / `+30m` to extend, or `Stop` to kill the tunnel.

---

## DataOrbit integration

Open a tunnel to your database via Bastion Orbit, then add a DataOrbit connection pointing to `localhost:<localPort>`. No VPN, no credential sharing — just a clean SSH tunnel.

---

## Development

Requirements: Node 18+, Rust stable, Tauri v2 CLI.

```bash
npm install
npm run tauri dev
```

Browser dev mode (mock data, no Tauri binary):

```bash
npm run dev
# Open http://localhost:1422/?mock=1
```

---

## Testing

```bash
# Unit tests (Vitest)
npm test

# Playwright interaction tests
npm run test:interactions

# Playwright screenshot suite
npm run screenshots
```

Rust unit tests:

```bash
cd src-tauri
cargo test
```

---

## Contributing

1. Fork the repo and create a branch: `git checkout -b my-feature`
2. Make your changes and run the test suites above
3. Open a pull request — all PRs require review before merging to `main`
4. Direct pushes to `main` are disabled

Please keep PRs focused: one feature or fix per PR. For large changes, open an issue first to discuss the approach.

---

## Roadmap

### v0.2
- EC2 Instance Connect / AWS SSM tunnels (integrates with CloudOrbit)
- Bastion groups / tags
- Multiple simultaneous tunnels to same target (different local ports)
- Export bastion config for sharing with teammates

### v0.3
- Auto-reconnect on tunnel drop
- System tray icon with tunnel status
- Notifications on tunnel expiry

---

## We need your help 🙏

BastionOrbit is built solo on nights and weekends. Concrete things contributors can pick up:

- 🦀 **Rust contributors** — auto-reconnect logic, tunnel-drop detection
- ⚛️ **React contributors** — system tray status icon, expiry notifications
- 🐧 **Linux port** — `ssh-agent` + `~/.ssh/config` support across distros
- 🪟 **Windows port** — OpenSSH for Windows compatibility
- 📝 **Docs** — common bastion topology recipes (jump-to-jump, AWS SSM, etc.)
- 🧪 **Beta testers** — corporate SSH configs, hardware keys, port collisions

Pick anything labeled `good-first-issue` or `help-wanted` on the [tracker](https://github.com/slothlabsorg/bastionorbit/issues).

---

## Support the project

BastionOrbit is free and built on nights and weekends. If it saves you time:

- ☕ [Ko-fi](https://ko-fi.com/slothlabs)
- ❤️ [GitHub Sponsors](https://github.com/sponsors/slothlabsorg)
- ⭐ [Polar.sh](https://polar.sh/slothlabs)

---

## Other SlothLabs tools

| | | |
|---|---|---|
| ☁️ [CloudOrbit](https://slothlabs.org/cloudorbit) | AWS client UI for macOS · SSO, EKS, kubeconfig | macOS · Win · Linux |
| ⚡ [WattsOrbit](https://slothlabs.org/wattsorbit) | Mac power monitor for the menu bar | macOS · Win · Linux |
| 🗄️ [DataOrbit](https://slothlabs.org/dataorbit) | Native DynamoDB GUI · live streams, cross-table joins | macOS · Win · Linux |
| 🔍 [ProxyOrbit](https://slothlabs.org/proxyorbit) | Free Charles Proxy alternative | macOS · Win · Linux |
| 🧜 [Mermaid Preview](https://slothlabs.org/mermaid-preview) | Mermaid IntelliJ / JetBrains plugin | All JetBrains IDEs |

---

## License

MIT © SlothLabs
