import type {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  REMINDER_CHANNELS,
  REMINDER_STATUSES,
  REMINDER_TYPES,
} from "@/constants/fees"

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES]

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS]

export type ReminderChannel = (typeof REMINDER_CHANNELS)[keyof typeof REMINDER_CHANNELS]

export type ReminderType = (typeof REMINDER_TYPES)[keyof typeof REMINDER_TYPES]

export type ReminderStatus = (typeof REMINDER_STATUSES)[keyof typeof REMINDER_STATUSES]

// A student's fee position for the current month. Read-only: the BE works it out from
// the month's fee record and its payments (REQUIREMENTS FR-11a, FR-26).
export interface StudentPaymentSummary {
  status: PaymentStatus
  paidOn: string | null // "YYYY-MM-DD" of the latest payment this month
  method: PaymentMethod | null
}

// Query string shared by lists that search by Student ID / name and filter by payment. page is 1-based.
export interface PaymentSearchParams {
  search?: string // Student ID or name, partial and case-insensitive
  paymentStatus?: PaymentStatus
  paidFrom?: string // "YYYY-MM-DD", inclusive — date the latest payment was received
  paidTo?: string // "YYYY-MM-DD", inclusive
  page: number
  limit: number
}

export interface FeeListParams extends PaymentSearchParams {
  month: string // "YYYY-MM"
}

// The student details shown next to a fee record (read-only on the Fees page).
export interface FeeStudent {
  id: string
  studentCode: string
  firstName: string
  lastName: string
  parentName: string
  parentPhone: string // parent's WhatsApp number — the destination for payment reminders
}

// One student's fee for one month. Paid, outstanding and status are calculated by the BE.
export interface FeeRecord {
  id: string
  month: string // "YYYY-MM"
  student: FeeStudent
  totalFee: number // paise
  paidAmount: number // paise, sum of this month's payments
  outstandingAmount: number // paise, totalFee - paidAmount
  status: PaymentStatus
  dueDate: string // "YYYY-MM-DD"
  lastPaymentDate: string | null
  lastPaymentMethod: PaymentMethod | null
}

export interface FeeListResponse {
  fees: FeeRecord[]
  total: number
}

// Money received now. Each one is stored as its own payment transaction.
export interface RecordPaymentPayload {
  amount: number // paise, > 0 and <= outstanding
  paidOn: string // "YYYY-MM-DD", not in the future
  method: PaymentMethod
}

// Edit on the Fees page: the month's total fee and due date, plus an optional new payment.
export interface UpdateFeePayload {
  totalFee: number // paise, not less than the amount already paid
  dueDate: string
  payment: RecordPaymentPayload | null
}

export interface UpdateFeeRequest {
  feeId: string
  payload: UpdateFeePayload
}

export interface FeeResponse {
  fee: FeeRecord
}

export interface PaymentTransaction {
  id: string
  month: string // fee month the payment counts towards
  amount: number // paise
  paidOn: string
  method: PaymentMethod
  recordedAt: string // ISO date-time
  recordedBy: string // admin name
}

export interface PaymentReminder {
  id: string
  month: string
  channel: ReminderChannel
  type: ReminderType
  contact: string // phone number or email used
  status: ReminderStatus
  initiatedAt: string // ISO date-time
}

export interface PaymentHistoryResponse {
  payments: PaymentTransaction[] // newest first
  reminders: PaymentReminder[] // newest first
}

// Records that the admin opened WhatsApp with a reminder. It does NOT mean the message was sent.
export interface CreateReminderPayload {
  channel: ReminderChannel
  type: ReminderType
  contact: string
}

export interface CreateReminderRequest {
  feeId: string
  payload: CreateReminderPayload
}

export interface ReminderResponse {
  reminder: PaymentReminder
}

// What every fee service (real API or dev mock) must provide.
export interface FeeService {
  getFees: (params: FeeListParams, signal?: AbortSignal) => Promise<FeeListResponse>
  updateFee: (feeId: string, payload: UpdateFeePayload) => Promise<FeeRecord>
  getPaymentHistory: (studentId: string, signal?: AbortSignal) => Promise<PaymentHistoryResponse>
  createFeeReminder: (feeId: string, payload: CreateReminderPayload) => Promise<PaymentReminder>
}

// DEV mock storage only (the BE has FeeRecord, Payment and ReminderLog collections, §6).
export interface MockFeeRecord {
  id: string
  studentId: string
  month: string
  totalFee: number
  dueDate: string
}

export interface MockPaymentRecord extends PaymentTransaction {
  feeId: string
  studentId: string
}

export interface MockReminderRecord extends PaymentReminder {
  feeId: string
  studentId: string
}
