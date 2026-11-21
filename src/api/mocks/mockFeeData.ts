import type {
  CreateReminderPayload,
  FeeListParams,
  FeeListResponse,
  FeeRecord,
  MockFeeRecord,
  MockPaymentRecord,
  MockReminderRecord,
  PaymentHistoryResponse,
  PaymentMethod,
  PaymentReminder,
  PaymentStatus,
  StudentPaymentSummary,
  UpdateFeePayload,
} from "@/api/interfaces/fee"
import type { MockStudentRecord } from "@/api/interfaces/student"
import { HTTP_STATUS } from "@/api/httpStatus"
import {
  DEFAULT_FEE_DUE_DAY,
  PAISE_PER_RUPEE,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  REMINDER_STATUSES,
} from "@/constants/fees"
import { getCurrentMonth, getTodayIsoDate } from "@/utils/date"
import { createMockApiError } from "./mockApiError"

// DEV ONLY — in-memory monthly fee records, payments and reminders while tutordesk-be isn't ready.
// Mirrors what the BE is expected to do (REQUIREMENTS §4.5): one fee record per student per month
// (created on first use: monthly fee, pro-rated in the joining month, due on the fee due day),
// every payment stored separately, and paid / outstanding / status calculated from them.
// Seeded demo students (mock-student-N) get a mix of paid, partial, pending and overdue months.

const mockFeeRecords: Record<string, MockFeeRecord> = {}
const mockPayments: MockPaymentRecord[] = []
const mockReminders: MockReminderRecord[] = []

// Functions, not top-level values: nothing may run at import time, or production builds would keep
// this mock even though IS_MOCK_API_ENABLED is false there.
const getSeedPaymentMethods = (): PaymentMethod[] => Object.values(PAYMENT_METHODS)
const SEED_STUDENT_ID_PATTERN = /^mock-student-(\d+)$/
// Shown as "Updated by" in the mock history (the BE uses the logged-in admin). Not imported from the
// demo accounts: importing them here would pull them into production builds.
const MOCK_RECORDED_BY = "Admin (demo)"

const padTwoDigits = (value: number): string => String(value).padStart(2, "0")

const getDaysInMonth = (month: string): number => {
  const [year, monthNumber] = month.split("-").map(Number)
  return new Date(year, monthNumber, 0).getDate()
}

const getLastDayOfMonth = (month: string): string => `${month}-${padTwoDigits(getDaysInMonth(month))}`

// Whole months between a fee month and this month (0 = this month, 1 = last month, -1 = next month).
const getMonthsAgo = (month: string): number => {
  const [year, monthNumber] = month.split("-").map(Number)
  const [currentYear, currentMonthNumber] = getCurrentMonth().split("-").map(Number)
  return (currentYear - year) * 12 + (currentMonthNumber - monthNumber)
}

// Whole rupees, kept in paise.
const roundToRupee = (amountInPaise: number): number => Math.round(amountInPaise / PAISE_PER_RUPEE) * PAISE_PER_RUPEE

const addMockPayment = (
  record: MockFeeRecord,
  amount: number,
  paidOn: string,
  method: PaymentMethod,
  recordedAt = `${paidOn}T10:30:00.000Z`
): void => {
  mockPayments.push({
    id: crypto.randomUUID(),
    feeId: record.id,
    studentId: record.studentId,
    month: record.month,
    amount,
    paidOn,
    method,
    recordedAt,
    recordedBy: MOCK_RECORDED_BY,
  })
}

