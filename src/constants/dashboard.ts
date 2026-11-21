import type { PaymentStatus } from "@/api/interfaces/fee"
import type { SelectOption } from "@/interfaces/form"
import { PAYMENT_STATUSES } from "@/constants/fees"

// Batches shown in the "Students per batch" chart; the rest are summed into one "Other batches" bar.
export const MAX_CHART_BATCHES = 8
export const OTHER_BATCHES_LABEL = "Other batches"

// Best to worst — the order of the payment status bar and its list.
export const DASHBOARD_PAYMENT_STATUS_ORDER: PaymentStatus[] = [
  PAYMENT_STATUSES.PAID,
  PAYMENT_STATUSES.PARTIAL,
  PAYMENT_STATUSES.PENDING,
  PAYMENT_STATUSES.OVERDUE,
]

// GET /dashboard/fee-collection: per day up to this many days, per month above it.
export const FEE_COLLECTION_GRANULARITIES = {
  DAY: "DAY",
  MONTH: "MONTH",
} as const
export const MAX_DAILY_COLLECTION_DAYS = 62
// The longest range the fee collection chart (and the API) accepts.
export const MAX_COLLECTION_RANGE_YEARS = 2

// Fee collection period filter. "Last N months" = this month and the N − 1 before it, up to today.
export const FEE_COLLECTION_PERIODS = {
  LAST_1_MONTH: "LAST_1_MONTH",
  LAST_3_MONTHS: "LAST_3_MONTHS",
  LAST_6_MONTHS: "LAST_6_MONTHS",
  CUSTOM: "CUSTOM",
} as const

export const FEE_COLLECTION_PERIOD_MONTHS = {
  [FEE_COLLECTION_PERIODS.LAST_1_MONTH]: 1,
  [FEE_COLLECTION_PERIODS.LAST_3_MONTHS]: 3,
  [FEE_COLLECTION_PERIODS.LAST_6_MONTHS]: 6,
} as const

export const FEE_COLLECTION_PERIOD_OPTIONS: SelectOption[] = [
  { value: FEE_COLLECTION_PERIODS.LAST_1_MONTH, label: "Last 1 month" },
  { value: FEE_COLLECTION_PERIODS.LAST_3_MONTHS, label: "Last 3 months" },
  { value: FEE_COLLECTION_PERIODS.LAST_6_MONTHS, label: "Last 6 months" },
  { value: FEE_COLLECTION_PERIODS.CUSTOM, label: "Custom date range" },
]


// Coloured left edge of each row in the payment status list (status colours, next to the status badge).
export const PAYMENT_STATUS_ROW_ACCENTS: Record<PaymentStatus, string> = {
  [PAYMENT_STATUSES.PAID]: "border-l-chart-status-paid",
  [PAYMENT_STATUSES.PARTIAL]: "border-l-chart-status-partial",
  [PAYMENT_STATUSES.PENDING]: "border-l-chart-status-pending",
  [PAYMENT_STATUSES.OVERDUE]: "border-l-chart-status-overdue",
}
