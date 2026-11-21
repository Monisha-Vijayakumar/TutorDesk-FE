import type { FEE_COLLECTION_GRANULARITIES } from "@/constants/dashboard"
import type { PaymentStatus } from "./fee"

// Headline numbers for the current month ("this month" in the center's timezone).
export interface DashboardSummary {
  totalStudents: number // current students
  totalBatches: number
  billedAmount: number // paise: total fee of this month's fee records
  collectedAmount: number // paise: paid towards this month
  outstandingAmount: number // paise: billed − collected
  overdueCount: number // this month's fee records that are Overdue
}

// This month's fee records with one status. amount: received for PAID, still to collect for the others.
export interface PaymentStatusCount {
  status: PaymentStatus
  count: number
  amount: number // paise
}

export interface BatchStudentCount {
  batchId: string
  name: string
  studentCount: number // current students only
}

// Response of GET /dashboard/stats.
export interface DashboardStats {
  month: string // the current month, "YYYY-MM"
  summary: DashboardSummary
  paymentStatusCounts: PaymentStatusCount[] // this month, every status (count 0 included), Paid → Overdue
  batchStudentCounts: BatchStudentCount[] // every batch, most students first
}

export type FeeCollectionGranularity = (typeof FEE_COLLECTION_GRANULARITIES)[keyof typeof FEE_COLLECTION_GRANULARITIES]

// Query string for GET /dashboard/fee-collection. Both dates inclusive, "YYYY-MM-DD".
export interface FeeCollectionParams {
  from: string
  to: string
}

// Payments received in one day or one month of the range.
export interface FeeCollectionPoint {
  period: string // "YYYY-MM-DD" for DAY, "YYYY-MM" for MONTH
  collectedAmount: number // paise
}

// Response of GET /dashboard/fee-collection: money received (by payment date) in the range,
// per day for ranges up to 62 days, per month for longer ones. Every period is listed, 0 included.
export interface FeeCollection {
  from: string
  to: string
  granularity: FeeCollectionGranularity
  collectedAmount: number // paise, the whole range
  points: FeeCollectionPoint[] // oldest first
}

// What every dashboard service (real API or dev mock) must provide.
export interface DashboardService {
  getDashboardStats: (signal?: AbortSignal) => Promise<DashboardStats>
  getFeeCollection: (params: FeeCollectionParams, signal?: AbortSignal) => Promise<FeeCollection>
}