// Demo history for the seeded students: this month has all four statuses, past months are mostly paid.
const seedFeeMonth = (record: MockFeeRecord, seedIndex: number): void => {
  const monthsAgo = getMonthsAgo(record.month)
  const seedMethods = getSeedPaymentMethods()
  const method = seedMethods[seedIndex % seedMethods.length]
  const halfFee = roundToRupee(record.totalFee / 2)

  if (monthsAgo < 0) {
    return
  }

  if (monthsAgo === 0) {
    const paidDay = Math.min((seedIndex % 28) + 1, new Date().getDate())
    const paidOn = `${record.month}-${padTwoDigits(paidDay)}`
    const pattern = seedIndex % 4
    if (pattern === 0) {
      addMockPayment(record, record.totalFee, paidOn, method) // Paid
    } else if (pattern === 1) {
      record.dueDate = getLastDayOfMonth(record.month) // Pending (due later this month)
    } else if (pattern === 3) {
      record.dueDate = getLastDayOfMonth(record.month) // Partially Paid
      addMockPayment(record, halfFee, paidOn, method)
    }
    // pattern 2: nothing paid and due date passed → Overdue
    return
  }

  // Past months: mostly paid, on different days and in different ways each month, with some months
  // paid in two parts, paid late, partly paid or never paid (those are overdue now).
  const variant = (seedIndex * 7 + monthsAgo * 3) % 10
  // In the joining month the fee is due on the join date (when after the usual due day): nothing is paid before it.
  const earliestDay = Number(record.dueDate.slice(8, 10)) > DEFAULT_FEE_DUE_DAY ? Number(record.dueDate.slice(8, 10)) : 1
  const lastDay = getDaysInMonth(record.month)
  const paidDay = Math.min(Math.max(((seedIndex + monthsAgo * 2) % 9) + 1, earliestDay), lastDay)
  const lateDay = Math.min(Math.max(((seedIndex + monthsAgo) % 14) + 15, earliestDay), lastDay)
  if (variant === 0) {
    return // never paid
  }
  if (variant === 1) {
    addMockPayment(record, halfFee, `${record.month}-${padTwoDigits(paidDay)}`, method) // partly paid
  } else if (variant === 2) {
    addMockPayment(record, halfFee, `${record.month}-${padTwoDigits(paidDay)}`, method) // two parts
    addMockPayment(record, record.totalFee - halfFee, `${record.month}-${padTwoDigits(lateDay)}`, method)
  } else if (variant === 3) {
    addMockPayment(record, record.totalFee, `${record.month}-${padTwoDigits(lateDay)}`, method) // paid late
  } else {
    addMockPayment(record, record.totalFee, `${record.month}-${padTwoDigits(paidDay)}`, method)
  }
}

const createMockFeeRecord = (student: MockStudentRecord, month: string): MockFeeRecord => {
  const isJoiningMonth = student.joinDate.startsWith(month)
  const daysInMonth = getDaysInMonth(month)
  const joinDay = Number(student.joinDate.slice(8, 10))
  // Pro-rated first month (FR-28): only the days from the join date.
  const totalFee = isJoiningMonth
    ? roundToRupee((student.monthlyFee * (daysInMonth - joinDay + 1)) / daysInMonth)
    : student.monthlyFee
  // Joining after the due day: the first month is due on the join date instead.
  const defaultDueDate = `${month}-${padTwoDigits(DEFAULT_FEE_DUE_DAY)}`
  const dueDate = isJoiningMonth && student.joinDate > defaultDueDate ? student.joinDate : defaultDueDate

  const record: MockFeeRecord = { id: `fee-${student.id}-${month}`, studentId: student.id, month, totalFee, dueDate }
  const seedMatch = SEED_STUDENT_ID_PATTERN.exec(student.id)
  if (seedMatch) {
    seedFeeMonth(record, Number(seedMatch[1]) - 1)
  }
  return record
}

const getMockFeeRecord = (student: MockStudentRecord, month: string): MockFeeRecord => {
  const key = `${student.id}:${month}`
  mockFeeRecords[key] ??= createMockFeeRecord(student, month)
  return mockFeeRecords[key]
}

// FR-26: Paid when nothing is outstanding; Overdue once the due date has passed; Partially Paid
// when something was paid; otherwise Pending.
const calculatePaymentStatus = (outstandingAmount: number, paidAmount: number, dueDate: string): PaymentStatus => {
  if (outstandingAmount <= 0) {
    return PAYMENT_STATUSES.PAID
  }
  if (getTodayIsoDate() > dueDate) {
    return PAYMENT_STATUSES.OVERDUE
  }
  return paidAmount > 0 ? PAYMENT_STATUSES.PARTIAL : PAYMENT_STATUSES.PENDING
}

