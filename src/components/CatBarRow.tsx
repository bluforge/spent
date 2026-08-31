import { catColor, type Category } from '../db'
import { fmtDin } from '../lib/format'
import CategoryIcon from './CategoryIcon'

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
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in srgb, ${catColor(category.color)} 16%, transparent)` }}
        >
          <CategoryIcon icon={category.icon} size={20} color={catColor(category.color)} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{category.name}</span>
        <span className="tnum shrink-0 text-[15px] font-semibold">{fmtDin(total)}</span>
      </div>
      <div
        className="ml-[46px] mt-1.5 h-2 overflow-hidden rounded-full"
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
