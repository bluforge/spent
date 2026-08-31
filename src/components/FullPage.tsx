import { useEffect, type ReactNode } from 'react'
import { Check, X } from 'lucide-react'

/**
 * Full-screen modal page (Fitness-style "Add Workout"): X to close top-left,
 * accent ✓ to save top-right, big title, content scrolls under the keyboard.
 */
export default function FullPage({
  open,
  title,
  onClose,
  onSave,
  saveDisabled,
  headerRight,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  onSave?: () => void
  saveDisabled?: boolean
  headerRight?: ReactNode
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="animate-rise fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'var(--bg)' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="mx-auto w-full max-w-md px-5 pb-16"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 14px)' }}
      >
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            aria-label="Zatvori"
            className="press flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: 'color-mix(in srgb, var(--ink) 8%, transparent)' }}
          >
            <X size={19} />
          </button>
          <div className="flex items-center gap-2">
            {headerRight}
            {onSave && (
              <button
                onClick={onSave}
                disabled={saveDisabled}
                aria-label="Sačuvaj"
                className="press flex h-10 w-10 items-center justify-center rounded-full"
                style={{
                  background: saveDisabled
                    ? 'color-mix(in srgb, var(--accent) 22%, transparent)'
                    : 'var(--accent)',
                  color: saveDisabled ? 'var(--ink-3)' : 'var(--on-accent)',
                }}
              >
                <Check size={20} strokeWidth={2.8} />
              </button>
            )}
          </div>
        </div>
        <h1 className="mt-4 text-[28px] font-bold leading-tight">{title}</h1>
        {children}
      </div>
    </div>
  )
}
