import React from 'react'

type CalloutVariant = 'info' | 'warning' | 'error' | 'success'

interface CalloutProps {
  variant?: CalloutVariant
  title?: string
  children: React.ReactNode
}

const styles: Record<CalloutVariant, { border: string; bg: string; title: string; text: string }> = {
  info:    { border: 'border-info/30',    bg: 'bg-info/5',    title: 'text-info',    text: 'text-text-secondary' },
  warning: { border: 'border-warning/30', bg: 'bg-warning/5', title: 'text-warning', text: 'text-text-secondary' },
  error:   { border: 'border-danger/30',  bg: 'bg-danger/5',  title: 'text-danger',  text: 'text-text-secondary' },
  success: { border: 'border-success/30', bg: 'bg-success/5', title: 'text-success', text: 'text-text-secondary' },
}

export function Callout({ variant = 'info', title, children }: CalloutProps) {
  const s = styles[variant]
  return (
    <div className={`rounded-lg border ${s.border} ${s.bg} px-3 py-2.5`}>
      {title && <p className={`text-xs font-semibold mb-1 ${s.title}`}>{title}</p>}
      <div className={`text-xs leading-relaxed ${s.text}`}>{children}</div>
    </div>
  )
}

export default Callout
