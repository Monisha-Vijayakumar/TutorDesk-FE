import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { RowActionButtonProps } from "@/interfaces/table"
import { cn } from "@/lib/utils"

// Icon button for a table row action (Edit, Delete, Payment history…). Same look on every table.
export const RowActionButton = ({
  label,
  icon: Icon,
  onClick,
  isDestructive = false,
  isDisabled = false,
}: RowActionButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className={cn(isDestructive && "text-destructive hover:text-destructive")}
            onClick={onClick}
            disabled={isDisabled}
            aria-label={label}
          />
        }
      >
        <Icon />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
