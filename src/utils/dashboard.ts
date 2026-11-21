import type { BatchStudentCount, FeeCollection, FeeCollectionParams } from "@/api/interfaces/dashboard"
import {
  FEE_COLLECTION_GRANULARITIES,
  FEE_COLLECTION_PERIOD_MONTHS,
  FEE_COLLECTION_PERIODS,
  MAX_CHART_BATCHES,
  OTHER_BATCHES_LABEL,
} from "@/constants/dashboard"
import type { BatchChartRow, FeeCollectionChartRow, PresetFeeCollectionPeriod } from "@/interfaces/dashboard"
import { PAISE_PER_RUPEE } from "@/constants/fees"
import { formatDayMonthLabel, formatShortMonthYearLabel, getFirstDayOfMonthsAgo, getTodayIsoDate } from "@/utils/date"

// Share of the month's fees collected so far, as a whole percentage (0 when nothing was billed).
export const getCollectionRate = (collectedAmount: number, billedAmount: number): number => {
  return billedAmount > 0 ? Math.round((collectedAmount / billedAmount) * 100) : 0
}

// "Last N months" = from the 1st of the month N − 1 months ago up to today (Last 1 month = this month).
export const getPresetCollectionRange = (period: PresetFeeCollectionPeriod): FeeCollectionParams => {
  return { from: getFirstDayOfMonthsAgo(FEE_COLLECTION_PERIOD_MONTHS[period] - 1), to: getTodayIsoDate() }
}

export const getDefaultCollectionRange = (): FeeCollectionParams => {
  return getPresetCollectionRange(FEE_COLLECTION_PERIODS.LAST_1_MONTH)
}

// Day by day the chart shows the running total ("collected so far"), which climbs smoothly instead of
// spiking on payment days; month by month it shows what each month brought in.
export const getFeeCollectionChartRows = (feeCollection: FeeCollection): FeeCollectionChartRow[] => {
  const isDaily = feeCollection.granularity === FEE_COLLECTION_GRANULARITIES.DAY
  let runningTotal = 0

  return feeCollection.points.map((point) => {
    runningTotal += point.collectedAmount
    return {
      period: point.period,
      label: isDaily ? formatDayMonthLabel(point.period) : formatShortMonthYearLabel(point.period),
      collected: point.collectedAmount,
      runningTotal,
      value: isDaily ? runningTotal : point.collectedAmount,
    }
  })
}

// The biggest batches as bars; past MAX_CHART_BATCHES the rest add up to one "Other batches" bar,
// so the chart stays readable however many batches there are.
export const getBatchChartRows = (batchStudentCounts: BatchStudentCount[]): BatchChartRow[] => {
  const rows = batchStudentCounts.map((batch) => ({ name: batch.name, studentCount: batch.studentCount }))
  if (rows.length <= MAX_CHART_BATCHES) {
    return rows
  }

  const shownRows = rows.slice(0, MAX_CHART_BATCHES - 1)
  const otherStudentCount = rows
    .slice(MAX_CHART_BATCHES - 1)
    .reduce((total, row) => total + row.studentCount, 0)
  return [...shownRows, { name: OTHER_BATCHES_LABEL, studentCount: otherStudentCount }]
}

const AXIS_INTERVAL_COUNT = 4
const NICE_STEP_FACTORS = [1, 2, 2.5, 5, 10]

// Round ₹ ticks for a money axis (0, ₹5K, ₹10K, ₹15K, ₹20K), from 0 to just above the largest value.
// Steps are 1, 2, 2.5 or 5 × a power of ten, in whole rupees. Values and ticks are in paise.
export const getMoneyAxisTicks = (maxAmountInPaise: number): number[] => {
  const maxRupees = Math.max(maxAmountInPaise / PAISE_PER_RUPEE, 1)
  const roughStep = maxRupees / AXIS_INTERVAL_COUNT
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const stepFactor = NICE_STEP_FACTORS.find((factor) => factor * magnitude >= roughStep) ?? 10
  const stepRupees = stepFactor * magnitude
  const tickCount = Math.ceil(maxRupees / stepRupees) + 1
  return Array.from({ length: tickCount }, (_, index) => index * stepRupees * PAISE_PER_RUPEE)
}
