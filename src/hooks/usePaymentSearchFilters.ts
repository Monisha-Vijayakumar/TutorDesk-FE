import { useMemo, useState } from "react"
import type { PaginationState } from "@tanstack/react-table"
import type { PaymentSearchParams } from "@/api/interfaces/fee"
import { ALL_PAYMENT_STATUSES } from "@/constants/fees"
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from "@/constants/table"
import type { PaymentSearchFilterValues, UsePaymentSearchFiltersResult } from "@/interfaces/filters"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { validatePaymentDateRange } from "@/utils/validation"

const INITIAL_FILTERS: PaymentSearchFilterValues = {
  searchText: "",
  paymentStatus: ALL_PAYMENT_STATUSES,
  paidFrom: "",
  paidTo: "",
}

const INITIAL_PAGINATION: PaginationState = { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE }

// Search (Student ID or name), payment status, payment date range and pagination, shared by the
// Students and Fees pages and turned into list request params. Any filter change goes back to page 1.
export const usePaymentSearchFilters = (): UsePaymentSearchFiltersResult => {
  const [filters, setFilters] = useState<PaymentSearchFilterValues>(INITIAL_FILTERS)
  const [pagination, setPagination] = useState<PaginationState>(INITIAL_PAGINATION)
  const debouncedSearchText = useDebouncedValue(filters.searchText.trim(), SEARCH_DEBOUNCE_MS)
  const dateRangeError = validatePaymentDateRange(filters.paidFrom, filters.paidTo)

  const goToFirstPage = (): void => {
    setPagination((previousPagination) => ({ ...previousPagination, pageIndex: 0 }))
  }

  const updateFilter: UsePaymentSearchFiltersResult["updateFilter"] = (filterName, value) => {
    setFilters((previousFilters) => ({ ...previousFilters, [filterName]: value }))
    goToFirstPage()
  }

  const resetFilters = (): void => {
    setFilters(INITIAL_FILTERS)
    goToFirstPage()
  }

  const hasActiveFilters =
    filters.searchText !== INITIAL_FILTERS.searchText ||
    filters.paymentStatus !== INITIAL_FILTERS.paymentStatus ||
    filters.paidFrom !== INITIAL_FILTERS.paidFrom ||
    filters.paidTo !== INITIAL_FILTERS.paidTo

  // Empty filters are left out of the request. An invalid date range isn't applied until it's fixed.
  // Memoised: pages load their list in an effect keyed on this object, so it may only change when a
  // value in it changes.
  const isDateFilterApplied = !dateRangeError
  const searchParams = useMemo(
    (): PaymentSearchParams => ({
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearchText || undefined,
      paymentStatus: filters.paymentStatus === ALL_PAYMENT_STATUSES ? undefined : filters.paymentStatus,
      paidFrom: isDateFilterApplied && filters.paidFrom ? filters.paidFrom : undefined,
      paidTo: isDateFilterApplied && filters.paidTo ? filters.paidTo : undefined,
    }),
    [
      pagination.pageIndex,
      pagination.pageSize,
      debouncedSearchText,
      filters.paymentStatus,
      filters.paidFrom,
      filters.paidTo,
      isDateFilterApplied,
    ]
  )

  return {
    filters,
    pagination,
    setPagination,
    updateFilter,
    resetFilters,
    goToFirstPage,
    hasActiveFilters,
    dateRangeError,
    searchParams,
  }
}
