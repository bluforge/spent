import { useLiveQuery } from 'dexie-react-hooks'
import { TrendingDown, TrendingUp, TriangleAlert } from 'lucide-react'
import { catColor, db, type Expense } from '../db'
import {
  addMonths,
  currentMonth,
  fmtDin,
  fmtNum,
  monthLabel,
  monthRange,
  MONTHS_LOC,
  sameMonth,
  type Month,
} from '../lib/format'
import { expensesInMonth, sumByCategory, totalOf } from '../lib/queries'
import { useSettings } from '../lib/settings'
import CatBarRow from '../components/CatBarRow'
import ExpenseRow from '../components/ExpenseRow'
import Meter from '../components/Meter'
import MonthSwitcher from '../components/MonthSwitcher'

export default function Home({
  month,
  onMonth,
  onEdit,
  onSeeAll,
}: {
  month: Month
  onMonth: (m: Month) => void
  onEdit: (e: Expense) => void
  onSeeAll: () => void
}) {
  const settings = useSettings()
  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? []
  const expenses = useLiveQuery(() => expensesInMonth(month), [month.year, month.month])
  const prev = addMonths(month, -1)
  const prevExpenses = useLiveQuery(() => expensesInMonth(prev), [prev.year, prev.month]) ?? []

  const loaded = expenses !== undefined
  const list = expenses ?? []
  const total = totalOf(list)
  const prevTotal = totalOf(prevExpenses)
  const sums = sumByCategory(list, categories)
  const maxCat = sums[0]?.total ?? 0
  const catById = new Map(categories.map((c) => [c.id, c]))

  const isCurrent = sameMonth(month, currentMonth())
  const { days } = monthRange(month)
  const elapsed = isCurrent ? new Date().getDate() : days
  const avg = list.length > 0 ? total / elapsed : 0

  const diff = total - prevTotal
  const showDelta = prevTotal > 0 && list.length > 0 && diff !== 0

  const recent = [...list]
    .sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1))
    .slice(0, 4)

  const budget = settings.monthlyBudget
  const spentBy = new Map(sums.map((s) => [s.category.id, s.total]))
  const catBudgets =
    list.length > 0
      ? categories
          .filter((c) => c.budget && c.budget > 0)
          .sort((a, b) => a.order - b.order)
          .map((c) => ({ c, spent: spentBy.get(c.id) ?? 0 }))
      : []

  const yearSuffix = month.year !== currentMonth().year ? ` ${month.year}.` : ''

  return (
    <div className="animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-[13px] font-medium" style={{ color: 'var(--ink-3)' }}>
            Spent
          </div>
          <h1 className="text-[28px] font-bold leading-tight">{monthLabel(month)}</h1>
        </div>
        <MonthSwitcher month={month} onMonth={onMonth} />
      </header>

      {/* monthly total */}
      <section className="card mt-4 p-5">
        <div className="text-[13px]" style={{ color: 'var(--ink-2)' }}>
          Potrošeno u {MONTHS_LOC[month.month]}
          {yearSuffix}
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-[46px] font-bold leading-none tracking-tight">{fmtNum(total)}</span>
          <span className="text-xl font-semibold" style={{ color: 'var(--ink-2)' }}>
            din
          </span>
        </div>
        {showDelta && (
          <div
            className="mt-3 flex items-center gap-1.5 text-[13px] font-medium"
            style={{ color: diff < 0 ? 'var(--good)' : 'var(--danger)' }}
          >
            {diff < 0 ? <TrendingDown size={15} /> : <TrendingUp size={15} />}
            {fmtNum(Math.abs(diff))} din {diff < 0 ? 'manje' : 'više'} nego u {MONTHS_LOC[prev.month]}
          </div>
        )}
        {list.length > 0 && (
          <div className="mt-1 text-[13px]" style={{ color: 'var(--ink-2)' }}>
            Prosečno {fmtDin(avg)} dnevno
          </div>
        )}
      </section>

      {/* overall monthly budget */}
      {budget != null && budget > 0 && (
        <section className="card mt-3 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Mesečni budžet</span>
            <span className="tnum" style={{ color: 'var(--ink-2)' }}>
              {fmtNum(total)} / {fmtNum(budget)} din
            </span>
          </div>
          <div className="mt-2">
            <Meter value={total} max={budget} />
          </div>
          {total > budget && (
            <div
              className="mt-2 flex items-center gap-1.5 text-[13px] font-medium"
              style={{ color: 'var(--danger)' }}
            >
              <TriangleAlert size={14} />
              Preko budžeta za {fmtNum(total - budget)} din
            </div>
          )}
        </section>
      )}

      {/* empty month */}
      {loaded && list.length === 0 && (
        <section className="card mt-3 flex flex-col items-center px-5 py-12 text-center">
          <span className="text-4xl">🌿</span>
          <p className="mt-3 text-sm font-medium">Nema troškova u ovom mesecu</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--ink-3)' }}>
            Dodaj prvi pomoću zelenog + dugmeta
          </p>
        </section>
      )}

      {/* by category */}
      {sums.length > 0 && (
        <section className="card mt-3 p-5">
          <h2 className="text-[15px] font-semibold">Po kategorijama</h2>
          <div className="mt-3.5 space-y-4">
            {sums.map((s) => (
              <CatBarRow key={s.category.id} category={s.category} total={s.total} max={maxCat} />
            ))}
          </div>
        </section>
      )}

      {/* per-category budgets */}
      {catBudgets.length > 0 && (
        <section className="card mt-3 p-5">
          <h2 className="text-[15px] font-semibold">Budžeti po kategorijama</h2>
          <div className="mt-3.5 space-y-4">
            {catBudgets.map(({ c, spent }) => {
              const over = spent > (c.budget ?? 0)
              return (
                <div key={c.id}>
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base"
                      style={{
                        background: `color-mix(in srgb, ${catColor(c.color)} 16%, transparent)`,
                      }}
                    >
                      {c.icon}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{c.name}</span>
                    {over && <TriangleAlert size={14} style={{ color: 'var(--danger)' }} />}
                    <span
                      className="tnum shrink-0 text-[13px] font-medium"
                      style={{ color: over ? 'var(--danger)' : 'var(--ink-2)' }}
                    >
                      {fmtNum(spent)} / {fmtNum(c.budget ?? 0)}
                    </span>
                  </div>
                  <div className="ml-[42px] mt-1.5">
                    <Meter value={spent} max={c.budget ?? 0} hue={catColor(c.color)} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* recent */}
      {recent.length > 0 && (
        <section className="card mt-3 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Nedavno</h2>
            <button
              onClick={onSeeAll}
              className="press text-[13px] font-medium"
              style={{ color: 'var(--accent)' }}
            >
              Sve →
            </button>
          </div>
          <div className="mt-1">
            {recent.map((e, i) => (
              <div key={e.id} className={i > 0 ? 'hairline-t' : ''}>
                <ExpenseRow
                  expense={e}
                  category={catById.get(e.categoryId)}
                  showDay
                  onClick={() => onEdit(e)}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
