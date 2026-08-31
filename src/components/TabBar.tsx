import { ChartColumn, Ellipsis, History, House, Plus } from 'lucide-react'

export type Tab = 'home' | 'history' | 'stats' | 'more'

const ITEMS: { key: Tab; label: string; Icon: typeof House }[] = [
  { key: 'home', label: 'Pregled', Icon: House },
  { key: 'history', label: 'Istorija', Icon: History },
  { key: 'stats', label: 'Statistika', Icon: ChartColumn },
  { key: 'more', label: 'Još', Icon: Ellipsis },
]

export default function TabBar({
  tab,
  onTab,
  onAdd,
}: {
  tab: Tab
  onTab: (t: Tab) => void
  onAdd: () => void
}) {
  return (
    <div
      className="fixed inset-x-0 z-40"
      style={{ bottom: 'max(calc(env(safe-area-inset-bottom) - 10px), 12px)' }}
    >
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4">
        <nav className="glass-pill flex flex-1 items-center rounded-full p-1.5">
          {ITEMS.map(({ key, label, Icon }) => {
            const active = key === tab
            return (
              <button
                key={key}
                onClick={() => onTab(key)}
                className="press flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5"
                style={
                  active
                    ? {
                        background: 'color-mix(in srgb, var(--ink) 11%, transparent)',
                        boxShadow:
                          'inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 2px 10px rgba(0, 0, 0, 0.25)',
                      }
                    : undefined
                }
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  size={23}
                  strokeWidth={active ? 2.4 : 2}
                  style={{ color: active ? 'var(--accent)' : 'var(--ink-3)' }}
                />
                <span
                  className="text-[11px] font-medium leading-none"
                  style={{ color: active ? 'var(--ink)' : 'var(--ink-3)' }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </nav>
        <button
          onClick={onAdd}
          aria-label="Dodaj trošak"
          className="press flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full"
          style={{
            background:
              'linear-gradient(180deg, color-mix(in srgb, var(--accent) 80%, white) 0%, var(--accent) 55%, color-mix(in srgb, var(--accent) 86%, black) 100%)',
            color: 'var(--on-accent)',
            boxShadow:
              'var(--shadow-glass), 0 4px 14px color-mix(in srgb, var(--accent) 30%, transparent), inset 0 1.5px 0 rgba(255,255,255,0.45), inset 0 -2px 4px rgba(0,0,0,0.18)',
          }}
        >
          <Plus size={28} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  )
}
