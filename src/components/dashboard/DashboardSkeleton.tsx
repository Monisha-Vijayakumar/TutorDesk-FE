import { Skeleton } from "@/components/ui/skeleton"

const STAT_CARD_KEYS = [0, 1, 2, 3]

// First load only; later refreshes keep the previous numbers on screen (dimmed).
export const DashboardSkeleton = () => {
  return (
    <div className="flex flex-col gap-4" role="status" aria-label="Loading dashboard">
      <div className="grid gap-4 @xl:grid-cols-2 @5xl:grid-cols-4">
        {STAT_CARD_KEYS.map((key) => (
          <Skeleton key={key} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 @5xl:grid-cols-3">
        <Skeleton className="h-96 rounded-xl @5xl:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  )
}
