export default function Confirm({
  open,
  title,
  message,
  confirmLabel = 'Potvrdi',
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-8">
      <div className="animate-fade-in absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="glass-strong animate-pop-in relative w-full max-w-xs rounded-3xl p-5 text-center">
        <h3 className="text-base font-semibold">{title}</h3>
        {message && (
          <p className="mt-1.5 text-sm" style={{ color: 'var(--ink-2)' }}>
            {message}
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <button
            className="press flex-1 rounded-full py-2.5 text-sm font-semibold"
            style={{ background: 'color-mix(in srgb, var(--ink) 8%, transparent)' }}
            onClick={onCancel}
          >
            Otkaži
          </button>
          <button
            className="press flex-1 rounded-full py-2.5 text-sm font-semibold"
            style={{
              background: danger ? 'var(--danger)' : 'var(--accent)',
              color: danger ? '#fff' : 'var(--on-accent)',
            }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
