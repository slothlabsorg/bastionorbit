# BastionOrbit — Handoff Checklist

Manual items that need to be done by hand on whichever machine picks this up
next. Code work continues normally; the items below cannot be automated by an
agent because they involve Apple keys, secrets, or out-of-band testing.

Status as of last push:
- Launch date: **TBD later in 2026** (slot held for after the June 5 + June 15
  block ships and the SSO/Cloudflare path on CloudOrbit is stable)
- Site countdown: see slothlabs.org `/next/bastionorbit/` permalink (TBD copy)

---

## 1. Apple Developer — must be done by hand

The Apple Developer membership is purchased. The signing pipeline still needs
the certs and secrets wired up before a notarized DMG can ship. None of this
can be done by a Claude Code agent — it requires you to be logged in on
developer.apple.com and on the Mac with the certificate.

### One-time Apple setup
- [ ] developer.apple.com → Certificates → create a **Developer ID Application**
      certificate. Download the `.cer`, double-click to install in Keychain.
- [ ] Keychain Access → My Certificates → expand the Developer ID certificate →
      right-click the private key → Export → `.p12` with a strong password.
      **Save the password** — it becomes `APPLE_CERTIFICATE_PASSWORD`.
- [ ] Base64 the .p12: `base64 -i Certificates.p12 -o Certificates.b64.txt`
- [ ] appleid.apple.com → Sign-in and Security → **App-Specific Passwords** →
      generate one (label it "bastionorbit-notarize"). This is `APPLE_PASSWORD`.
- [ ] developer.apple.com → Membership → record the **Team ID** (10-char
      string). This is `APPLE_TEAM_ID`.
- [ ] Confirm the **signing identity** string with
      `security find-identity -v -p codesigning` (looks like
      `"Developer ID Application: Your Name (TEAMID)"`). This is
      `APPLE_SIGNING_IDENTITY`.

> Same Developer ID cert and Team ID as the rest of the Orbit suite — you
> don't need a fresh cert per app.

### GitHub repo secrets to add (Settings → Secrets and variables → Actions)
- [ ] `APPLE_CERTIFICATE` — contents of `Certificates.b64.txt`
- [ ] `APPLE_CERTIFICATE_PASSWORD` — the .p12 export password
- [ ] `APPLE_SIGNING_IDENTITY` — the `Developer ID Application: …` string
- [ ] `APPLE_ID` — your Apple ID email
- [ ] `APPLE_PASSWORD` — the app-specific password
- [ ] `APPLE_TEAM_ID` — 10-char team id
- [ ] `RELEASE_TOKEN` — fine-grained PAT, Contents:Write on this repo only
      (used by `update-manifest.yml` to push `latest.json` back to main)

### Tauri updater key (separate from Apple)
- [ ] `npx tauri signer generate -w ~/.tauri/bastionorbit.key` (set a password)
- [ ] Copy the printed **public** key into `src-tauri/tauri.conf.json` →
      `plugins.updater.pubkey` (replace any placeholder)
- [ ] `TAURI_PRIVATE_KEY` secret = contents of `~/.tauri/bastionorbit.key`
- [ ] `TAURI_KEY_PASSWORD` secret = the password you set

### Release flow source-of-truth
- `.github/workflows/release.yml` has the APPLE_* envs commented out near the
  build step. Uncomment them once the secrets exist.
- `tauri.conf.json` → `bundle.macOS.signingIdentity` is `null` today; flip to
  `"-"` for ad-hoc or to the `Developer ID Application: …` string for prod
  signing once the cert is in Keychain on the runner.

### First end-to-end notarized release
- [ ] Tag `v0.1.0` and push the tag.
- [ ] Watch the Actions run — should produce a signed + notarized DMG.
- [ ] Pull the DMG to a clean Mac and confirm Gatekeeper opens it without
      "unidentified developer" warning.
- [ ] `update-manifest.yml` should auto-fire and commit `latest.json`.
- [ ] Confirm `latest.json` URL responds with 200 and the right signature.

---

## 2. News feature — manual test plan

- [ ] `npm run tauri dev` opens the app cleanly (no Rust panics in the term)
- [ ] Sidebar shows the **News** entry; clicking it loads articles with
      markdown rendered — pull-to-refresh works
- [ ] **NewsBell in the title bar**: red unread dot appears when there is an
      unseen news item; clicking opens the dropdown
- [ ] Dropdown items show the right tone — colours come from `badgeTone` in
      the JSON feed
- [ ] Clicking a news item opens its detail or external link
- [ ] Unread dot clears and stays cleared across app restarts
- [ ] News feed URL points at production: `https://slothlabs.org/news/feed.json`
      with the `bastionorbit` filter applied
- [ ] Network failure path: kill internet, refresh — graceful error state

---

## 3. Updater feature — manual test plan

- [ ] **Cold start with current version**: no banner, no modal, no dot
- [ ] **Cold start with latest.json forced to a higher version**:
      `UpdaterModal` pops up automatically on first foreground
- [ ] Modal shows changelog rendered as markdown, "Install & Restart" button,
      and a Dismiss action
- [ ] **Dismiss**: modal closes, NewsBell shows an "Update available" item
- [ ] **Install & Restart**: the download progress bar reaches 100%,
      then the app relaunches and reports the new version
- [ ] Signature verification: edit `latest.json` to point at a different
      `.tar.gz` than the signature was generated for → updater MUST refuse
      with a clear error, not crash silently

---

## 4. Other BastionOrbit-specific items

- [ ] **Real `ssh -N -L` tunnels**: with `prod-bastion` mock running, open
      a tunnel and confirm it spawns a real `ssh` process (visible in
      `ps aux | grep ssh`). Stopping the tunnel must reap the process.
- [ ] **Bastion connectivity probe**: confirm `staging-bastion` shows
      "online" within ~5s of opening, `my-vps` (offline mock) shows
      "offline" with the right error tooltip.
- [ ] **Auto-expiry TTL**: open a tunnel with a 5-minute TTL, wait, confirm
      it auto-closes and a notification fires. Re-opening from the same
      target row must work without restart.
- [ ] **AddBastionWizard step 1**: name AND host fields both required (no
      auto-advance — different from DataOrbit's wizard).
- [ ] **SSH key picker**: step 2 lists `~/.ssh/*` keys and accepts a custom
      path. Bad path shows a clear error on step 3 (test connection).
- [ ] **Multi-bastion**: open tunnels through 2 different bastions
      simultaneously, confirm both stay alive and the active count badge
      in the sidebar updates.
- [ ] **Settings persistence**: change a setting (e.g., default TTL),
      restart the app, confirm it sticks.
- [ ] First-launch empty state shows the "Add bastion" wizard with no
      crashes when no bastions exist yet.

---

## 5. Pre-flight before tagging v0.1.0

- [ ] `cargo test` from `src-tauri/` is green — covers `bastions/`,
      `tunnels/`, `probe/`, and `settings/` modules
- [ ] `npm run build` (frontend) succeeds with no TS errors
- [ ] `npm run tauri build` produces a working `.app` and `.dmg` locally
- [ ] All Apple secrets confirmed in GitHub
- [ ] `update-manifest.yml` dry-run test (push a pre-release tag first)
- [ ] News feed shows a launch announcement at the top of the bell

When everything above is green, tag `v0.1.0` and let the CI ship it.
