import { AlertCircle } from "lucide-react"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SKELETON_ROW_COUNT } from "@/constants/table"
import type { BatchDetailsFallbackProps } from "@/interfaces/batches"

const SKELETON_ITEMS = Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => index)

// What the View and Edit sheets show until the batch details are loaded: skeleton, or the error with Try again.
export const BatchDetailsFallback = ({ error, onRetry }: BatchDetailsFallbackProps) => {
  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title={error}
        action={
          <Button variant="outline" size="lg" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading">
      {SKELETON_ITEMS.map((item) => (
        <Skeleton key={item} className="h-10 w-full" />
      ))}
    </div>
  )
}
