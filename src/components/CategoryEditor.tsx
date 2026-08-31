import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { catColor, COLOR_SLOTS, db, type Category, type ColorSlot } from '../db'
import Sheet from './Sheet'
import Confirm from './Confirm'

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
      icon: icon.trim() || '🏷️',
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

  const inputBg = { background: 'color-mix(in srgb, var(--ink) 5%, transparent)' }

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title={category ? 'Izmena kategorije' : 'Nova kategorija'}
      >
        <div className="flex gap-2">
          <input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            aria-label="Ikonica (emoji)"
            className="h-[52px] w-[60px] shrink-0 rounded-2xl text-center text-2xl outline-none"
            style={inputBg}
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Naziv kategorije"
            maxLength={24}
            className="h-[52px] min-w-0 flex-1 rounded-2xl px-4 text-sm font-medium outline-none"
            style={inputBg}
          />
        </div>

        <div className="mt-4">
          <div className="text-xs font-medium" style={{ color: 'var(--ink-3)' }}>
            Boja
          </div>
          <div className="mt-2 flex flex-wrap gap-2.5">
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
        </div>

        <div className="mt-4">
          <div className="text-xs font-medium" style={{ color: 'var(--ink-3)' }}>
            Mesečni limit (opciono)
          </div>
          <div className="relative mt-2">
            <input
              value={budgetStr}
              onChange={(e) => setBudgetStr(e.target.value.replace(/\D/g, '').slice(0, 9))}
              inputMode="numeric"
              placeholder="npr. 15000"
              className="w-full rounded-2xl px-4 py-3 pr-12 text-sm outline-none"
              style={inputBg}
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: 'var(--ink-3)' }}
            >
              din
            </span>
          </div>
        </div>

        <button
          onClick={() => void save()}
          disabled={!name.trim()}
          className="press mt-5 w-full rounded-full py-3 text-sm font-semibold"
          style={{
            background: name.trim()
              ? 'var(--accent)'
              : 'color-mix(in srgb, var(--accent) 22%, transparent)',
            color: name.trim() ? 'var(--on-accent)' : 'var(--ink-3)',
          }}
        >
          Sačuvaj
        </button>
        {category && (
          <button
            onClick={() => setAskDelete(true)}
            className="press mt-2 w-full rounded-full py-3 text-sm font-semibold"
            style={{ color: 'var(--danger)' }}
          >
            Obriši kategoriju
          </button>
        )}
      </Sheet>

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
