import { RotateCcw } from "lucide-react"
import { FormSelectField } from "@/components/FormSelectField"
import { SearchInput } from "@/components/SearchInput"
import { Button } from "@/components/ui/button"
import type { BatchSearchFiltersProps } from "@/interfaces/batches"

// Search box, Batch Time filter and Reset. Stacks on phones, two columns from @xl (Reset on its own
// row), one row from @4xl — sized by the content area (container queries), like PaymentSearchFilters.
export const BatchSearchFilters = ({
  filters,
  timeSlotOptions,
  hasActiveFilters,
  onFilterChange,
  onReset,
}: BatchSearchFiltersProps) => {
  return (
    <div className="grid gap-3 rounded-lg border bg-background p-4 @xl:grid-cols-2 @4xl:grid-cols-[minmax(0,2fr)_minmax(14rem,1fr)_auto] @4xl:items-start">
      <SearchInput
        id="batch-search"
        label="Search"
        placeholder="Batch, Student ID or Name"
        value={filters.searchText}
        onValueChange={(value) => onFilterChange("searchText", value)}
      />

      <FormSelectField
        id="batch-time-filter"
        label="Batch time"
        value={filters.timeSlot}
        options={timeSlotOptions}
        placeholder="All Batch Times"
        onValueChange={(value) => onFilterChange("timeSlot", value)}
      />

      {/* When Reset sits next to the fields, an empty label-sized line above it lines it up with the inputs. */}
      <div className="flex flex-col gap-1.5 @xl:col-span-2 @4xl:col-span-1">
        <span className="hidden text-sm leading-none @4xl:block" aria-hidden="true">
          &nbsp;
        </span>
        <Button variant="outline" size="lg" className="md:h-9" onClick={onReset} disabled={!hasActiveFilters}>
          <RotateCcw />
          Reset
        </Button>
      </div>
    </div>
  )
}
