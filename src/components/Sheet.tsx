import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

export default function Sheet({
  open,
  onClose,
  title,
  headerRight,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
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
    <div className="fixed inset-0 z-50">
      <div className="animate-fade-in absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        className="glass-strong animate-rise absolute inset-x-2 bottom-2 mx-auto max-w-md overflow-hidden rounded-[32px]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        role="dialog"
        aria-modal="true"
      >
        <div
          className="mx-auto mt-2.5 h-1 w-9 rounded-full"
          style={{ background: 'color-mix(in srgb, var(--ink) 22%, transparent)' }}
        />
        <div className="flex items-center justify-between px-5 pb-1 pt-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            {headerRight}
            <button
              onClick={onClose}
              aria-label="Zatvori"
              className="press rounded-full p-2"
              style={{ background: 'color-mix(in srgb, var(--ink) 7%, transparent)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="max-h-[82dvh] overflow-y-auto px-5 pb-5 pt-2">{children}</div>
      </div>
    </div>
  )
}