const getPaymentsNewestFirst = (payments: MockPaymentRecord[]): MockPaymentRecord[] => {
  return [...payments].sort(
    (first, second) => second.paidOn.localeCompare(first.paidOn) || second.recordedAt.localeCompare(first.recordedAt)
  )
}

const toFeeRecord = (student: MockStudentRecord, record: MockFeeRecord): FeeRecord => {
  const payments = getPaymentsNewestFirst(mockPayments.filter((payment) => payment.feeId === record.id))
  const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const outstandingAmount = record.totalFee - paidAmount

  return {
    id: record.id,
    month: record.month,
    student: {
      id: student.id,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
    },
    totalFee: record.totalFee,
    paidAmount,
    outstandingAmount,
    status: calculatePaymentStatus(outstandingAmount, paidAmount, record.dueDate),
    dueDate: record.dueDate,
    lastPaymentDate: payments[0]?.paidOn ?? null,
    lastPaymentMethod: payments[0]?.method ?? null,
  }
}

const matchesSearch = (fee: FeeRecord, search: string): boolean => {
  const searchText = search.toLowerCase()
  const fullName = `${fee.student.firstName} ${fee.student.lastName}`.toLowerCase()
  return fee.student.studentCode.toLowerCase().includes(searchText) || fullName.includes(searchText)
}

// "YYYY-MM-DD" strings sort the same way as the dates they represent.
const matchesDateRange = (paidOn: string | null, paidFrom?: string, paidTo?: string): boolean => {
  if (!paidFrom && !paidTo) {
    return true
  }
  if (!paidOn) {
    return false
  }
  return (!paidFrom || paidOn >= paidFrom) && (!paidTo || paidOn <= paidTo)
}

// The API shape of a stored reminder (without the mock-only feeId / studentId).
const toPaymentReminder = ({ id, month, channel, type, contact, status, initiatedAt }: MockReminderRecord): PaymentReminder => {
  return { id, month, channel, type, contact, status, initiatedAt }
}

// Finds a fee record and its (current, not deleted) student; otherwise the API answers 404.
const findFeeAndStudent = (
  feeId: string,
  currentStudents: MockStudentRecord[]
): { record: MockFeeRecord; student: MockStudentRecord } => {
  const record = Object.values(mockFeeRecords).find((feeRecord) => feeRecord.id === feeId)
  const student = currentStudents.find((currentStudent) => currentStudent.id === record?.studentId)
  if (!record || !student) {
    throw createMockApiError(HTTP_STATUS.NOT_FOUND, "Fee record not found.")
  }
  return { record, student }
}

// Dashboard: payments received between two dates (inclusive) by current students. The fee records
// (and so the demo payments) of every month in the range are created first, as for GET /fees.
export const getMockPaymentsBetween = (
  fromDate: string,
  toDate: string,
  currentStudents: MockStudentRecord[]
): MockPaymentRecord[] => {
  let month = fromDate.slice(0, 7)
  const lastMonth = toDate.slice(0, 7)
  while (month <= lastMonth) {
    const lastDayOfMonth = getLastDayOfMonth(month)
    currentStudents
      .filter((student) => student.joinDate <= lastDayOfMonth)
      .forEach((student) => getMockFeeRecord(student, month))
    const [year, monthNumber] = month.split("-").map(Number)
    month = monthNumber === 12 ? `${year + 1}-01` : `${year}-${padTwoDigits(monthNumber + 1)}`
  }

  const currentStudentIds = new Set(currentStudents.map((student) => student.id))
  return mockPayments.filter(
    (payment) => currentStudentIds.has(payment.studentId) && payment.paidOn >= fromDate && payment.paidOn <= toDate
  )
}

