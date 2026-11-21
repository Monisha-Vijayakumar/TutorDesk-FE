import type {
  DashboardService,
  DashboardStats,
  FeeCollection,
  FeeCollectionParams,
  FeeCollectionPoint,
} from "@/api/interfaces/dashboard"
import type { FeeRecord } from "@/api/interfaces/fee"
import {
  DASHBOARD_PAYMENT_STATUS_ORDER,
  FEE_COLLECTION_GRANULARITIES,
  MAX_DAILY_COLLECTION_DAYS,
} from "@/constants/dashboard"
import { PAYMENT_STATUSES } from "@/constants/fees"
import { getCurrentMonth, getDatesBetween, getDaysBetween, getMonthsBetween } from "@/utils/date"
import { getMockBatchStudentCounts } from "./mockBatchData"
import { waitForMockDelay } from "./mockDelay"
import { getMockPaymentsBetween, listMockFees } from "./mockFeeData"
import { getCurrentMockStudents } from "./mockStudentData"

// DEV ONLY — works the dashboard out from the in-memory students, fee records, payments and batches,
// the way the BE does with aggregation pipelines. Picked in dashboardService.ts when IS_MOCK_API_ENABLED is true.

const sumAmounts = (fees: FeeRecord[], getAmount: (fee: FeeRecord) => number): number => {
  return fees.reduce((total, fee) => total + getAmount(fee), 0)
}

const getDashboardStats = async (): Promise<DashboardStats> => {
  await waitForMockDelay()
  const currentStudents = getCurrentMockStudents()
  const currentMonth = getCurrentMonth()
  // Every fee record of this month (one page big enough for all students).
  const limit = Math.max(currentStudents.length, 1)
  const currentFees = listMockFees({ month: currentMonth, page: 1, limit }, currentStudents).fees
  const batchStudentCounts = getMockBatchStudentCounts(currentStudents)

  return {
    month: currentMonth,
    summary: {
      totalStudents: currentStudents.length,
      totalBatches: batchStudentCounts.length,
      billedAmount: sumAmounts(currentFees, (fee) => fee.totalFee),
      collectedAmount: sumAmounts(currentFees, (fee) => fee.paidAmount),
      outstandingAmount: sumAmounts(currentFees, (fee) => fee.outstandingAmount),
      overdueCount: currentFees.filter((fee) => fee.status === PAYMENT_STATUSES.OVERDUE).length,
    },
    paymentStatusCounts: DASHBOARD_PAYMENT_STATUS_ORDER.map((status) => {
      const fees = currentFees.filter((fee) => fee.status === status)
      // Paid: what was received. The others: what is still to collect.
      const getAmount = (fee: FeeRecord): number =>
        status === PAYMENT_STATUSES.PAID ? fee.paidAmount : fee.outstandingAmount
      return { status, count: fees.length, amount: sumAmounts(fees, getAmount) }
    }),
    batchStudentCounts,
  }
}

const getFeeCollection = async (params: FeeCollectionParams): Promise<FeeCollection> => {
  await waitForMockDelay()
  const payments = getMockPaymentsBetween(params.from, params.to, getCurrentMockStudents())
  const isDaily = getDaysBetween(params.from, params.to) + 1 <= MAX_DAILY_COLLECTION_DAYS
  const periods = isDaily ? getDatesBetween(params.from, params.to) : getMonthsBetween(params.from, params.to)
  // A payment's day ("YYYY-MM-DD") or month ("YYYY-MM"), matching the period keys.
  const getPeriod = (paidOn: string): string => (isDaily ? paidOn : paidOn.slice(0, 7))

  const points: FeeCollectionPoint[] = periods.map((period) => ({
    period,
    collectedAmount: payments
      .filter((payment) => getPeriod(payment.paidOn) === period)
      .reduce((total, payment) => total + payment.amount, 0),
  }))

  return {
    from: params.from,
    to: params.to,
    granularity: isDaily ? FEE_COLLECTION_GRANULARITIES.DAY : FEE_COLLECTION_GRANULARITIES.MONTH,
    collectedAmount: points.reduce((total, point) => total + point.collectedAmount, 0),
    points,
  }
}

export const mockDashboardService: DashboardService = {
  getDashboardStats,
  getFeeCollection,
}
