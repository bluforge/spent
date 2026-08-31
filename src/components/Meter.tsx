/**
 * Progress toward a limit: the fill carries severity (hue -> warning -> over),
 * the track is a lighter step of the same hue. The parent renders the textual state.
 */
export default function Meter({ value, max, hue }: { value: number; max: number; hue?: string }) {
  const base = hue ?? 'var(--accent)'
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const over = value > max
  const near = !over && pct >= 85
  const fill = over ? 'var(--danger)' : near ? 'var(--warn)' : base
  return (
    <div
      className="h-2 overflow-hidden rounded-full"
      style={{ background: `color-mix(in srgb, ${base} 15%, transparent)` }}
    >
      <div
        className="h-full rounded-r-full transition-[width] duration-500"
        style={{ width: `${pct}%`, background: fill }}
      />
    </div>
  )
}
