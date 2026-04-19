import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Bastion } from '@/types'
import Button from './Button'
import { Modal } from './Modal'

interface AddBastionWizardProps {
  onClose: () => void
  onSave: (bastion: Omit<Bastion, 'id' | 'status' | 'targets'>) => void
}

type Step = 'config' | 'key' | 'test'

interface BastionConfig {
  name: string
  host: string
  user: string
  sshPort: number
  keyPath: string
}

const defaults: BastionConfig = {
  name: '',
  host: '',
  user: 'ubuntu',
  sshPort: 22,
  keyPath: '~/.ssh/id_rsa',
}

const STEP_LABELS: Record<Step, string> = {
  config: 'Connection info',
  key:    'SSH key',
  test:   'Test & save',
}

// ── Step 1: Basic info ─────────────────────────────────────────────────────────

function StepConfig({ cfg, onChange }: { cfg: BastionConfig; onChange: (p: Partial<BastionConfig>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-xs">Enter the details for this bastion host.</p>

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Nickname</label>
        <input
          className="field-input"
          placeholder="e.g. prod-bastion"
          value={cfg.name}
          onChange={e => onChange({ name: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-text-secondary mb-1">Hostname / IP</label>
          <input
            className="field-input font-mono"
            placeholder="bastion.corp.com"
            value={cfg.host}
            onChange={e => onChange({ host: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">SSH port</label>
          <input
            className="field-input font-mono"
            type="number"
            placeholder="22"
            value={cfg.sshPort}
            onChange={e => onChange({ sshPort: Number(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">SSH user</label>
        <input
          className="field-input font-mono"
          placeholder="ubuntu"
          value={cfg.user}
          onChange={e => onChange({ user: e.target.value })}
        />
      </div>
    </div>
  )
}

// ── Step 2: SSH key ────────────────────────────────────────────────────────────

function StepKey({ cfg, onChange }: { cfg: BastionConfig; onChange: (p: Partial<BastionConfig>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-text-secondary text-xs">
        Point to your private SSH key. Bastion Orbit stores only the path — the key stays on your disk.
      </p>

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">Private key path</label>
        <input
          className="field-input font-mono"
          placeholder="~/.ssh/id_rsa"
          value={cfg.keyPath}
          onChange={e => onChange({ keyPath: e.target.value })}
        />
        <p className="text-text-muted text-[11px] mt-1.5">
          Use <code className="font-mono text-accent">~</code> for your home directory. The key is never copied or uploaded.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-bg-surface p-3 space-y-1.5">
        <p className="text-text-secondary text-xs font-semibold">The SSH command that will be used:</p>
        <code className="text-[11px] font-mono text-text-muted block break-all">
          ssh -N -L &lt;localPort&gt;:&lt;remoteHost&gt;:&lt;remotePort&gt; {cfg.user || 'user'}@{cfg.host || 'host'}
          {cfg.sshPort !== 22 ? ` -p ${cfg.sshPort}` : ''} -i {cfg.keyPath || '~/.ssh/id_rsa'}
          {' '}-o ServerAliveInterval=60
        </code>
      </div>
    </div>
  )
}

// ── Step 3: Test ───────────────────────────────────────────────────────────────

function StepTest({ status, latency, error }: { status: 'idle' | 'testing' | 'ok' | 'error'; latency?: number; error?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      {status === 'idle' && (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-bg-surface2 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
            </svg>
          </div>
          <p className="text-text-secondary text-sm">Ready to test the SSH connection</p>
          <p className="text-text-muted text-xs mt-1">We'll try to open a session and immediately exit.</p>
        </div>
      )}
      {status === 'testing' && (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-text-secondary text-sm">Connecting…</p>
        </div>
      )}
      {status === 'ok' && (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="text-text-primary text-sm font-semibold">Bastion reachable</p>
          {latency && <p className="text-text-muted text-xs mt-1">{latency}ms latency</p>}
        </div>
      )}
      {status === 'error' && (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <p className="text-text-primary text-sm font-semibold">Connection failed</p>
          {error && <p className="text-danger text-xs mt-2 font-mono max-w-xs text-center">{error}</p>}
          <p className="text-text-muted text-xs mt-2">Check host, user, and key path. You can still save and fix later.</p>
        </div>
      )}
    </div>
  )
}

// ── Wizard ─────────────────────────────────────────────────────────────────────

export function AddBastionWizard({ onClose, onSave }: AddBastionWizardProps) {
  const [step, setStep]             = useState<Step>('config')
  const [cfg, setCfg]               = useState<BastionConfig>(defaults)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')
  const [testLatency, setTestLatency] = useState<number>()
  const [testError, setTestError]   = useState<string>()

  const steps: Step[] = ['config', 'key', 'test']
  const stepIdx = steps.indexOf(step)

  async function handleTest() {
    setTestStatus('testing')
    setTestError(undefined)
    // Simulate — real impl calls Tauri command
    await new Promise(r => setTimeout(r, 1_400))
    if (!cfg.host || !cfg.name) {
      setTestStatus('error')
      setTestError('Host and name are required')
      return
    }
    setTestStatus('ok')
    setTestLatency(42)
  }

  function handleSave() {
    onSave({ name: cfg.name, host: cfg.host, user: cfg.user, sshPort: cfg.sshPort, keyPath: cfg.keyPath })
    onClose()
  }

  const canAdvance =
    step === 'config' ? cfg.name.trim().length > 0 && cfg.host.trim().length > 0 :
    step === 'key'    ? cfg.keyPath.trim().length > 0 :
    false

  return (
    <Modal open onClose={onClose} title="Add Bastion" width="w-[520px]">
      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-5">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-1.5 ${i < stepIdx ? 'text-primary' : i === stepIdx ? 'text-text-primary' : 'text-text-muted'}`}>
              <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                i < stepIdx  ? 'bg-primary text-white' :
                i === stepIdx ? 'bg-primary/20 text-primary' :
                'bg-bg-surface2 text-text-muted'
              }`}>
                {i < stepIdx ? '✓' : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{STEP_LABELS[s]}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${i < stepIdx ? 'bg-primary/40' : 'bg-border-subtle'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.15 }}
        >
          {step === 'config' && <StepConfig cfg={cfg} onChange={p => setCfg(c => ({ ...c, ...p }))} />}
          {step === 'key'    && <StepKey cfg={cfg} onChange={p => setCfg(c => ({ ...c, ...p }))} />}
          {step === 'test'   && <StepTest status={testStatus} latency={testLatency} error={testError} />}
        </motion.div>
      </AnimatePresence>

      {/* Footer */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-subtle">
        <Button
          variant="ghost"
          size="sm"
          onClick={stepIdx === 0 ? onClose : () => setStep(steps[stepIdx - 1])}
        >
          {stepIdx === 0 ? 'Cancel' : '← Back'}
        </Button>
        <div className="flex items-center gap-2">
          {step === 'test' && testStatus !== 'ok' && (
            <Button variant="secondary" size="sm" onClick={handleTest} disabled={testStatus === 'testing'}>
              {testStatus === 'testing' ? 'Testing…' : 'Test connection'}
            </Button>
          )}
          {step !== 'test' && (
            <Button variant="primary" size="sm" onClick={() => setStep(steps[stepIdx + 1])} disabled={!canAdvance}>
              Continue →
            </Button>
          )}
          {step === 'test' && (testStatus === 'ok' || testStatus === 'error') && (
            <Button variant="primary" size="sm" onClick={handleSave}>
              {testStatus === 'error' ? 'Save anyway' : 'Save bastion'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default AddBastionWizard
