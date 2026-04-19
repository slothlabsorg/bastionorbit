export function Docs() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-5 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-text-primary font-display font-bold text-lg">Docs</h1>
            <p className="text-text-muted text-xs">How Bastion Orbit works</p>
          </div>
        </div>

        <div className="space-y-6 text-text-secondary text-sm leading-relaxed">

          <section>
            <h2 className="text-text-primary font-semibold text-sm mb-2">What is a bastion?</h2>
            <p className="text-xs leading-relaxed">
              A bastion host (also called a jump box) is a server that sits in a public subnet and provides
              controlled access to resources in private subnets — databases, caches, internal APIs.
              Bastion Orbit manages SSH local-port-forwarding tunnels through these bastions.
            </p>
          </section>

          <section>
            <h2 className="text-text-primary font-semibold text-sm mb-2">How tunnels work</h2>
            <p className="text-xs leading-relaxed mb-3">
              When you open a tunnel, Bastion Orbit runs an SSH command like:
            </p>
            <div className="rounded-lg bg-bg-base border border-border-subtle p-3">
              <code className="text-[11px] font-mono text-accent break-all">
                ssh -N -L 5434:prod-db.internal:5432 ubuntu@bastion.corp.com -i ~/.ssh/id_rsa_prod -o ServerAliveInterval=60
              </code>
            </div>
            <p className="text-xs leading-relaxed mt-3">
              This binds <code className="font-mono text-accent">localhost:5434</code> to{' '}
              <code className="font-mono text-accent">prod-db.internal:5432</code> via the bastion.
              Any tool that connects to <code className="font-mono text-accent">localhost:5434</code> is transparently proxied.
            </p>
          </section>

          <section>
            <h2 className="text-text-primary font-semibold text-sm mb-2">TTL — auto-close timers</h2>
            <p className="text-xs leading-relaxed">
              Every tunnel has a time-to-live. When it expires, Bastion Orbit kills the SSH process and frees the local port.
              Use <strong className="text-text-primary">+15m / +30m</strong> to extend without stopping.
              Default TTL is configurable in Settings.
            </p>
          </section>

          <section>
            <h2 className="text-text-primary font-semibold text-sm mb-2">SSH keys</h2>
            <p className="text-xs leading-relaxed">
              Bastion Orbit stores only the <strong className="text-text-primary">path</strong> to your private key.
              The key itself never leaves your disk. Keys are referenced with <code className="font-mono text-accent">-i</code>{' '}
              in the SSH command.
            </p>
          </section>

          <section>
            <h2 className="text-text-primary font-semibold text-sm mb-2">Copy SSH command</h2>
            <p className="text-xs leading-relaxed">
              Every target row has a copy button. Paste it into your terminal to run the same tunnel manually —
              useful for sharing with teammates or running it in a script.
            </p>
          </section>

          <section>
            <h2 className="text-text-primary font-semibold text-sm mb-2">Port conflicts</h2>
            <p className="text-xs leading-relaxed">
              If a local port is already in use, the tunnel will fail to open.
              Each target has a configurable <code className="font-mono text-accent">localPort</code> —
              pick different ports for each target to avoid conflicts.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}

export default Docs
