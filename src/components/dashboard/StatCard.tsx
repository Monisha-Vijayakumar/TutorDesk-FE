import { Card, CardContent } from "@/components/ui/card"
import { TONE_CLASSES } from "@/constants/tones"
import type { StatCardProps } from "@/interfaces/dashboard"
import { cn } from "@/lib/utils"

// One headline number with a large tinted icon and a soft background in the card's colour.
export const StatCard = ({ label, value, detail, icon: Icon, tone }: StatCardProps) => {
  const toneClasses = TONE_CLASSES[tone]

  return (
    <Card size="sm" className={cn("bg-linear-to-br to-card to-60%", toneClasses.background)}>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", toneClasses.iconTile)}>
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold break-words">{value}</p>
          </div>
        </div>
        {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
      </CardContent>
    </Card>
  )
}
