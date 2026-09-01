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
  tag?: string
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

// v2: stock emoji icons became monochrome glyph keys (custom emojis stay as-is)
export const EMOJI_TO_GLYPH: Record<string, string> = {
  '🛒': 'shopping-cart',
  '☕': 'coffee',
  '🚌': 'bus',
  '💡': 'lightbulb',
  '🏠': 'house',
  '💊': 'pill',
  '👕': 'shirt',
  '📦': 'package',
  '🏷️': 'tag',
}

db.version(2)
  .stores({
    categories: '++id, order',
    expenses: '++id, date, categoryId',
  })
  .upgrade(async (tx) => {
    await tx
      .table('categories')
      .toCollection()
      .modify((c: Category) => {
        const glyph = EMOJI_TO_GLYPH[c.icon]
        if (glyph) c.icon = glyph
      })
  })

// v3: emojis won after all — stock glyph keys go back to their emojis
// (deliberately picked non-stock glyphs still render via the fallback)
const GLYPH_TO_EMOJI: Record<string, string> = Object.fromEntries(
  Object.entries(EMOJI_TO_GLYPH).map(([emoji, glyph]) => [glyph, emoji]),
)

db.version(3)
  .stores({
    categories: '++id, order',
    expenses: '++id, date, categoryId',
  })
  .upgrade(async (tx) => {
    await tx
      .table('categories')
      .toCollection()
      .modify((c: Category) => {
        const emoji = GLYPH_TO_EMOJI[c.icon]
        if (emoji) c.icon = emoji
      })
  })

// v4: optional free-form tag on expenses (indexed for filtering)
db.version(4).stores({
  categories: '++id, order',
  expenses: '++id, date, categoryId, tag',
})

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Namirnice', icon: '🛒', color: 'orange', order: 0 },
  { name: 'Dostava', icon: '🛵', color: 'red', order: 1 },
  { name: 'Kafa i restorani', icon: '☕', color: 'yellow', order: 2 },
  { name: 'Izlasci', icon: '🍻', color: 'magenta', order: 3 },
  { name: 'Auto', icon: '🚗', color: 'blue', order: 4 },
  { name: 'Prevoz', icon: '🚌', color: 'green', order: 5 },
  { name: 'Stan', icon: '🏠', color: 'violet', order: 6 },
  { name: 'Računi', icon: '💡', color: 'blue', order: 7 },
  { name: 'Pretplate', icon: '📺', color: 'violet', order: 8 },
  { name: 'Sport', icon: '🏋️', color: 'green', order: 9 },
  { name: 'Zdravlje', icon: '💊', color: 'aqua', order: 10 },
  { name: 'Odeća', icon: '👕', color: 'magenta', order: 11 },
  { name: 'Ostalo', icon: '📦', color: 'gray', order: 12 },
]

// v5: richer default set — Hrana postaje Namirnice, Kafa i izlasci postaje
// Kafa i restorani (istorija ostaje uz njih), dodaju se Dostava, Izlasci,
// Auto, Pretplate i Sport. Korisničke kategorije zadržavaju boju/ikonicu
// i idu iza standardnog redosleda.
db.version(5)
  .stores({
    categories: '++id, order',
    expenses: '++id, date, categoryId, tag',
  })
  .upgrade(async (tx) => {
    const table = tx.table('categories')
    const all = (await table.toArray()) as Category[]
    const lower = (s: string) => s.trim().toLowerCase()
    const byName = new Map(all.map((c) => [lower(c.name), c]))

    const renames: Array<[string, string]> = [
      ['hrana', 'Namirnice'],
      ['kafa i izlasci', 'Kafa i restorani'],
    ]
    for (const [from, to] of renames) {
      const c = byName.get(from)
      if (c && !byName.has(lower(to))) {
        await table.update(c.id, { name: to })
        byName.delete(from)
        byName.set(lower(to), { ...c, name: to })
      }
    }

    for (const canon of DEFAULT_CATEGORIES) {
      const existing = byName.get(lower(canon.name))
      if (existing) {
        await table.update(existing.id, { order: canon.order })
      } else {
        await table.add({ ...canon })
      }
    }

    const canonNames = new Set(DEFAULT_CATEGORIES.map((c) => lower(c.name)))
    const renamedFrom = new Set(renames.map(([from]) => from))
    const custom = all
      .filter((c) => !canonNames.has(lower(c.name)) && !renamedFrom.has(lower(c.name)))
      .sort((a, b) => a.order - b.order)
    let next = DEFAULT_CATEGORIES.length
    for (const c of custom) {
      await table.update(c.id, { order: next++ })
    }
  })

db.on('populate', (tx) => {
  void tx.table('categories').bulkAdd(DEFAULT_CATEGORIES)
})

/** CSS var for a category color — follows the theme (light/dark step of the same hue). */
export const catColor = (slot: ColorSlot) => `var(--cat-${slot})`
