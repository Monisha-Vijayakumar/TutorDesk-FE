import type {
  PaymentMethod,
  PaymentStatus,
  ReminderChannel,
  ReminderStatus,
  ReminderType,
} from "@/api/interfaces/fee"
import type { SelectOption } from "@/interfaces/form"

// Fee status for a student's current month (REQUIREMENTS FR-26). Worked out by the BE from recorded payments.
export const PAYMENT_STATUSES = {
  PAID: "PAID",
  PENDING: "PENDING",
  OVERDUE: "OVERDUE",
  PARTIAL: "PARTIAL",
} as const

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  OVERDUE: "Overdue",
  PARTIAL: "Partially Paid",
}

export const PAYMENT_METHODS = {
  CASH: "CASH",
  UPI: "UPI",
  BANK_TRANSFER: "BANK_TRANSFER",
  CARD: "CARD",
  OTHER: "OTHER",
} as const

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Card",
  OTHER: "Other",
}

// "All" option of the payment status filter; never sent to the API.
export const ALL_PAYMENT_STATUSES = "ALL"

export const PAYMENT_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { value: ALL_PAYMENT_STATUSES, label: "All Payment Statuses" },
  ...Object.values(PAYMENT_STATUSES).map((status) => ({ value: status, label: PAYMENT_STATUS_LABELS[status] })),
]

export const PAYMENT_METHOD_OPTIONS: SelectOption[] = Object.values(PAYMENT_METHODS).map((method) => ({
  value: method,
  label: PAYMENT_METHOD_LABELS[method],
}))

// Money is stored in paise (REQUIREMENTS FR-29); forms take whole rupees.
export const PAISE_PER_RUPEE = 100

// Amounts are shown as Indian rupees, e.g. ₹2,500 or ₹1,00,000.
export const CURRENCY_CODE = "INR"
export const CURRENCY_LOCALE = "en-IN"

// Default day of the month fees are due (configurable in Settings later, FR-27).
export const DEFAULT_FEE_DUE_DAY = 10

// How many months the Fees page month picker offers (this month and the ones before it).
export const FEE_MONTH_PICKER_COUNT = 12

export const REMINDER_CHANNELS = {
  WHATSAPP: "WHATSAPP",
  EMAIL: "EMAIL",
} as const

export const REMINDER_CHANNEL_LABELS: Record<ReminderChannel, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
}

// MANUAL = admin clicked "Send payment reminder". The others are for the future automated schedule (§4.7).
export const REMINDER_TYPES = {
  MANUAL: "MANUAL",
  UPCOMING: "UPCOMING",
  DUE: "DUE",
  FIRST_OVERDUE: "FIRST_OVERDUE",
  SECOND_OVERDUE: "SECOND_OVERDUE",
} as const

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  MANUAL: "Manual",
  UPCOMING: "Upcoming",
  DUE: "Due",
  FIRST_OVERDUE: "Overdue (1st)",
  SECOND_OVERDUE: "Overdue (2nd)",
}

// A manual WhatsApp reminder is only ever INITIATED: we can't know whether the admin pressed Send.
export const REMINDER_STATUSES = {
  INITIATED: "INITIATED",
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  FAILED: "FAILED",
  UNKNOWN: "UNKNOWN",
} as const

export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  INITIATED: "Initiated",
  SENT: "Sent",
  DELIVERED: "Delivered",
  FAILED: "Failed",
  UNKNOWN: "Unknown",
}

// WhatsApp click-to-chat: https://wa.me/<number in international format, digits only>?text=<message>
export const WHATSAPP_CHAT_BASE_URL = "https://wa.me/"
// Numbers saved without a country code are Indian (validated with isMobilePhone "en-IN").
export const DEFAULT_PHONE_COUNTRY_CODE = "91"
export const LOCAL_MOBILE_NUMBER_LENGTH = 10
