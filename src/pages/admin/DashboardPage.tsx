import { useEffect, type ReactNode } from "react"
import { AlertCircle, CircleAlert, Layers, Users, Wallet } from "lucide-react"
import { BatchStudentsChart } from "@/components/dashboard/BatchStudentsChart"
import { CollectionRateCard } from "@/components/dashboard/CollectionRateCard"
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton"
import { FeeCollectionChart } from "@/components/dashboard/FeeCollectionChart"
import { PaymentStatusBreakdown } from "@/components/dashboard/PaymentStatusBreakdown"
import { StatCard } from "@/components/dashboard/StatCard"
import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { ADMIN_PAGE_TITLES } from "@/constants/navigation"
import { cn } from "@/lib/utils"
import { selectCurrentUser } from "@/store/authSlice"
import {
  fetchDashboardStats,
  selectDashboardError,
  selectDashboardStats,
  selectIsDashboardLoading,
} from "@/store/dashboardSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { formatMonthLabel } from "@/utils/date"
import { formatCurrency, formatPercent } from "@/utils/format"

// This month at a glance: headline numbers, fee collection (with its own period filter), payment status,
// students per batch and collection rate.
export const DashboardPage = () => {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(selectCurrentUser)
  const stats = useAppSelector(selectDashboardStats)
  const isLoading = useAppSelector(selectIsDashboardLoading)
  const error = useAppSelector(selectDashboardError)

  // Fresh numbers each time the dashboard opens; aborted if it's left before they arrive.
  useEffect(() => {
    const request = dispatch(fetchDashboardStats())
    return () => request.abort()
  }, [dispatch])

  const reloadStats = (): void => {
    dispatch(fetchDashboardStats())
  }

  const renderContent = (): ReactNode => {
    if (error) {
      return (
        <EmptyState
          icon={AlertCircle}
          title={error}
          action={
            <Button variant="outline" size="lg" onClick={reloadStats}>
              Try again
            </Button>
          }
        />
      )
    }

    if (!stats) {
      return <DashboardSkeleton />
    }

    const { summary } = stats

    return (
      <div className={cn("flex flex-col gap-4 transition-opacity", isLoading && "opacity-60")} aria-busy={isLoading}>
        <div className="grid gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
          <StatCard label="Total Students" value={String(summary.totalStudents)} icon={Users} tone="blue" />
          <StatCard label="Total Batches" value={String(summary.totalBatches)} icon={Layers} tone="magenta" />
          <StatCard
            label="Collected this month"
            value={formatCurrency(summary.collectedAmount)}
            detail={`${formatPercent(summary.collectedAmount, summary.billedAmount)} of ${formatCurrency(summary.billedAmount)} billed`}
            icon={Wallet}
            tone="green"
          />
          <StatCard
            label="Outstanding this month"
            value={formatCurrency(summary.outstandingAmount)}
            detail={`${summary.overdueCount} overdue`}
            icon={CircleAlert}
            tone="orange"
          />
        </div>

        <div className="grid gap-4 @5xl:grid-cols-3">
          <FeeCollectionChart />
          <PaymentStatusBreakdown month={stats.month} paymentStatusCounts={stats.paymentStatusCounts} />
          <BatchStudentsChart batchStudentCounts={stats.batchStudentCounts} />
          <CollectionRateCard
            month={stats.month}
            collectedAmount={summary.collectedAmount}
            billedAmount={summary.billedAmount}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={ADMIN_PAGE_TITLES.DASHBOARD}
        description={
          stats
            ? `Welcome, ${currentUser?.name}. Here's ${formatMonthLabel(stats.month)} so far.`
            : `Welcome, ${currentUser?.name}.`
        }
      />
      {renderContent()}
    </div>
  )
}
