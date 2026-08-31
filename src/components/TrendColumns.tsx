import { useState } from 'react'
import { fmtCompact, fmtDin } from '../lib/format'

export interface TrendPoint {
  label: string
  name: string
  total: number
  current: boolean
}

const niceCeil = (v: number) => {
  if (v <= 0) return 1000
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / p
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10
  return m * p
}

const PLOT_H = 150

/** Monthly columns: current month in the full accent, previous months in a lighter step of the same hue. */
export default function TrendColumns({ data }: { data: TrendPoint[] }) {
  const [selected, setSelected] = useState<number | null>(null)
  const max = niceCeil(Math.max(...data.map((d) => d.total)))
  const ticks = [max, max / 2]

  return (
    <div>
      <div className="relative" style={{ height: PLOT_H }}>
        {/* grid: solid hairlines, recessive */}
        {ticks.map((t) => (
          <div
            key={t}
            className="pointer-events-none absolute inset-x-0"
            style={{ bottom: `${(t / max) * 100}%` }}
          >
            <div style={{ borderTop: '1px solid var(--grid)' }} />
            <span
              className="tnum absolute right-0 top-0 z-10 -translate-y-1/2 pl-1 text-[10px]"
              style={{ color: 'var(--ink-3)', background: 'var(--surface)' }}
            >
              {fmtCompact(t)}
            </span>
          </div>
        ))}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{ borderTop: '1px solid color-mix(in srgb, var(--ink) 14%, transparent)' }}
        />

        {/* columns */}
        <div className="absolute inset-0 flex items-end">
          {data.map((d, i) => {
            const h = Math.max(d.total > 0 ? 3 : 0, (d.total / max) * PLOT_H)
            const isSel = selected === i
            return (
              <button
                key={i}
                className="relative flex h-full flex-1 flex-col items-center justify-end"
                onClick={() => setSelected(isSel ? null : i)}
                aria-label={`${d.name}: ${fmtDin(d.total)}`}
              >
                {d.current && d.total > 0 && (
                  <span
                    className="mb-1 text-[10px] font-semibold"
                    style={{ color: 'var(--ink-2)' }}
                  >
                    {fmtCompact(d.total)}
                  </span>
                )}
                <span
                  className="w-[22px] rounded-t-[4px] transition-all duration-500"
                  style={{
                    height: h,
                    background: d.current
                      ? 'var(--accent)'
                      : 'color-mix(in srgb, var(--accent) 32%, transparent)',
                    filter: isSel ? 'brightness(1.25)' : undefined,
                  }}
                />
              </button>
            )
          })}
        </div>

        {/* tap tooltip */}
        {selected != null && (
          <div
            className="glass-strong animate-pop-in pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium"
            style={{
              left: `${((selected + 0.5) / data.length) * 100}%`,
            }}
          >
            {data[selected].name} — <span className="font-semibold">{fmtDin(data[selected].total)}</span>
          </div>
        )}
      </div>

      {/* month labels */}
      <div className="mt-1.5 flex">
        {data.map((d, i) => (
          <span
            key={i}
            className="flex-1 text-center text-[10px] font-medium"
            style={{ color: d.current ? 'var(--ink-2)' : 'var(--ink-3)' }}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}
