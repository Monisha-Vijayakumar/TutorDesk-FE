import { useMemo, useState } from "react"
import type { PaginationState } from "@tanstack/react-table"
import type { BatchListParams } from "@/api/interfaces/batch"
import { ALL_BATCH_TIMES } from "@/constants/batches"
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/constants/table"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import type { BatchSearchFilterValues, UseBatchSearchFiltersResult } from "@/interfaces/batches"
import { parseBatchTimeSlotValue } from "@/utils/batchTime"

const INITIAL_FILTERS: BatchSearchFilterValues = {
  searchText: "",
  timeSlot: ALL_BATCH_TIMES,
}

const INITIAL_PAGINATION: PaginationState = { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE }

// Search (batch name, Student ID or student name), Batch Time filter and pagination of the Batch
// Management page, turned into list request params. Any filter change goes back to page 1.
export const useBatchSearchFilters = (): UseBatchSearchFiltersResult => {
  const [filters, setFilters] = useState<BatchSearchFilterValues>(INITIAL_FILTERS)
  const [pagination, setPagination] = useState<PaginationState>(INITIAL_PAGINATION)
  const debouncedSearchText = useDebouncedValue(filters.searchText.trim(), SEARCH_DEBOUNCE_MS)

  const updateFilter: UseBatchSearchFiltersResult["updateFilter"] = (filterName, value) => {
    setFilters((previousFilters) => ({ ...previousFilters, [filterName]: value }))
    setPagination((previousPagination) => ({ ...previousPagination, pageIndex: 0 }))
  }

  const resetFilters = (): void => {
    setFilters(INITIAL_FILTERS)
    setPagination((previousPagination) => ({ ...previousPagination, pageIndex: 0 }))
  }

  const hasActiveFilters =
    filters.searchText !== INITIAL_FILTERS.searchText || filters.timeSlot !== INITIAL_FILTERS.timeSlot

  // Empty filters are left out of the request. Memoised: the page loads its list in an effect keyed
  // on this object, so it may only change when a value in it changes.
  const searchParams = useMemo((): BatchListParams => {
    const timeSlot = parseBatchTimeSlotValue(filters.timeSlot)
    return {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearchText || undefined,
      startTime: timeSlot?.startTime,
      endTime: timeSlot?.endTime,
    }
  }, [pagination.pageIndex, pagination.pageSize, debouncedSearchText, filters.timeSlot])

  return {
    filters,
    pagination,
    setPagination,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    searchParams,
  }
}
