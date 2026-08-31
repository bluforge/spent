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
      style={{ bottom: 'calc(env(safe-area-inset-bottom) + 12px)' }}
    >
      <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4">
        <nav className="glass flex flex-1 items-center rounded-full p-1.5">
          {ITEMS.map(({ key, label, Icon }) => {
            const active = key === tab
            return (
              <button
                key={key}
                onClick={() => onTab(key)}
                className="press flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5"
                style={active ? { background: 'color-mix(in srgb, var(--ink) 9%, transparent)' } : undefined}
                aria-current={active ? 'page' : undefined}
              >
                <Icon
                  size={21}
                  strokeWidth={active ? 2.4 : 2}
                  style={{ color: active ? 'var(--accent)' : 'var(--ink-3)' }}
                />
                <span
                  className="text-[10px] font-medium leading-none"
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
          className="press flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full"
          style={{
            background: 'var(--accent)',
            color: 'var(--on-accent)',
            boxShadow: 'var(--shadow-glass), inset 0 1px 0 rgba(255,255,255,0.25)',
          }}
        >
          <Plus size={26} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  )
}
