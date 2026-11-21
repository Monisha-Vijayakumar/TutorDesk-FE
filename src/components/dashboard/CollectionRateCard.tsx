import { Gauge } from "lucide-react"
import type { CollectionRateCardProps } from "@/interfaces/dashboard"
import { getCollectionRate } from "@/utils/dashboard"
import { formatMonthLabel } from "@/utils/date"
import { formatCurrency } from "@/utils/format"
import { ChartCard } from "./ChartCard"

// One ratio against its whole — a meter (a line with one point, or a pie of two slices, says less).
// Green: money collected, like the "Collected this month" card.
export const CollectionRateCard = ({ month, collectedAmount, billedAmount }: CollectionRateCardProps) => {
  const collectionRate = getCollectionRate(collectedAmount, billedAmount)
  const monthLabel = formatMonthLabel(month)

  return (
    <ChartCard
      title={`Collection rate of ${monthLabel}`}
      description="Share of this month's fees collected so far."
      icon={Gauge}
      tone="green"
    >
      <div className="flex flex-col gap-5">
        <p className="text-4xl font-semibold">{collectionRate}%</p>
        <div
          role="meter"
          aria-label={`Fees collected for ${monthLabel}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={collectionRate}
          className="h-3 w-full overflow-hidden rounded-full bg-chart-status-paid/15"
        >
          <div className="h-full rounded-full bg-chart-status-paid" style={{ width: `${collectionRate}%` }} />
        </div>
        <dl className="flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Collected</dt>
            <dd className="font-medium tabular-nums">{formatCurrency(collectedAmount)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Billed</dt>
            <dd className="font-medium tabular-nums">{formatCurrency(billedAmount)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t pt-2.5">
            <dt className="text-muted-foreground">Still to collect</dt>
            <dd className="font-medium tabular-nums">{formatCurrency(billedAmount - collectedAmount)}</dd>
          </div>
        </dl>
      </div>
    </ChartCard>
  )
}
