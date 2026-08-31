import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { CalendarDays, Check, Delete, Trash2 } from 'lucide-react'
import { db, catColor, type Expense } from '../db'
import { fmtNum, fullDateLabel, todayStr, toYMD } from '../lib/format'
import Sheet from './Sheet'
import Confirm from './Confirm'

const LAST_CAT_KEY = 'spent-last-cat'

const yesterdayStr = () => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toYMD(d)
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'ok'] as const

const buzz = () => navigator.vibrate?.(5)

export default function EntrySheet({
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
    }
    setAskDelete(false)
  }, [open, editing])

  const validCatId = useMemo(
    () => (categories.some((c) => c.id === categoryId) ? categoryId : null),
    [categories, categoryId],
  )
  const amount = parseInt(digits || '0', 10)
  const valid = amount > 0 && validCatId != null

  const tap = (key: (typeof KEYS)[number]) => {
    buzz()
    if (key === 'back') {
      setDigits((d) => d.slice(0, -1))
    } else if (key === 'ok') {
      void save()
    } else {
      setDigits((d) => {
        if (d.length >= 9) return d
        if (d === '' && key === '0') return d
        return d + key
      })
    }
  }

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
      : 'color-mix(in srgb, var(--ink) 5%, transparent)',
    boxShadow: selected ? 'inset 0 0 0 1.5px var(--accent)' : undefined,
    color: selected ? 'var(--ink)' : 'var(--ink-2)',
  })

  return (
    <>
      <Sheet
        open={open}
        onClose={onClose}
        title={editing ? 'Izmena troška' : 'Novi trošak'}
        headerRight={
          editing && (
            <button
              onClick={() => setAskDelete(true)}
              aria-label="Obriši trošak"
              className="press rounded-full p-2"
              style={{
                background: 'color-mix(in srgb, var(--danger) 14%, transparent)',
                color: 'var(--danger)',
              }}
            >
              <Trash2 size={18} />
            </button>
          )
        }
      >
        {/* amount */}
        <div className="flex items-end justify-center gap-1.5 pb-4 pt-1">
          <span
            className="text-[44px] font-bold leading-none tracking-tight"
            style={digits ? undefined : { color: 'var(--ink-3)' }}
          >
            {fmtNum(amount)}
          </span>
          <span className="pb-1 text-lg font-medium" style={{ color: 'var(--ink-2)' }}>
            din
          </span>
        </div>

        {/* categories */}
        <div className="grid grid-cols-4 gap-2">
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

        {/* date */}
        <div className="mt-3 flex gap-2">
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

        {/* note */}
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          placeholder="Beleška (opciono)"
          maxLength={80}
          className="mt-3 w-full rounded-2xl px-4 py-3 text-sm outline-none"
          style={{ background: 'color-mix(in srgb, var(--ink) 5%, transparent)' }}
        />

        {/* keypad */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {KEYS.map((k) => {
            if (k === 'back') {
              return (
                <button
                  key={k}
                  onClick={() => tap(k)}
                  aria-label="Obriši cifru"
                  className="press flex h-14 items-center justify-center rounded-2xl"
                  style={{ background: 'color-mix(in srgb, var(--ink) 5%, transparent)' }}
                >
                  <Delete size={22} style={{ color: 'var(--ink-2)' }} />
                </button>
              )
            }
            if (k === 'ok') {
              return (
                <button
                  key={k}
                  onClick={() => tap(k)}
                  disabled={!valid}
                  aria-label="Sačuvaj"
                  className="press flex h-14 items-center justify-center rounded-2xl"
                  style={{
                    background: valid
                      ? 'var(--accent)'
                      : 'color-mix(in srgb, var(--accent) 22%, transparent)',
                    color: valid ? 'var(--on-accent)' : 'var(--ink-3)',
                  }}
                >
                  <Check size={24} strokeWidth={2.8} />
                </button>
              )
            }
            return (
              <button
                key={k}
                onClick={() => tap(k)}
                className="press h-14 rounded-2xl text-xl font-semibold"
                style={{ background: 'color-mix(in srgb, var(--ink) 5%, transparent)' }}
              >
                {k}
              </button>
            )
          })}
        </div>
      </Sheet>

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
