import type { ChartTooltipRowProps } from "@/interfaces/dashboard"

// One line in a chart tooltip: colour key, series name, formatted value (text stays in text colours).
export const ChartTooltipRow = ({ color, label, value }: ChartTooltipRowProps) => {
  return (
    <div className="flex w-full items-center gap-2">
      <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} aria-hidden="true" />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto pl-3 font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}
