import { motion } from 'framer-motion'

function Card({ title, description, cta, href, accent }: {
  title: string
  description: string
  cta: string
  href: string
  accent: string
}) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`block p-5 rounded-xl border ${accent} bg-bg-surface hover:bg-bg-surface2 transition-colors`}
    >
      <h3 className="text-text-primary font-semibold text-sm mb-1.5">{title}</h3>
      <p className="text-text-secondary text-xs leading-relaxed mb-3">{description}</p>
      <span className="text-xs font-medium text-primary">{cta} →</span>
    </motion.a>
  )
}

export function Support() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="px-6 py-5 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          {/* Logo placeholder */}
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
            <img
              src="/images/bastionorbit-icon.png"
              alt="Bastion Orbit"
              className="w-full h-full object-cover"
              onError={e => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <svg className="w-5 h-5 text-primary hidden" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-text-primary font-display font-bold text-lg">Support Bastion Orbit</h1>
            <p className="text-text-muted text-xs">Built with ❤️ by SlothLabs</p>
          </div>
        </div>

        <p className="text-text-secondary text-sm leading-relaxed mb-6">
          Bastion Orbit is free and open source. If it saves you time wrangling SSH tunnels,
          consider supporting its development.
        </p>

        <div className="space-y-3 mb-8">
          <Card
            title="⭐ Star on GitHub"
            description="Give Bastion Orbit a star — it helps others discover the project and keeps the sloth motivated."
            cta="Star the repo"
            href="https://github.com/slothlabs/bastionorbit"
            accent="border-warning/30 hover:border-warning/50"
          />
          <Card
            title="☕ Buy us a coffee"
            description="A small contribution goes a long way toward keeping the lights on and shipping new features."
            cta="Support on Ko-fi"
            href="https://ko-fi.com/slothlabs"
            accent="border-success/30 hover:border-success/50"
          />
          <Card
            title="🐛 Report a bug"
            description="Found something broken? Open an issue and we'll get to it as fast as slothly possible."
            cta="Open an issue"
            href="https://github.com/slothlabs/bastionorbit/issues"
            accent="border-danger/30 hover:border-danger/50"
          />
          <Card
            title="💬 Join the community"
            description="Chat with the team and other users, share ideas, and get help from the community."
            cta="Join Discord"
            href="https://discord.gg/slothlabs"
            accent="border-accent/30 hover:border-accent/50"
          />
        </div>

        {/* Suite footer */}
        <div className="rounded-xl border border-border bg-bg-surface p-4">
          <p className="text-text-muted text-xs leading-relaxed mb-3 text-center">
            Bastion Orbit is part of the <strong className="text-text-secondary">SlothLabs</strong> suite.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="https://github.com/slothlabs/cloudorbit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-surface2 border border-border hover:border-blue-500/40 transition-colors group"
            >
              {/* CloudOrbit logo placeholder */}
              <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src="/images/cloudorbit-icon.png" alt="CloudOrbit" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display='none' }} />
              </div>
              <div>
                <p className="text-text-secondary text-xs font-semibold group-hover:text-blue-400 transition-colors">CloudOrbit</p>
                <p className="text-text-muted text-[10px]">AWS credentials</p>
              </div>
            </a>
            <a
              href="https://github.com/slothlabs/dataorbit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-surface2 border border-border hover:border-violet-500/40 transition-colors group"
            >
              {/* DataOrbit logo placeholder */}
              <div className="w-6 h-6 rounded-md bg-violet-500/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img src="/images/dataorbit-icon.png" alt="DataOrbit" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display='none' }} />
              </div>
              <div>
                <p className="text-text-secondary text-xs font-semibold group-hover:text-violet-400 transition-colors">DataOrbit</p>
                <p className="text-text-muted text-[10px]">Database client</p>
              </div>
            </a>
          </div>
          <p className="text-text-muted text-[10px] mt-3 text-center">
            Tip: open a Bastion Orbit tunnel, then connect DataOrbit to <code className="font-mono text-accent">localhost:5434</code> — no VPN needed.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Support
