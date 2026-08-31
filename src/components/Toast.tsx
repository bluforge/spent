import { Check } from 'lucide-react'

export default function Toast({ message }: { message: string }) {
  if (!message) return null
  return (
    <div
      key={message}
      className="glass-strong animate-pop-in fixed left-1/2 z-[70] -translate-x-1/2 rounded-full px-4 py-2.5"
      style={{ bottom: 'max(calc(env(safe-area-inset-bottom) + 84px), 100px)' }}
    >
      <div className="flex items-center gap-2 whitespace-nowrap text-sm font-medium">
        <Check size={16} strokeWidth={3} style={{ color: 'var(--accent)' }} />
        {message}
      </div>
    </div>
  )
}
