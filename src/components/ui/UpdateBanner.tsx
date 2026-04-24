import { motion, AnimatePresence } from 'framer-motion'
import { useUpdateCheck } from '../../hooks/useUpdateCheck'

export function UpdateBanner() {
  const { update, installing } = useUpdateCheck()

  return (
    <AnimatePresence>
      {update && (
        <motion.div
          key="update-banner"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-1.5 bg-primary/10 border-b border-primary/20 text-xs">
            <span className="text-primary font-medium">
              Bastion Orbit {update.version} available
            </span>
            <button
              onClick={update.install}
              disabled={installing}
              className="px-2 py-0.5 rounded bg-primary text-white font-semibold hover:bg-primary/80 disabled:opacity-50 transition-colors"
            >
              {installing ? 'Installing…' : 'Update'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
