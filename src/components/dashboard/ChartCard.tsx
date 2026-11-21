import { useState } from "react"
import { ChartColumn, Table2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TONE_CLASSES } from "@/constants/tones"
import type { ChartCardProps } from "@/interfaces/dashboard"
import { cn } from "@/lib/utils"

// A titled card for one chart, with a tinted icon in the card's colour. When a table is given, a toggle switches between the chart and the same
// numbers as a table, so no value is only reachable by hovering (screen readers, exact figures).
export const ChartCard = ({ title, description, icon: Icon, tone, children, table, className }: ChartCardProps) => {
  const [isTableVisible, setIsTableVisible] = useState(false)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-base">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              TONE_CLASSES[tone].iconTile
            )}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        {table && (
          <CardAction>
            <Button
              variant="outline"
              size="sm"
              className="h-10 md:h-8"
              onClick={() => setIsTableVisible((isVisible) => !isVisible)}
              aria-pressed={isTableVisible}
            >
              {isTableVisible ? <ChartColumn /> : <Table2 />}
              {isTableVisible ? "Chart" : "Table"}
            </Button>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>{isTableVisible && table ? table : children}</CardContent>
    </Card>
  )
}
