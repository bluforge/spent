import { useEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarDays, Trash2 } from 'lucide-react'
import { db, catColor, type Expense } from '../db'
import { fmtNum, fullDateLabel, todayStr, toYMD } from '../lib/format'
import FullPage from './FullPage'
import Confirm from './Confirm'

const LAST_CAT_KEY = 'spent-last-cat'

const yesterdayStr = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toYMD(d)
}

export default function EntryPage({
  open,
  editing,
  onClose,
  onDone,
}: {
  open: boolean
  editing?: Expense
  onClose: () => void
  onDone: (msg: string) => void
}) {
  const categories = useLiveQuery(() => db.categories.orderBy('order').toArray(), []) ?? []
  const [digits, setDigits] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [date, setDate] = useState(todayStr())
  const [note, setNote] = useState('')
  const [askDelete, setAskDelete] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setDigits(String(editing.amount))
      setCategoryId(editing.categoryId)
      setDate(editing.date)
      setNote(editing.note ?? '')
    } else {
      setDigits('')
      setNote('')
      setDate(todayStr())
      const last = Number(localStorage.getItem(LAST_CAT_KEY))
      setCategoryId(Number.isFinite(last) && last > 0 ? last : null)
      // focus after the slide-in so the native numeric keyboard comes up right away
      setTimeout(() => amountRef.current?.focus(), 380)
    }
    setAskDelete(false)
  }, [open, editing])

  const validCatId = useMemo(
    () => (categories.some((c) => c.id === categoryId) ? categoryId : null),
    [categories, categoryId],
  )
  const amount = parseInt(digits || '0', 10)
  const valid = amount > 0 && validCatId != null

  const save = async () => {
    if (!valid) return
    const data = {
      amount,
      categoryId: validCatId,
      date,
      note: note.trim() || undefined,
    }
    if (editing) {
      await db.expenses.update(editing.id, data)
      onDone('Izmena sačuvana')
    } else {
      await db.expenses.add({ ...data, createdAt: Date.now() })
      localStorage.setItem(LAST_CAT_KEY, String(validCatId))
      onDone('Sačuvano')
    }
    onClose()
  }

  const remove = async () => {
    if (!editing) return
    await db.expenses.delete(editing.id)
    setAskDelete(false)
    onDone('Obrisano')
    onClose()
  }

  const today = todayStr()
  const yesterday = yesterdayStr()
  const customDate = date !== today && date !== yesterday

  const dateChip = (selected: boolean) => ({
    background: selected
      ? 'color-mix(in srgb, var(--accent) 18%, transparent)'
      : 'color-mix(in srgb, var(--ink) 6%, transparent)',
    boxShadow: selected ? 'inset 0 0 0 1.5px var(--accent)' : undefined,
    color: selected ? 'var(--ink)' : 'var(--ink-2)',
  })

  return (
    <>
      <FullPage
        open={open}
        title={editing ? 'Izmena troška' : 'Novi trošak'}
        onClose={onClose}
        onSave={() => void save()}
        saveDisabled={!valid}
        headerRight={
          editing && (
            <button
              onClick={() => setAskDelete(true)}
              aria-label="Obriši trošak"
              className="press flex h-11 w-11 items-center justify-center rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--danger) 15%, transparent)',
                color: 'var(--danger)',
              }}
            >
              <Trash2 size={20} />
            </button>
          )
        }
      >
        {/* amount — native numeric keyboard */}
        <button
          type="button"
          className="card mt-4 flex w-full items-center justify-between px-5 py-4 text-left"
          onClick={() => amountRef.current?.focus()}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
            Iznos
          </span>
          <span className="flex items-baseline gap-1.5">
            <input
              ref={amountRef}
              value={digits}
              onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 9))}
              onClick={(e) => e.stopPropagation()}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              enterKeyHint="done"
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              className="w-36 bg-transparent text-right text-[34px] font-bold leading-none outline-none"
              aria-label="Iznos u dinarima"
            />
            <span className="text-base font-medium" style={{ color: 'var(--ink-2)' }}>
              din
            </span>
          </span>
        </button>

        {/* category */}
        <section className="card mt-3 p-4">
          <h2 className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
            Kategorija
          </h2>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {categories.map((c) => {
              const selected = c.id === validCatId
              return (
                <button
                  key={c.id}
                  onClick={() => setCategoryId(c.id)}
                  className="press flex flex-col items-center gap-1 rounded-2xl px-1 py-2.5"
                  style={
                    selected
                      ? {
                          background: `color-mix(in srgb, ${catColor(c.color)} 18%, transparent)`,
                          boxShadow: `inset 0 0 0 1.5px ${catColor(c.color)}`,
                        }
                      : { background: 'color-mix(in srgb, var(--ink) 5%, transparent)' }
                  }
                >
                  <span className="text-[22px] leading-none">{c.icon}</span>
                  <span
                    className="w-full truncate text-center text-[10px] font-medium"
                    style={{ color: selected ? 'var(--ink)' : 'var(--ink-2)' }}
                  >
                    {c.name}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* date */}
        <section className="card mt-3 p-4">
          <h2 className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
            Datum
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="press rounded-full px-4 py-2 text-sm font-medium"
              style={dateChip(date === today)}
              onClick={() => setDate(today)}
            >
              Danas
            </button>
            <button
              className="press rounded-full px-4 py-2 text-sm font-medium"
              style={dateChip(date === yesterday)}
              onClick={() => setDate(yesterday)}
            >
              Juče
            </button>
            <label
              className="press relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium"
              style={dateChip(customDate)}
            >
              <CalendarDays size={15} />
              {customDate ? fullDateLabel(date) : 'Datum'}
              <input
                type="date"
                value={date}
                max={today}
                onChange={(e) => e.target.value && setDate(e.target.value)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Izaberi datum"
              />
            </label>
          </div>
        </section>

        {/* note */}
        <section className="card mt-3 p-4">
          <h2 className="text-sm font-medium" style={{ color: 'var(--ink-2)' }}>
            Beleška
          </h2>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            placeholder="npr. Maxi, kafa, gorivo... (opciono)"
            maxLength={80}
            enterKeyHint="done"
            className="mt-3 w-full rounded-2xl px-4 py-3 text-sm outline-none"
            style={{ background: 'color-mix(in srgb, var(--ink) 5%, transparent)' }}
          />
        </section>

        <button
          onClick={() => void save()}
          disabled={!valid}
          className="press mt-5 w-full rounded-full py-3.5 text-[15px] font-semibold"
          style={{
            background: valid
              ? 'var(--accent)'
              : 'color-mix(in srgb, var(--accent) 22%, transparent)',
            color: valid ? 'var(--on-accent)' : 'var(--ink-3)',
          }}
        >
          {editing ? 'Sačuvaj izmenu' : `Sačuvaj ${amount > 0 ? fmtNum(amount) + ' din' : ''}`}
        </button>
      </FullPage>

      <Confirm
        open={askDelete}
        title="Obrisati trošak?"
        message={editing ? `${fmtNum(editing.amount)} din — ovo se ne može poništiti.` : undefined}
        confirmLabel="Obriši"
        danger
        onConfirm={() => void remove()}
        onCancel={() => setAskDelete(false)}
      />
    </>
  )
}
