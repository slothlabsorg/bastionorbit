import React from 'react'
import { motion } from 'framer-motion'
import Button from './Button'

type Variant = 'welcome' | 'empty' | 'no-tunnels' | 'offline'

interface EmptyStateProps {
  variant?: Variant
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

const IMAGES: Record<Variant, string | null> = {
  welcome:    '/images/slothy-bastionorbit.png',
  empty:      '/images/slothy-bastionorbit.png',
  'no-tunnels': '/images/slothy-bastionorbit.png',
  offline:    '/images/slothy-bastionorbit.png',
}

function SlothImage({ variant }: { variant: Variant }) {
  const src = IMAGES[variant]
  const [failed, setFailed] = React.useState(false)

  if (!src || failed) {
    return (
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" className="opacity-40">
        <circle cx="48" cy="48" r="44" fill="#061210" stroke="#1a3d30" strokeWidth="2"/>
        <ellipse cx="48" cy="55" rx="18" ry="14" fill="#0f231d"/>
        <circle cx="48" cy="36" r="13" fill="#0a1c17"/>
        <circle cx="43" cy="34" r="3" fill="#ecfdf5"/>
        <circle cx="53" cy="34" r="3" fill="#ecfdf5"/>
        <circle cx="44" cy="34" r="1.5" fill="#040d0a"/>
        <circle cx="54" cy="34" r="1.5" fill="#040d0a"/>
        <path d="M43 42 Q48 46 53 42" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
    )
  }

  return (
    <img
      src={src}
      alt="Bastion Orbit mascot"
      className="w-52 h-auto object-contain"
      onError={() => setFailed(true)}
    />
  )
}

export function EmptyState({ variant = 'empty', title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-14 px-6 text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-2 pt-2"
      >
        <SlothImage variant={variant} />
      </motion.div>
      <h3 className="mt-3 text-text-primary font-display font-bold text-base">{title}</h3>
      {description && (
        <p className="mt-1.5 text-text-secondary text-xs max-w-xs leading-relaxed">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </motion.div>
  )
}

export default EmptyState
