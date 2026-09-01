import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ChartColumn } from 'lucide-react'
import { db } from '../db'
import {
  addMonths,
  currentMonth,
  dayLabel,
  fmtDin,
  monthRange,
  MONTHS_LOC,
  MONTHS_NOM,
  MONTHS_SHORT,
} from '../lib/format'
import { sumByCategory } from '../lib/queries'
import CatBarRow from '../components/CatBarRow'
import TrendColumns, { type TrendPoint } from '../components/TrendColumns'

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <div className="text-xs font-medium" style={{ color: 'var(--ink-3)' }}>
        {label}
      </div>
      <div className="mt-1 text-[22px] font-bold leading-tight">{value}</div>
      {sub && (
        <div className="mt-0.5 text-[11px]" style={{ color: 'var(--ink-3)' }}>
          {sub}
        </div>
      )}
    </div>
  )
}

const pad2 = (n: number) => String(n).padStart(2, '0')

export default function Stats() {
  const [selTag, setSelTag] = useState<string | null>(null)
  const now = currentMonth()
  const sixStart = monthRange(addMonths(now, -5)).start
  const yearStart = `${now.year}-01-01`

  const categories = useLiveQuery(() => db.categories.toArray(), []) ?? []
  const six =
    useLiveQuery(() => db.expenses.where('date').aboveOrEqual(sixStart).toArray(), [sixStart]) ?? []
  const yearList =
    useLiveQuery(() => db.expenses.where('date').aboveOrEqual(yearStart).toArray(), [yearStart]) ??
    []

  const byMonth = new Map<string, number>()
  for (const e of six) {
    const k = e.date.slice(0, 7)
    byMonth.set(k, (byMonth.get(k) ?? 0) + e.amount)
  }
  const trend: TrendPoint[] = Array.from({ length: 6 }, (_, i) => {
    const m = addMonths(now, i - 5)
    const k = `${m.year}-${pad2(m.month + 1)}`
    return {
      label: MONTHS_SHORT[m.month],
      name: MONTHS_NOM[m.month],
      total: byMonth.get(k) ?? 0,
      current: i === 5,
    }
  })

  const nowKey = `${now.year}-${pad2(now.month + 1)}`
  const curList = six.filter((e) => e.date.slice(0, 7) === nowKey)
  const curTotal = curList.reduce((s, e) => s + e.amount, 0)
  const elapsed = new Date().getDate()
  const avgDay = curList.length > 0 ? curTotal / elapsed : 0

  const sixTotal = six.reduce((s, e) => s + e.amount, 0)
  const avg6 = sixTotal / 6

  const byDay = new Map<string, number>()
  for (const e of curList) byDay.set(e.date, (byDay.get(e.date) ?? 0) + e.amount)
  let maxDay: { date: string; total: number } | null = null
  for (const [date, total] of byDay) {
    if (!maxDay || total > maxDay.total) maxDay = { date, total }
  }

  const yearTotal = yearList.reduce((s, e) => s + e.amount, 0)

  const topCats = sumByCategory(six, categories).slice(0, 5)
  const maxTop = topCats[0]?.total ?? 0

  const tagMap = new Map<string, { display: string; total: number }>()
  for (const e of six) {
    if (!e.tag) continue
    const k = e.tag.toLowerCase()
    const s = tagMap.get(k)
    if (s) s.total += e.amount
    else tagMap.set(k, { display: e.tag, total: e.amount })
  }
  const topTags = [...tagMap.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
  const maxTag = topTags[0]?.total ?? 0

  const selTrend: TrendPoint[] | null = selTag
    ? Array.from({ length: 6 }, (_, i) => {
        const m = addMonths(now, i - 5)
        const k = `${m.year}-${pad2(m.month + 1)}`
        let total = 0
        for (const e of six) {
          if (e.tag?.toLowerCase() === selTag && e.date.slice(0, 7) === k) total += e.amount
        }
        return { label: MONTHS_SHORT[m.month], name: MONTHS_NOM[m.month], total, current: i === 5 }
      })
    : null

  const empty = six.length === 0 && yearList.length === 0

  return (
    <div className="animate-fade-in">
      <header>
        <h1 className="text-[28px] font-bold leading-tight">Statistika</h1>
        <div className="text-[13px]" style={{ color: 'var(--ink-3)' }}>
          Poslednjih 6 meseci
        </div>
      </header>

      {empty ? (
        <section className="card mt-4 flex flex-col items-center px-5 py-12 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)' }}
          >
            <ChartColumn size={26} style={{ color: 'var(--accent)' }} />
          </span>
          <p className="mt-3 text-sm font-medium">Statistika stiže sa prvim troškovima</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--ink-3)' }}>
            Dodaj unos pomoću + dugmeta
          </p>
        </section>
      ) : (
        <>
          <section className="card mt-4 p-5">
            <h2 className="text-base font-semibold">Mesečna potrošnja</h2>
            <div className="mt-4">
              <TrendColumns data={trend} />
            </div>
          </section>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <Tile label="Prosek mesečno" value={fmtDin(avg6)} sub="poslednjih 6 meseci" />
            <Tile label="Dnevni prosek" value={fmtDin(avgDay)} sub={`u ${MONTHS_LOC[now.month]}`} />
            <Tile
              label="Najskuplji dan"
              value={maxDay ? fmtDin(maxDay.total) : '—'}
              sub={maxDay ? dayLabel(maxDay.date) : 'ovog meseca'}
            />
            <Tile label="Ukupno" value={fmtDin(yearTotal)} sub={`u ${now.year}.`} />
          </div>

          {topCats.length > 0 && (
            <section className="card mt-3 p-5">
              <h2 className="text-base font-semibold">Top kategorije (6 mes.)</h2>
              <div className="mt-3.5 space-y-4">
                {topCats.map((s) => (
                  <CatBarRow key={s.category.id} category={s.category} total={s.total} max={maxTop} />
                ))}
              </div>
            </section>
          )}

          {topTags.length > 0 && (
            <section className="card mt-3 p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-semibold">Oznake (6 mes.)</h2>
                <span className="text-xs" style={{ color: 'var(--ink-3)' }}>
                  tapni za trend
                </span>
              </div>
              <div className="mt-3.5 space-y-3.5">
                {topTags.map((t) => {
                  const active = selTag === t.key
                  return (
                    <button
                      key={t.key}
                      onClick={() => setSelTag(active ? null : t.key)}
                      className="press block w-full text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="min-w-0 flex-1 truncate text-[15px] font-medium"
                          style={active ? { color: 'var(--accent)' } : undefined}
                        >
                          #{t.display}
                        </span>
                        <span className="tnum shrink-0 text-[15px] font-semibold">
                          {fmtDin(t.total)}
                        </span>
                      </div>
                      <div
                        className="mt-1.5 h-2 overflow-hidden rounded-full"
                        style={{ background: 'color-mix(in srgb, var(--ink) 6%, transparent)' }}
                      >
                        <div
                          className="h-full rounded-r-full transition-[width] duration-500"
                          style={{
                            width: `${Math.max(2, (t.total / maxTag) * 100)}%`,
                            background: active
                              ? 'var(--accent)'
                              : 'color-mix(in srgb, var(--accent) 45%, transparent)',
                          }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
              {selTrend && (
                <div className="hairline-t mt-4 pt-4">
                  <div className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
                    #{topTags.find((t) => t.key === selTag)?.display} po mesecima
                  </div>
                  <div className="mt-4">
                    <TrendColumns data={selTrend} />
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}
