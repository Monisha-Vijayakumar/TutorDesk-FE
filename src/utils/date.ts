import type { SelectOption } from "@/interfaces/form"

const SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const padTwoDigits = (value: number): string => String(value).padStart(2, "0")

// A local Date as "YYYY-MM-DD" (toISOString would give the UTC date, which can be a day off in India).
export const toIsoDate = (date: Date): string => {
  return `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`
}

export const getTodayIsoDate = (): string => {
  return toIsoDate(new Date())
}

// This month as "YYYY-MM" (fee months use this format).
export const getCurrentMonth = (): string => {
  return getTodayIsoDate().slice(0, 7)
}

// "2026-11-05" → "05 Nov 2026". Works on the date parts directly so the
// browser's time zone can never shift the day. (Intl prints "Sept" in some browsers.)
export const formatDisplayDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-")
  return `${day} ${SHORT_MONTH_NAMES[Number(month) - 1]} ${year}`
}

// ISO date-time → "20 Nov 2026, 10:32 am" in the viewer's local time.
export const formatDisplayDateTime = (isoDateTime: string): string => {
  const date = new Date(isoDateTime)
  const time = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
  return `${formatDisplayDate(toIsoDate(date))}, ${time}`
}

// "2026-11" → "November 2026"
export const formatMonthLabel = (month: string): string => {
  const [year, monthNumber] = month.split("-")
  return `${MONTH_NAMES[Number(monthNumber) - 1]} ${year}`
}

// This month and the (count - 1) months before it, newest first, for a month picker.
export const getRecentMonthOptions = (count: number): SelectOption[] => {
  const today = new Date()
  return Array.from({ length: count }, (_, monthsBack) => {
    const date = new Date(today.getFullYear(), today.getMonth() - monthsBack, 1)
    const month = toIsoDate(date).slice(0, 7)
    return { value: month, label: formatMonthLabel(month) }
  })
}
