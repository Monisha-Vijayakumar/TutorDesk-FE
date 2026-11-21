import type { ReactNode } from "react"
import type { OnChangeFn, PaginationState } from "@tanstack/react-table"
import type { PaymentSearchParams, PaymentStatus } from "@/api/interfaces/fee"
import type { ALL_PAYMENT_STATUSES } from "@/constants/fees"

export interface SearchInputProps {
  id: string
  label: string
  placeholder: string
  value: string
  onValueChange: (value: string) => void
  className?: string
}

// Search + payment filters shared by the Students and Fees pages.

export type PaymentStatusFilter = PaymentStatus | typeof ALL_PAYMENT_STATUSES

export interface PaymentSearchFilterValues {
  searchText: string
  paymentStatus: PaymentStatusFilter
  paidFrom: string
  paidTo: string
}

export interface UsePaymentSearchFiltersResult {
  filters: PaymentSearchFilterValues
  pagination: PaginationState
  setPagination: OnChangeFn<PaginationState>
  updateFilter: <TFilterName extends keyof PaymentSearchFilterValues>(
    filterName: TFilterName,
    value: PaymentSearchFilterValues[TFilterName]
  ) => void
  resetFilters: () => void
  goToFirstPage: () => void
  hasActiveFilters: boolean
  dateRangeError?: string
  searchParams: PaymentSearchParams
}

export interface PaymentSearchFiltersProps {
  filters: PaymentSearchFilterValues
  dateRangeError?: string
  hasActiveFilters: boolean
  onFilterChange: UsePaymentSearchFiltersResult["updateFilter"]
  onReset: () => void
  // Extra control shown first on the row, e.g. the month picker on the Fees page.
  leadingFilter?: ReactNode
}
