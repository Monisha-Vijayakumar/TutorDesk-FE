import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import type {
  BatchStudentCount,
  DashboardStats,
  FeeCollection,
  FeeCollectionParams,
  PaymentStatusCount,
} from "@/api/interfaces/dashboard"
import type { FEE_COLLECTION_PERIODS } from "@/constants/dashboard"
import type { Tone } from "@/interfaces/common"
import type { FormErrors } from "@/interfaces/form"

// API shapes (DashboardStats, FeeCollection and their parts, DashboardService) live in @/api/interfaces/dashboard.

// Redux state of the dashboard (dashboardSlice).
export interface DashboardState {
  stats: DashboardStats | null // null until the first load succeeds
  isLoading: boolean
  error: string | null
  requestId: string | null // the latest request; older responses are ignored
  feeCollection: FeeCollection | null // for the period chosen in the fee collection chart
  isFeeCollectionLoading: boolean
  feeCollectionError: string | null
  feeCollectionRequestId: string | null
}

export type FeeCollectionPeriod = (typeof FEE_COLLECTION_PERIODS)[keyof typeof FEE_COLLECTION_PERIODS]

// Last 1 / 3 / 6 months (everything except the custom range).
export type PresetFeeCollectionPeriod = Exclude<FeeCollectionPeriod, typeof FEE_COLLECTION_PERIODS.CUSTOM>

// The fee collection period filter; the dates are only used for the custom range.
export interface FeeCollectionRangeValues {
  period: FeeCollectionPeriod
  customFrom: string // "YYYY-MM-DD"
  customTo: string
}

export interface UseFeeCollectionRangeResult {
  values: FeeCollectionRangeValues
  setPeriod: (period: FeeCollectionPeriod) => void
  setCustomDate: (fieldName: "customFrom" | "customTo", value: string) => void
  errors: FormErrors<FeeCollectionRangeValues>
  params: FeeCollectionParams | null // null while the custom range is invalid (nothing is requested)
}

export interface StatCardProps {
  label: string
  value: string
  detail?: string
  icon: LucideIcon
  tone: Tone
}

export interface ChartCardProps {
  title: string
  description: string
  icon: LucideIcon
  tone: Tone
  children: ReactNode // the chart
  table?: ReactNode // the same numbers as a table, behind a "Table" toggle
  className?: string
}

export interface ChartTableColumn {
  label: string
  isNumeric?: boolean // right-aligned
}

export interface ChartTableProps {
  caption: string // read by screen readers
  columns: ChartTableColumn[]
  rows: string[][]
}

export interface ChartTooltipRowProps {
  color: string
  label: string
  value: string
}

export interface PaymentStatusBreakdownProps {
  month: string // "YYYY-MM"
  paymentStatusCounts: PaymentStatusCount[]
}

export interface CollectionRateCardProps {
  month: string // "YYYY-MM"
  collectedAmount: number // paise
  billedAmount: number // paise
}

export interface BatchStudentsChartProps {
  batchStudentCounts: BatchStudentCount[]
}

// One bar of the students-per-batch chart (the tail of small batches is folded into one bar).
export interface BatchChartRow {
  name: string
  studentCount: number
}

// One point of the fee collection chart. Amounts in paise.
export interface FeeCollectionChartRow {
  period: string // "YYYY-MM-DD" or "YYYY-MM"
  label: string // axis label: "5 Nov" or "Nov '25"
  collected: number // received in that day / month
  runningTotal: number // received from the start of the range up to and including this period
  value: number // what's plotted: runningTotal per day, collected per month
}
