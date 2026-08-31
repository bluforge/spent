import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { catColor, COLOR_SLOTS, db, type Category, type ColorSlot } from '../db'
import FullPage from './FullPage'
import Confirm from './Confirm'

/** Curated emoji picker — no typing/keyboard-switching needed to pick a category icon. */
const EMOJIS = [
  '🛒', '🍔', '🍕', '🥡', '☕', '🍺', '🍷', '🎂',
  '🚌', '🚕', '⛽', '🚗', '🚲', '✈️', '🏖️', '🎫',
  '🏠', '💡', '💧', '🔥', '📶', '🛠️', '🧾', '📦',
  '💊', '🏥', '🦷', '🏋️', '⚽', '🎾', '💆', '💈',
  '👕', '👟', '👗', '💄', '🕶️', '💍', '🧴', '🧺',
  '🎁', '🎮', '🎬', '🎵', '📚', '🎓', '🎨', '🎰',
  '📱', '💻', '🎧', '⌚', '🖨️', '🪫', '🧸', '👶',
  '🐶', '🐱', '🪴', '❤️', '💸', '🏦', '💳', '⭐',
]

export default function CategoryEditor({
  open,
  category,
  onClose,
  onDone,
}: {
  open: boolean
  category?: Category
  onClose: () => void
  onDone: (msg: string) => void
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🏷️')
  const [color, setColor] = useState<ColorSlot>('blue')
  const [budgetStr, setBudgetStr] = useState('')
  const [askDelete, setAskDelete] = useState(false)

  const count =
    useLiveQuery(
      () =>
        category
          ? db.expenses.where('categoryId').equals(category.id).count()
          : Promise.resolve(0),
      [category?.id],
    ) ?? 0

  useEffect(() => {
    if (!open) return
    if (category) {
      setName(category.name)
      setIcon(category.icon)
      setColor(category.color)
      setBudgetStr(category.budget ? String(category.budget) : '')
    } else {
      setName('')
      setIcon('🏷️')
      setColor('blue')
      setBudgetStr('')
    }
    setAskDelete(false)
  }, [open, category])

  const save = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const budget = parseInt(budgetStr || '0', 10)
    const data = {
      name: trimmed,
      icon,
      color,
      budget: budget > 0 ? budget : undefined,
    }
    if (category) {
      await db.categories.update(category.id, data)
      onDone('Kategorija sačuvana')
    } else {
      const all = await db.categories.toArray()
      const order = all.length > 0 ? Math.max(...all.map((c) => c.order)) + 1 : 0
      await db.categories.add({ ...data, order })
      onDone('Kategorija dodata')
    }
    onClose()
  }

  const remove = async () => {
    if (!category) return
    await db.transaction('rw', db.categories, db.expenses, async () => {
      await db.expenses.where('categoryId').equals(category.id).delete()
      await db.categories.delete(category.id)
    })
    setAskDelete(false)
    onDone('Kategorija obrisana')
    onClose()
  }

  return (
    <>
      <FullPage
        open={open}
        title={category ? 'Izmena kategorije' : 'Nova kategorija'}
        onClose={onClose}
        onSave={() => void save()}
        saveDisabled={!name.trim()}
      >
        {/* name + live preview of the chosen icon/color */}
        <div className="card mt-4 flex items-center gap-3 p-4">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
            style={{ background: `color-mix(in srgb, ${catColor(color)} 18%, transparent)` }}
          >
            {icon}
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Naziv kategorije"
            maxLength={24}
            className="h-12 min-w-0 flex-1 rounded-2xl px-4 text-sm font-medium outline-none"
            style={{ background: 'color-mix(in srgb, var(--ink) 5%, transparent)' }}
          />
        </div>

        {/* icon picker */}
        <section className="card mt-3 p-4">
          <h2 className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
            Ikonica
          </h2>
          <div className="mt-3 grid grid-cols-8 gap-1.5">
            {EMOJIS.map((e) => {
              const selected = e === icon
              return (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  aria-label={`Ikonica ${e}`}
                  className="press flex h-10 items-center justify-center rounded-xl text-xl"
                  style={
                    selected
                      ? {
                          background: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                          boxShadow: 'inset 0 0 0 1.5px var(--accent)',
                        }
                      : { background: 'color-mix(in srgb, var(--ink) 4%, transparent)' }
                  }
                >
                  {e}
                </button>
              )
            })}
          </div>
        </section>

        {/* color */}
        <section className="card mt-3 p-4">
          <h2 className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
            Boja
          </h2>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {COLOR_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => setColor(slot)}
                aria-label={`Boja ${slot}`}
                className="press h-9 w-9 rounded-full"
                style={{
                  background: catColor(slot),
                  boxShadow:
                    color === slot
                      ? `0 0 0 2px var(--surface), 0 0 0 4px ${catColor(slot)}`
                      : undefined,
                }}
              />
            ))}
          </div>
        </section>

        {/* budget */}
        <section className="card mt-3 p-4">
          <h2 className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
            Mesečni limit (opciono)
          </h2>
          <div className="relative mt-3">
            <input
              value={budgetStr}
              onChange={(e) => setBudgetStr(e.target.value.replace(/\D/g, '').slice(0, 9))}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="npr. 15000"
              enterKeyHint="done"
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              className="w-full rounded-2xl px-4 py-3 pr-12 text-sm outline-none"
              style={{ background: 'color-mix(in srgb, var(--ink) 5%, transparent)' }}
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: 'var(--ink-3)' }}
            >
              din
            </span>
          </div>
        </section>

        {category && (
          <button
            onClick={() => setAskDelete(true)}
            className="press mt-5 w-full rounded-full py-3 text-sm font-semibold"
            style={{ color: 'var(--danger)' }}
          >
            Obriši kategoriju
          </button>
        )}
      </FullPage>

      <Confirm
        open={askDelete}
        title="Obrisati kategoriju?"
        message={
          count > 0
            ? `Obrisaće se i ${count} ${count === 1 ? 'unos' : 'unosa'} u ovoj kategoriji.`
            : 'Kategorija će biti uklonjena.'
        }
        confirmLabel="Obriši"
        danger
        onConfirm={() => void remove()}
        onCancel={() => setAskDelete(false)}
      />
    </>
  )
}
