const nf = new Intl.NumberFormat('sr-RS', { maximumFractionDigits: 0 })

export const fmtNum = (n: number) => nf.format(Math.round(n))
export const fmtDin = (n: number) => `${fmtNum(n)} din`

/** Compact notation for chart axes: 12.400 -> "12,4k" */
export const fmtCompact = (n: number) => {
  if (Math.abs(n) >= 1000) {
    const k = n / 1000
    const rounded = Math.round(k * 10) / 10
    const s = Number.isInteger(rounded) ? String(rounded) : String(rounded).replace('.', ',')
    return `${s}k`
  }
  return fmtNum(n)
}

export const MONTHS_NOM = [
  'Januar',
  'Februar',
  'Mart',
  'April',
  'Maj',
  'Jun',
  'Jul',
  'Avgust',
  'Septembar',
  'Oktobar',
  'Novembar',
  'Decembar',
]

/** locative case: "u avgustu" */
export const MONTHS_LOC = [
  'januaru',
  'februaru',
  'martu',
  'aprilu',
  'maju',
  'junu',
  'julu',
  'avgustu',
  'septembru',
  'oktobru',
  'novembru',
  'decembru',
]

export const MONTHS_SHORT = [
  'jan',
  'feb',
  'mar',
  'apr',
  'maj',
  'jun',
  'jul',
  'avg',
  'sep',
  'okt',
  'nov',
  'dec',
]

const pad = (n: number) => String(n).padStart(2, '0')

export interface Month {
  year: number
  month: number // 0-11
}

export const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export const todayStr = () => toYMD(new Date())

export const currentMonth = (): Month => {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() }
}

export const monthRange = ({ year, month }: Month) => {
  const days = new Date(year, month + 1, 0).getDate()
  return {
    start: `${year}-${pad(month + 1)}-01`,
    end: `${year}-${pad(month + 1)}-${pad(days)}`,
    days,
  }
}

export const addMonths = ({ year, month }: Month, delta: number): Month => {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}

export const sameMonth = (a: Month, b: Month) => a.year === b.year && a.month === b.month

export const monthLabel = (m: Month) => {
  const now = currentMonth()
  return m.year === now.year ? MONTHS_NOM[m.month] : `${MONTHS_NOM[m.month]} ${m.year}.`
}

const weekdayFmt = new Intl.DateTimeFormat('sr-Latn-RS', { weekday: 'long' })

/** "Danas" / "Juče" / "petak, 29. avg" */
export const dayLabel = (ymd: string) => {
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (ymd === toYMD(today)) return 'Danas'
  if (ymd === toYMD(yesterday)) return 'Juče'
  const [y, m, d] = ymd.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = weekdayFmt.format(date)
  return `${weekday}, ${d}. ${MONTHS_SHORT[m - 1]}`
}

/** "29. avg 2026." — selected-date label in the entry sheet */
export const fullDateLabel = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number)
  return `${d}. ${MONTHS_SHORT[m - 1]} ${y}.`
}
