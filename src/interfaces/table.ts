import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import type { ColumnDef, OnChangeFn, PaginationState, RowData, Table } from "@tanstack/react-table"

// Extra column options read by DataTable. The type parameters must match TanStack's declaration.
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    // Keeps the column visible at the right edge while a wide table scrolls (e.g. row actions).
    isPinnedRight?: boolean
  }
}

// Server-paginated table: the API returns one page of rows plus the total row count.
export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  rowCount: number
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  getRowId: (row: TData) => string
  // Phones and tablets show a card per row instead of the wide table (NFR-23).
  renderMobileCard: (row: TData) => ReactNode
  isLoading: boolean // first load: show skeleton rows
  isFetching?: boolean // refetching: dim the current rows
  emptyState: ReactNode
}

export interface DataTablePaginationProps<TData> {
  table: Table<TData>
  rowCount: number
}

export interface DataTableSkeletonProps {
  columnCount: number
}

// Icon-only action in a table row; the label is shown as a tooltip and read by screen readers.
export interface RowActionButtonProps {
  label: string
  icon: LucideIcon
  onClick: () => void
  isDestructive?: boolean
  isDisabled?: boolean
}
