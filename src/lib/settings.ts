import { useSyncExternalStore } from 'react'

export type ThemePref = 'dark' | 'light' | 'system'

export interface Settings {
  theme: ThemePref
  monthlyBudget?: number
}

const KEY = 'spent-settings'
const THEME_KEY = 'spent-theme' // also read by the inline script in index.html before first paint

const defaults: Settings = { theme: 'dark' }

let current: Settings = load()
const listeners = new Set<() => void>()

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaults }
    const parsed = JSON.parse(raw) as Partial<Settings>
    return { ...defaults, ...parsed }
  } catch {
    return { ...defaults }
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
    localStorage.setItem(THEME_KEY, current.theme)
  } catch {
    // storage unavailable — the app keeps working, settings just aren't persisted
  }
}

export const getSettings = () => current

export function updateSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch }
  persist()
  applyTheme(current.theme)
  listeners.forEach((l) => l())
}

export function useSettings(): Settings {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
  )
}

const media = matchMedia('(prefers-color-scheme: light)')
media.addEventListener('change', () => {
  if (current.theme === 'system') applyTheme('system')
})

export function applyTheme(pref: ThemePref) {
  const mode = pref === 'system' ? (media.matches ? 'light' : 'dark') : pref
  document.documentElement.dataset.theme = mode
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', mode === 'light' ? '#f2f4f8' : '#0a0d13')
}
