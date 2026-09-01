import { useSyncExternalStore } from 'react'

export interface Settings {
  monthlyBudget?: number
}

const KEY = 'spent-settings'

let current: Settings = load()
const listeners = new Set<() => void>()

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      monthlyBudget:
        typeof parsed.monthlyBudget === 'number' && parsed.monthlyBudget > 0
          ? parsed.monthlyBudget
          : undefined,
    }
  } catch {
    return {}
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    // storage unavailable — the app keeps working, settings just aren't persisted
  }
}

export const getSettings = () => current

export function updateSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch }
  persist()
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