// Used for the Students list: this month's status, latest payment date and method.
export const getMockCurrentPaymentSummary = (student: MockStudentRecord): StudentPaymentSummary => {
  const fee = toFeeRecord(student, getMockFeeRecord(student, getCurrentMonth()))
  return { status: fee.status, paidOn: fee.lastPaymentDate, method: fee.lastPaymentMethod }
}

export const listMockFees = (params: FeeListParams, currentStudents: MockStudentRecord[]): FeeListResponse => {
  const lastDayOfMonth = getLastDayOfMonth(params.month)
  const matchingFees = currentStudents
    // Only students who had joined by the end of that month have a fee for it.
    .filter((student) => student.joinDate <= lastDayOfMonth)
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))
    .map((student) => toFeeRecord(student, getMockFeeRecord(student, params.month)))
    .filter((fee) => !params.search || matchesSearch(fee, params.search))
    .filter((fee) => !params.paymentStatus || fee.status === params.paymentStatus)
    .filter((fee) => matchesDateRange(fee.lastPaymentDate, params.paidFrom, params.paidTo))

  const firstIndex = (params.page - 1) * params.limit
  return { fees: matchingFees.slice(firstIndex, firstIndex + params.limit), total: matchingFees.length }
}

export const updateMockFee = (
  feeId: string,
  payload: UpdateFeePayload,
  currentStudents: MockStudentRecord[]
): FeeRecord => {
  const { record, student } = findFeeAndStudent(feeId, currentStudents)
  const { paidAmount } = toFeeRecord(student, record)

  if (payload.totalFee < paidAmount) {
    throw createMockApiError(HTTP_STATUS.BAD_REQUEST, "Total fee can't be less than the amount already paid.")
  }
  if (payload.payment && payload.payment.amount > payload.totalFee - paidAmount) {
    throw createMockApiError(HTTP_STATUS.BAD_REQUEST, "Payment is more than the outstanding amount.")
  }

  record.totalFee = payload.totalFee
  record.dueDate = payload.dueDate
  if (payload.payment) {
    const { amount, paidOn, method } = payload.payment
    addMockPayment(record, amount, paidOn, method, new Date().toISOString())
  }
  return toFeeRecord(student, record)
}

export const getMockPaymentHistory = (
  studentId: string,
  currentStudents: MockStudentRecord[]
): PaymentHistoryResponse => {
  if (!currentStudents.some((student) => student.id === studentId)) {
    throw createMockApiError(HTTP_STATUS.NOT_FOUND, "Student not found.")
  }

  const payments = getPaymentsNewestFirst(mockPayments.filter((payment) => payment.studentId === studentId))
  const reminders = mockReminders
    .filter((reminder) => reminder.studentId === studentId)
    .sort((first, second) => second.initiatedAt.localeCompare(first.initiatedAt))

  return {
    payments: payments.map(({ id, month, amount, paidOn, method, recordedAt, recordedBy }) => ({
      id,
      month,
      amount,
      paidOn,
      method,
      recordedAt,
      recordedBy,
    })),
    reminders: reminders.map(toPaymentReminder),
  }
}

// Records that the admin opened WhatsApp with a reminder. Always INITIATED — the mock (like the BE)
// can't know whether the message was actually sent.
export const createMockReminder = (
  feeId: string,
  payload: CreateReminderPayload,
  currentStudents: MockStudentRecord[]
): PaymentReminder => {
  const { record, student } = findFeeAndStudent(feeId, currentStudents)
  if (toFeeRecord(student, record).outstandingAmount <= 0) {
    throw createMockApiError(HTTP_STATUS.CONFLICT, "Nothing is outstanding for this month.")
  }

  const reminder: MockReminderRecord = {
    id: crypto.randomUUID(),
    feeId,
    studentId: student.id,
    month: record.month,
    channel: payload.channel,
    type: payload.type,
    contact: payload.contact,
    status: REMINDER_STATUSES.INITIATED,
    initiatedAt: new Date().toISOString(),
  }
  mockReminders.push(reminder)

  return toPaymentReminder(reminder)
}
