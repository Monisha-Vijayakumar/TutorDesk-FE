import { RotateCcw, Search, X } from "lucide-react"
import { FormField } from "@/components/FormField"
import { FormSelectField } from "@/components/FormSelectField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PAYMENT_STATUS_FILTER_OPTIONS } from "@/constants/fees"
import type { PaymentSearchFiltersProps, PaymentStatusFilter } from "@/interfaces/filters"
import { cn } from "@/lib/utils"

// Container-query layouts (sized by the space next to the sidebar, not the screen).
// Five controls: two columns from @xl with Search and Reset on their own rows, one row from @5xl.
const DEFAULT_LAYOUT = {
  grid: "@xl:grid-cols-2 @5xl:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto] @5xl:items-start",
  search: "@xl:col-span-2 @5xl:col-span-1",
  reset: "@xl:col-span-2 @5xl:col-span-1",
  resetSpacer: "@5xl:block",
}
// Six controls (with e.g. the Fees month picker): pairs from @xl (Month + Search, Status + From,
// To + Reset), one row only from @6xl, with minimum widths so "All Payment Statuses" and dates aren't cut.
const WITH_LEADING_FILTER_LAYOUT = {
  grid: "@xl:grid-cols-2 @xl:items-start @6xl:grid-cols-[minmax(9rem,1fr)_minmax(12rem,1.5fr)_minmax(11.5rem,1fr)_minmax(9.5rem,1fr)_minmax(9.5rem,1fr)_auto]",
  search: "",
  reset: "",
  resetSpacer: "@xl:block",
}

// Search box (Student ID or name), payment status, payment date range and Reset — used by the Students
// and Fees pages. Stacks on phones, then pairs, then one row when there's room. leadingFilter
// (e.g. a month picker) goes first.
export const PaymentSearchFilters = ({
  filters,
  dateRangeError,
  hasActiveFilters,
  onFilterChange,
  onReset,
  leadingFilter,
}: PaymentSearchFiltersProps) => {
  const layout = leadingFilter ? WITH_LEADING_FILTER_LAYOUT : DEFAULT_LAYOUT

  return (
    <div className={cn("grid gap-3 rounded-lg border bg-background p-4", layout.grid)}>
      {leadingFilter}
      <div className={cn("flex flex-col gap-1.5", layout.search)}>
        <Label htmlFor="student-search">Search</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="student-search"
            type="search"
            className="h-10 pr-10 pl-8 md:h-9 [&::-webkit-search-cancel-button]:hidden"
            placeholder="Search by Student ID or Name"
            autoComplete="off"
            value={filters.searchText}
            onChange={(event) => onFilterChange("searchText", event.target.value)}
          />
          {filters.searchText && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 size-10 md:size-9"
              onClick={() => onFilterChange("searchText", "")}
              aria-label="Clear search"
            >
              <X />
            </Button>
          )}
        </div>
      </div>

      <FormSelectField
        id="payment-status-filter"
        label="Payment status"
        value={filters.paymentStatus}
        options={PAYMENT_STATUS_FILTER_OPTIONS}
        placeholder="All Payment Statuses"
        onValueChange={(value) => onFilterChange("paymentStatus", value as PaymentStatusFilter)}
      />

      <FormField
        id="paid-from-filter"
        label="Payment date from"
        type="date"
        value={filters.paidFrom}
        max={filters.paidTo || undefined}
        onChange={(event) => onFilterChange("paidFrom", event.target.value)}
      />

      <FormField
        id="paid-to-filter"
        label="Payment date to"
        type="date"
        value={filters.paidTo}
        min={filters.paidFrom || undefined}
        error={dateRangeError}
        onChange={(event) => onFilterChange("paidTo", event.target.value)}
      />

      {/* When Reset sits next to fields, an empty label-sized line above it lines it up with the inputs
          (labels are text-sm + leading-none + gap-1.5, like every field above). */}
      <div className={cn("flex flex-col gap-1.5", layout.reset)}>
        <span className={cn("hidden text-sm leading-none", layout.resetSpacer)} aria-hidden="true">
          &nbsp;
        </span>
        <Button
          variant="outline"
          size="lg"
          // Same height as the inputs: 40px on phones, 36px from md.
          className="md:h-9"
          onClick={onReset}
          disabled={!hasActiveFilters}
        >
          <RotateCcw />
          Reset
        </Button>
      </div>
    </div>
  )
}
