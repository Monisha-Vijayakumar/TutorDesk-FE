import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SKELETON_ROW_COUNT } from "@/constants/table"
import type { DataTableProps, DataTableSkeletonProps } from "@/interfaces/table"
import { cn } from "@/lib/utils"
import { DataTablePagination } from "./DataTablePagination"

const SKELETON_ROWS = Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => index)

// Pinned columns need a background so scrolled cells don't show through, and a divider on the left.
const PINNED_RIGHT_CLASS = "sticky right-0 z-10 bg-background shadow-[inset_1px_0_0_var(--border)]"

const DataTableSkeleton = ({ columnCount }: DataTableSkeletonProps) => {
  return (
    <div className="flex flex-col gap-3" role="status" aria-label="Loading">
      {SKELETON_ROWS.map((rowNumber) => (
        <div key={rowNumber} className="flex gap-3 rounded-lg border bg-background p-4">
          {/* One block per column on large screens, two on phones. */}
          {Array.from({ length: columnCount }, (_, columnNumber) => (
            <Skeleton
              key={columnNumber}
              className={cn("h-5 flex-1", columnNumber > 1 && "hidden @4xl:block")}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Server-paginated table (TanStack Table + shadcn Table). The page passes one page of rows and
// the total count; changing the page or page size calls onPaginationChange so it can refetch.
export const DataTable = <TData,>({
  columns,
  data,
  rowCount,
  pagination,
  onPaginationChange,
  getRowId,
  renderMobileCard,
  isLoading,
  isFetching = false,
  emptyState,
}: DataTableProps<TData>) => {
  // TanStack Table returns new functions every render, which the React Compiler lint can't memoise.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getRowId,
    rowCount,
    state: { pagination },
    onPaginationChange,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return <DataTableSkeleton columnCount={columns.length} />
  }

  if (data.length === 0) {
    return emptyState
  }

  const rows = table.getRowModel().rows

  return (
    <div className="flex flex-col gap-4">
      <div className={cn("transition-opacity", isFetching && "opacity-60")} aria-busy={isFetching}>
        {/* Cards when the content area is narrow, the table from 56rem (896px) of space (NFR-23).
            Container queries, not screen size, so collapsing the sidebar can switch to the table. */}
        <ul className="flex flex-col gap-3 @4xl:hidden">
          {rows.map((row) => (
            <li key={row.id}>{renderMobileCard(row.original)}</li>
          ))}
        </ul>

        <div className="hidden rounded-lg border bg-background @4xl:block">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "px-2 whitespace-nowrap first:pl-3",
                        header.column.columnDef.meta?.isPinnedRight && PINNED_RIGHT_CLASS
                      )}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn("px-2 py-3 first:pl-3", cell.column.columnDef.meta?.isPinnedRight && PINNED_RIGHT_CLASS)}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <DataTablePagination table={table} rowCount={rowCount} />
    </div>
  )
}
