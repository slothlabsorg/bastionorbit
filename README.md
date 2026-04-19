# Bastion Orbit

**SSH tunnel manager for teams.** One click to forward a database or internal service through a bastion host — with auto-expiry timers so you never leave a tunnel open by accident.

Part of the [SlothLabs](https://slothlabs.org) family — alongside [CloudOrbit](../aws-switch-tauri) (AWS credentials) and [DataOrbit](../dataorbit) (database client).

> **Tip:** Open a Bastion Orbit tunnel to `localhost:5434`, then connect DataOrbit to that port — instant access to your production database, no VPN needed.

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

## Screenshots

> Coming soon — run `npm run screenshots` to generate locally.

---

## The SlothLabs Suite

| App | Purpose | Color |
|-----|---------|-------|
| [CloudOrbit](https://github.com/slothlabs/cloudorbit) | AWS credential manager | Blue |
| [DataOrbit](https://github.com/slothlabs/dataorbit)   | Database client (DynamoDB, …) | Violet |
| **Bastion Orbit** | SSH tunnel manager | Teal/Emerald |

---

## Installation

### macOS (Homebrew)

```bash
brew install slothlabs/tap/bastionorbit
```

### Download

Grab the latest `.dmg` / `.exe` / `.AppImage` from the [Releases](https://github.com/slothlabs/bastionorbit/releases) page.

---

## Usage

1. **Add a bastion** — click `+ Add bastion`, enter host, user, SSH port, and the path to your private key.
2. **Add a target** — in the bastion detail, click `+ Target`, enter the service name, remote host:port, and local port.
3. **Open a tunnel** — click `30m` or `1h` next to any target. The SSH process starts immediately.
4. **Use the local port** — connect your DB client (e.g. DataOrbit) to `localhost:<localPort>`.
5. **Extend or stop** — use `+15m` / `+30m` to extend, or `Stop` to kill the tunnel.

---

## DataOrbit integration

Bastion Orbit and DataOrbit are designed to work together. Open a tunnel to your database via Bastion Orbit, then add a DataOrbit connection pointing to `localhost:<localPort>`. No VPN, no credential sharing — just a clean SSH tunnel.

CloudOrbit users: if your bastion uses AWS IAM or EC2 Instance Connect, CloudOrbit can manage the short-lived SSH certificates automatically.

---

## Development

See [DEV_SETUP.md](./DEV_SETUP.md) for full setup instructions.

Quick start:

```bash
npm install
npm run tauri dev
```

Browser dev mode (mock data, no Tauri):

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

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## License

MIT © SlothLabs
