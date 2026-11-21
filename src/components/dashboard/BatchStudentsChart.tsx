import type { ReactElement } from "react"
import { Layers } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis, type YAxisTickContentProps } from "recharts"
import { EmptyState } from "@/components/EmptyState"
import { Link } from "react-router"
import { buttonVariants } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { BatchStudentsChartProps } from "@/interfaces/dashboard"
import { PATHS } from "@/routes/paths"
import { getBatchChartRows } from "@/utils/dashboard"
import { ChartCard } from "./ChartCard"
import { ChartTable } from "./ChartTable"
import { ChartTooltipRow } from "./ChartTooltipRow"

// One series, one colour for every bar (length shows the size; no legend: the title names it).
// Magenta, like everything about batches on the dashboard; values are printed at the bar ends.
const CHART_CONFIG = {
  studentCount: { label: "Students", color: "var(--chart-5)" },
} satisfies ChartConfig

const ROW_HEIGHT_PX = 40
const AXIS_HEIGHT_PX = 32
const MAX_AXIS_LABEL_LENGTH = 16

// Long batch names are shortened on the axis; the tooltip and table show them in full.
const shortenLabel = (name: string): string => {
  return name.length > MAX_AXIS_LABEL_LENGTH ? `${name.slice(0, MAX_AXIS_LABEL_LENGTH - 1)}…` : name
}

// Drawn as one line of text: Recharts' own tick wraps long names onto two lines.
const renderBatchTick = ({ x, y, payload }: YAxisTickContentProps): ReactElement => {
  return (
    <text x={Number(x)} y={Number(y)} dx={-8} dy={4} textAnchor="end" className="fill-muted-foreground text-xs">
      {shortenLabel(String(payload.value))}
    </text>
  )
}

// Ranked horizontal bars: how many current students each batch has, biggest first.
export const BatchStudentsChart = ({ batchStudentCounts }: BatchStudentsChartProps) => {
  const rows = getBatchChartRows(batchStudentCounts)

  const table = (
    <ChartTable
      caption="Students per batch"
      columns={[{ label: "Batch" }, { label: "Students", isNumeric: true }]}
      rows={batchStudentCounts.map((batch) => [batch.name, String(batch.studentCount)])}
    />
  )

  return (
    <ChartCard
      title="Students per batch"
      description="Current students assigned to each batch, biggest first."
      icon={Layers}
      tone="magenta"
      table={batchStudentCounts.length > 0 ? table : undefined}
      className="@5xl:col-span-2"
    >
      {batchStudentCounts.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No batches yet."
          action={
            <Link to={PATHS.adminBatches} className={buttonVariants({ variant: "outline", size: "lg" })}>
              Go to Batch Management
            </Link>
          }
        />
      ) : (
        <ChartContainer
          config={CHART_CONFIG}
          className="aspect-auto w-full"
          style={{ height: rows.length * ROW_HEIGHT_PX + AXIS_HEIGHT_PX }}
        >
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 32, left: 0, bottom: 0 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={136}
              tickLine={false}
              axisLine={false}
              tick={renderBatchTick}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, _, item) => (
                    <ChartTooltipRow
                      color={String(item.color)}
                      label={CHART_CONFIG.studentCount.label}
                      value={String(value)}
                    />
                  )}
                />
              }
            />
            <Bar dataKey="studentCount" fill="var(--color-studentCount)" radius={[0, 4, 4, 0]} maxBarSize={24}>
              <LabelList dataKey="studentCount" position="right" offset={8} className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </ChartCard>
  )
}
