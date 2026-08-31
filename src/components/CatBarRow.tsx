import { catColor, type Category } from '../db'
import { fmtDin } from '../lib/format'

/**
 * Category breakdown row: icon, name, amount + thin bar.
 * Bar length = share relative to the largest category (magnitude comparison).
 */
export default function CatBarRow({
  category,
  total,
  max,
}: {
  category: Category
  total: number
  max: number
}) {
  const pct = max > 0 ? Math.max(2, (total / max) * 100) : 0
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base"
          style={{ background: `color-mix(in srgb, ${catColor(category.color)} 16%, transparent)` }}
        >
          {category.icon}
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{category.name}</span>
        <span className="tnum shrink-0 text-[15px] font-semibold">{fmtDin(total)}</span>
      </div>
      <div
        className="ml-[42px] mt-1.5 h-2 overflow-hidden rounded-full"
        style={{ background: 'color-mix(in srgb, var(--ink) 6%, transparent)' }}
      >
        <div
          className="h-full rounded-r-full transition-[width] duration-500"
          style={{ width: `${pct}%`, background: catColor(category.color) }}
        />
      </div>
    </div>
  )
}
