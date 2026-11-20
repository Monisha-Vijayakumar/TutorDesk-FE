import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PAGE_SIZE_OPTIONS } from "@/constants/table"
import type { DataTablePaginationProps } from "@/interfaces/table"

const PAGE_SIZE_SELECT_ITEMS = PAGE_SIZE_OPTIONS.map((pageSize) => ({
  value: String(pageSize),
  label: String(pageSize),
}))

export const DataTablePagination = <TData,>({ table, rowCount }: DataTablePaginationProps<TData>) => {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = Math.max(table.getPageCount(), 1)
  const firstRowNumber = rowCount === 0 ? 0 : pageIndex * pageSize + 1
  const lastRowNumber = Math.min((pageIndex + 1) * pageSize, rowCount)

  // A new page size starts again from the first page.
  const handlePageSizeChange = (selectedPageSize: string | null): void => {
    table.setPagination({ pageIndex: 0, pageSize: Number(selectedPageSize) })
  }

  return (
    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground" aria-live="polite">
        Showing {firstRowNumber}–{lastRowNumber} of {rowCount}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex items-center gap-2">
          <span id="rows-per-page-label" className="text-muted-foreground">
            Rows per page
          </span>
          <Select items={PAGE_SIZE_SELECT_ITEMS} value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger
              className="w-20 data-[size=default]:h-10 md:data-[size=default]:h-9"
              aria-labelledby="rows-per-page-label"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_SELECT_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-muted-foreground">
            Page {pageIndex + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-lg"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon-lg"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
