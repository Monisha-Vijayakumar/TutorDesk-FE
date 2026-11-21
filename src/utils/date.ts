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

// "2025-11" → "Nov '25" (chart axes; the tooltip shows the full month).
export const formatShortMonthYearLabel = (month: string): string => {
  return `${SHORT_MONTH_NAMES[Number(month.slice(5, 7)) - 1]} '${month.slice(2, 4)}`
}

// "2026-11-05" → "5 Nov" (chart axes; the tooltip shows the full date).
export const formatDayMonthLabel = (isoDate: string): string => {
  return `${Number(isoDate.slice(8, 10))} ${SHORT_MONTH_NAMES[Number(isoDate.slice(5, 7)) - 1]}`
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

// "16:30" (24-hour, from a time input) → "04:30 PM".
export const formatTimeOfDay = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours < 12 ? "AM" : "PM"
  const displayHours = hours % 12 || 12
  return `${padTwoDigits(displayHours)}:${padTwoDigits(minutes)} ${period}`
}

// "YYYY-MM-DD" → a local Date at midnight (never shifted by the time zone).
const parseIsoDate = (isoDate: string): Date => {
  const [year, month, day] = isoDate.split("-").map(Number)
  return new Date(year, month - 1, day)
}

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

// Whole days from one date to another ("2026-11-01" → "2026-11-21" = 20).
export const getDaysBetween = (fromDate: string, toDate: string): number => {
  return Math.round((parseIsoDate(toDate).getTime() - parseIsoDate(fromDate).getTime()) / MILLISECONDS_PER_DAY)
}

// Every date from one date to another, both included, oldest first.
export const getDatesBetween = (fromDate: string, toDate: string): string[] => {
  const dates: string[] = []
  const date = parseIsoDate(fromDate)
  const lastDate = parseIsoDate(toDate)
  while (date <= lastDate) {
    dates.push(toIsoDate(date))
    date.setDate(date.getDate() + 1)
  }
  return dates
}

// Every month ("YYYY-MM") the range touches, oldest first.
export const getMonthsBetween = (fromDate: string, toDate: string): string[] => {
  const months: string[] = []
  const date = parseIsoDate(fromDate)
  date.setDate(1)
  const lastMonth = toDate.slice(0, 7)
  while (toIsoDate(date).slice(0, 7) <= lastMonth) {
    months.push(toIsoDate(date).slice(0, 7))
    date.setMonth(date.getMonth() + 1)
  }
  return months
}

// First day of the month that is monthsBack months before this one (0 = the 1st of this month).
export const getFirstDayOfMonthsAgo = (monthsBack: number): string => {
  const today = new Date()
  return toIsoDate(new Date(today.getFullYear(), today.getMonth() - monthsBack, 1))
}

// Today's date the given number of years ago, e.g. the earliest date a range may start.
export const getDateYearsAgo = (years: number): string => {
  const today = new Date()
  return toIsoDate(new Date(today.getFullYear() - years, today.getMonth(), today.getDate()))
}
