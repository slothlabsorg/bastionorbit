import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Backgrounds ─────────────────────────────
        'bg-base':     '#040d0a',
        'bg-elevated': '#061210',
        'bg-surface':  '#0a1c17',
        'bg-surface2': '#0f231d',
        'bg-overlay':  '#142b23',
        // ── Borders ─────────────────────────────────
        'border':        '#1a3d30',
        'border-subtle': '#102820',
        'border-focus':  '#10b981',
        // ── Brand ───────────────────────────────────
        'primary':       '#10b981',   // emerald-500
        'primary-dim':   '#059669',   // emerald-600
        'accent':        '#34d399',   // emerald-400
        // ── Semantic ────────────────────────────────
        'success':  '#34d399',
        'warning':  '#fbbf24',
        'danger':   '#f87171',
        'info':     '#60a5fa',
        // ── Text ────────────────────────────────────
        'text-primary':   '#ecfdf5',
        'text-secondary': '#6ee7b7',
        'text-muted':     '#3d7a62',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        ui:      ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(16,185,129,0.25)',
        'glow-sm':    '0 0 8px rgba(16,185,129,0.15)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
