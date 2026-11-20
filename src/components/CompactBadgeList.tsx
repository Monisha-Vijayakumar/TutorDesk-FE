import { Badge } from "@/components/ui/badge"
import type { CompactBadgeListProps } from "@/interfaces/common"

// Shows the first few items as badges and the rest as "+N more" (full list in its tooltip).
export const CompactBadgeList = ({ items, maxVisibleItems }: CompactBadgeListProps) => {
  const visibleItems = items.slice(0, maxVisibleItems)
  const hiddenItems = items.slice(maxVisibleItems)

  return (
    <div className="flex flex-wrap gap-1">
      {visibleItems.map((item) => (
        <Badge key={item} variant="secondary" className="whitespace-nowrap">
          {item}
        </Badge>
      ))}
      {hiddenItems.length > 0 && (
        <Badge variant="outline" className="whitespace-nowrap" title={hiddenItems.join(", ")}>
          +{hiddenItems.length} more
        </Badge>
      )}
    </div>
  )
}
