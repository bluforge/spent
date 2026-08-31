import { catColor, type Category, type Expense } from '../db'
import { dayLabel, fmtDin } from '../lib/format'
import CategoryIcon from './CategoryIcon'

export default function ExpenseRow({
  expense,
  category,
  showDay,
  onClick,
}: {
  expense: Expense
  category?: Category
  showDay?: boolean
  onClick: () => void
}) {
  const subtitle = expense.note ?? (showDay ? dayLabel(expense.date) : undefined)
  return (
    <button onClick={onClick} className="press flex w-full items-center gap-3 py-2.5 text-left">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          background: `color-mix(in srgb, ${catColor(category?.color ?? 'gray')} 16%, transparent)`,
        }}
      >
        <CategoryIcon
          icon={category?.icon ?? 'package'}
          size={18}
          color={catColor(category?.color ?? 'gray')}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium">{category?.name ?? 'Nepoznato'}</span>
        {subtitle && (
          <span className="block truncate text-xs" style={{ color: 'var(--ink-3)' }}>
            {subtitle}
          </span>
        )}
      </span>
      <span className="tnum shrink-0 text-[15px] font-semibold">{fmtDin(expense.amount)}</span>
    </button>
  )
}
