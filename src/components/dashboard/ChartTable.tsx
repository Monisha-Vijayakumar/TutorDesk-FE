import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ChartTableProps } from "@/interfaces/dashboard"
import { cn } from "@/lib/utils"

// The table view of a chart: the same numbers, readable without hovering.
export const ChartTable = ({ caption, columns, rows }: ChartTableProps) => {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableCaption className="sr-only">{caption}</TableCaption>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.label} className={cn("px-3", column.isNumeric && "text-right")}>
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row[0]}>
              {row.map((cell, index) => (
                <TableCell
                  key={columns[index].label}
                  className={cn("px-3 py-2.5", columns[index].isNumeric && "text-right tabular-nums")}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
