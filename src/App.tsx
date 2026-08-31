import { useEffect, useRef, useState } from 'react'
import type { Expense } from './db'
import { currentMonth, type Month } from './lib/format'
import TabBar, { type Tab } from './components/TabBar'
import Toast from './components/Toast'
import EntryPage from './components/EntryPage'
import Home from './screens/Home'
import History from './screens/History'
import Stats from './screens/Stats'
import More from './screens/More'

export default function App() {
  const [tab, setTab] = useState<Tab>('home')
  const [month, setMonth] = useState<Month>(currentMonth())
  const [entryOpen, setEntryOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | undefined>()
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    // request persistent storage so the browser doesn't evict IndexedDB
    void navigator.storage?.persist?.()
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 2400)
  }

  const openNew = () => {
    setEditing(undefined)
    setEntryOpen(true)
  }

  const openEdit = (e: Expense) => {
    setEditing(e)
    setEntryOpen(true)
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-5 pb-[calc(env(safe-area-inset-bottom)+128px)] pt-[calc(env(safe-area-inset-top)+20px)]">
      {tab === 'home' && (
        <Home month={month} onMonth={setMonth} onEdit={openEdit} onSeeAll={() => setTab('history')} />
      )}
      {tab === 'history' && <History month={month} onMonth={setMonth} onEdit={openEdit} />}
      {tab === 'stats' && <Stats />}
      {tab === 'more' && <More showToast={showToast} />}

      <TabBar tab={tab} onTab={setTab} onAdd={openNew} />
      <EntryPage
        open={entryOpen}
        editing={editing}
        onClose={() => setEntryOpen(false)}
        onDone={showToast}
      />
      <Toast message={toast} />
    </div>
  )
}
