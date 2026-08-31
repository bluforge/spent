import Dexie, { type EntityTable } from 'dexie'

export type ColorSlot =
  | 'blue'
  | 'orange'
  | 'aqua'
  | 'yellow'
  | 'magenta'
  | 'green'
  | 'violet'
  | 'red'
  | 'gray'

export const COLOR_SLOTS: ColorSlot[] = [
  'blue',
  'orange',
  'aqua',
  'yellow',
  'magenta',
  'green',
  'violet',
  'red',
  'gray',
]

export interface Category {
  id: number
  name: string
  icon: string
  color: ColorSlot
  budget?: number
  order: number
}

export interface Expense {
  id: number
  amount: number
  categoryId: number
  date: string // YYYY-MM-DD (local time)
  note?: string
  createdAt: number
}

export const db = new Dexie('spent') as Dexie & {
  categories: EntityTable<Category, 'id'>
  expenses: EntityTable<Expense, 'id'>
}

db.version(1).stores({
  categories: '++id, order',
  expenses: '++id, date, categoryId',
})

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Hrana', icon: '🛒', color: 'orange', order: 0 },
  { name: 'Kafa i izlasci', icon: '☕', color: 'yellow', order: 1 },
  { name: 'Prevoz', icon: '🚌', color: 'green', order: 2 },
  { name: 'Računi', icon: '💡', color: 'blue', order: 3 },
  { name: 'Stan', icon: '🏠', color: 'violet', order: 4 },
  { name: 'Zdravlje', icon: '💊', color: 'aqua', order: 5 },
  { name: 'Odeća', icon: '👕', color: 'magenta', order: 6 },
  { name: 'Ostalo', icon: '📦', color: 'gray', order: 7 },
]

db.on('populate', (tx) => {
  void tx.table('categories').bulkAdd(DEFAULT_CATEGORIES)
})

/** CSS var for a category color — follows the theme (light/dark step of the same hue). */
export const catColor = (slot: ColorSlot) => `var(--cat-${slot})`
