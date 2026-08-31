import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, currentMonth, sameMonth, type Month } from '../lib/format'

export default function MonthSwitcher({
  month,
  onMonth,
}: {
  month: Month
  onMonth: (m: Month) => void
}) {
  const atNow = sameMonth(month, currentMonth())
  const bg = { background: 'color-mix(in srgb, var(--ink) 7%, transparent)' }
  return (
    <div className="flex items-center gap-2">
      <button
        className="press flex h-11 w-11 items-center justify-center rounded-full"
        style={bg}
        onClick={() => onMonth(addMonths(month, -1))}
        aria-label="Prethodni mesec"
      >
        <ChevronLeft size={22} strokeWidth={2.5} />
      </button>
      <button
        className="press flex h-11 w-11 items-center justify-center rounded-full"
        style={{ ...bg, opacity: atNow ? 0.35 : 1 }}
        disabled={atNow}
        onClick={() => onMonth(addMonths(month, 1))}
        aria-label="Sledeći mesec"
      >
        <ChevronRight size={22} strokeWidth={2.5} />
      </button>
    </div>
  )
}
