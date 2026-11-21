import { useCallback, useEffect, type ReactNode } from "react"
import { AlertCircle, TrendingUp, Wallet } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { EmptyState } from "@/components/EmptyState"
import { FormField } from "@/components/FormField"
import { FormSelectField } from "@/components/FormSelectField"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  FEE_COLLECTION_GRANULARITIES,
  FEE_COLLECTION_PERIOD_OPTIONS,
  FEE_COLLECTION_PERIODS,
  MAX_COLLECTION_RANGE_YEARS,
} from "@/constants/dashboard"
import { useFeeCollectionRange } from "@/hooks/useFeeCollectionRange"
import type { FeeCollectionPeriod } from "@/interfaces/dashboard"
import { cn } from "@/lib/utils"
import {
  fetchFeeCollection,
  selectFeeCollection,
  selectFeeCollectionError,
  selectIsFeeCollectionLoading,
} from "@/store/dashboardSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { getFeeCollectionChartRows, getMoneyAxisTicks } from "@/utils/dashboard"
import { formatDisplayDate, formatMonthLabel, getCurrentMonth, getDateYearsAgo, getTodayIsoDate } from "@/utils/date"
import { formatCompactCurrency, formatCurrency } from "@/utils/format"
import { ChartCard } from "./ChartCard"
import { ChartTable } from "./ChartTable"
import { ChartTooltipRow } from "./ChartTooltipRow"

// One series (no legend: the description says what is plotted).
const CHART_CONFIG = {
  value: { label: "Collected", color: "var(--chart-1)" },
} satisfies ChartConfig

// Money received over the chosen period, as an area chart: day by day the running total ("collected so
// far") for periods up to about two months, month by month what each month brought in for longer ones.
// Default period: Last 1 month (this month).
export const FeeCollectionChart = () => {
  const dispatch = useAppDispatch()
  const feeCollection = useAppSelector(selectFeeCollection)
  const isLoading = useAppSelector(selectIsFeeCollectionLoading)
  const error = useAppSelector(selectFeeCollectionError)
  const { values, setPeriod, setCustomDate, errors, params } = useFeeCollectionRange()

  // Reload whenever the period changes; the previous request is aborted.
  useEffect(() => {
    if (!params) {
      return
    }
    const request = dispatch(fetchFeeCollection(params))
    return () => request.abort()
  }, [dispatch, params])

  const reload = useCallback((): void => {
    if (params) {
      dispatch(fetchFeeCollection(params))
    }
  }, [dispatch, params])

  const isDaily = feeCollection?.granularity === FEE_COLLECTION_GRANULARITIES.DAY
  const rows = feeCollection ? getFeeCollectionChartRows(feeCollection) : []
  const range = feeCollection ?? params
  const rangeText = range ? `${formatDisplayDate(range.from)} – ${formatDisplayDate(range.to)}` : ""
  const description = feeCollection
    ? `${rangeText} · ${isDaily ? "total collected so far, day by day" : "collected each month"}`
    : rangeText
  const yAxisTicks = getMoneyAxisTicks(Math.max(0, ...rows.map((row) => row.value)))
  // Month by month, this month isn't over yet — say so, or its lower total looks like a drop.
  const getPeriodLabel = (period: string): string => {
    if (isDaily) {
      return formatDisplayDate(period)
    }
    return period === getCurrentMonth() ? `${formatMonthLabel(period)} (so far)` : formatMonthLabel(period)
  }

  const table = feeCollection ? (
    <ChartTable
      caption="Fees collected in the chosen period"
      columns={
        isDaily
          ? [{ label: "Date" }, { label: "Collected that day", isNumeric: true }, { label: "Collected so far", isNumeric: true }]
          : [{ label: "Month" }, { label: "Collected", isNumeric: true }]
      }
      rows={rows.map((row) =>
        isDaily
          ? [getPeriodLabel(row.period), formatCurrency(row.collected), formatCurrency(row.runningTotal)]
          : [getPeriodLabel(row.period), formatCurrency(row.collected)]
      )}
    />
  ) : undefined

  const renderChart = (): ReactNode => {
    if (error) {
      return (
        <EmptyState
          icon={AlertCircle}
          title={error}
          action={
            <Button variant="outline" size="lg" onClick={reload}>
              Try again
            </Button>
          }
        />
      )
    }
    if (!feeCollection) {
      return <Skeleton className="h-80 w-full" />
    }
    if (feeCollection.collectedAmount === 0) {
      return <EmptyState icon={Wallet} title="No payments were received in this period." />
    }

    return (
      <div className="flex flex-col gap-3">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-2xl font-semibold">{formatCurrency(feeCollection.collectedAmount)}</span>
          <span className="text-sm text-muted-foreground">collected</span>
        </p>
        <ChartContainer config={CHART_CONFIG} className="aspect-auto h-72 w-full">
          <AreaChart data={rows} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
            <YAxis
              ticks={yAxisTicks}
              domain={[0, yAxisTicks[yAxisTicks.length - 1]]}
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(value: number) => formatCompactCurrency(value)}
            />
            <ChartTooltip
              cursor={{ strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => getPeriodLabel(String(payload[0]?.payload?.period ?? ""))}
                  formatter={(_, __, item) => {
                    const color = String(item.color)
                    const collected = Number(item.payload?.collected ?? 0)
                    if (!isDaily) {
                      return <ChartTooltipRow color={color} label="Collected" value={formatCurrency(collected)} />
                    }
                    return (
                      <div className="flex w-full flex-col gap-1">
                        <ChartTooltipRow color={color} label="Collected so far" value={formatCurrency(Number(item.payload?.runningTotal ?? 0))} />
                        <ChartTooltipRow color="transparent" label="That day" value={formatCurrency(collected)} />
                      </div>
                    )
                  }}
                />
              }
            />
            <Area
              dataKey="value"
              type="linear"
              stroke="var(--color-value)"
              strokeWidth={2}
              fill="var(--color-value)"
              fillOpacity={0.1}
              dot={isDaily ? false : { r: 4, fill: "var(--color-value)", stroke: "var(--card)", strokeWidth: 2 }}
              activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    )
  }

  return (
    <ChartCard
      title="Fee collection"
      description={description}
      icon={TrendingUp}
      tone="blue"
      table={table}
      className="@5xl:col-span-2"
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 @xl:grid-cols-3 @xl:items-start">
          <FormSelectField
            id="fee-collection-period"
            label="Period"
            value={values.period}
            options={FEE_COLLECTION_PERIOD_OPTIONS}
            placeholder="Last 1 month"
            onValueChange={(value) => setPeriod(value as FeeCollectionPeriod)}
          />
          {values.period === FEE_COLLECTION_PERIODS.CUSTOM && (
            <>
              <FormField
                id="fee-collection-from"
                label="From"
                type="date"
                value={values.customFrom}
                min={getDateYearsAgo(MAX_COLLECTION_RANGE_YEARS)}
                max={values.customTo || getTodayIsoDate()}
                error={errors.customFrom}
                onChange={(event) => setCustomDate("customFrom", event.target.value)}
              />
              <FormField
                id="fee-collection-to"
                label="To"
                type="date"
                value={values.customTo}
                min={values.customFrom || undefined}
                max={getTodayIsoDate()}
                error={errors.customTo}
                onChange={(event) => setCustomDate("customTo", event.target.value)}
              />
            </>
          )}
        </div>
        {/* Previous numbers stay (dimmed) while a new period loads. */}
        <div className={cn("transition-opacity", isLoading && feeCollection && "opacity-60")} aria-busy={isLoading}>
          {renderChart()}
        </div>
      </div>
    </ChartCard>
  )
}
