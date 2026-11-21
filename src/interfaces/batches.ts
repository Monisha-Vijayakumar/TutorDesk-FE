import type { OnChangeFn, PaginationState } from "@tanstack/react-table"
import type { Batch, BatchListParams, BatchStudent, BatchSummary, BatchTimeSlot } from "@/api/interfaces/batch"
import type { SelectOption } from "@/interfaces/form"

// API shapes (Batch, payloads, list params, BatchService) live in @/api/interfaces/batch.

export interface BatchFormValues {
  name: string
  description: string
  startTime: string // "HH:mm" from the time input, "" when not set
  endTime: string
  // Kept with Student ID and name (not just ids), so assigned students show even when the student
  // list in the form is searched down to others.
  students: BatchStudent[]
}

// Redux state of the Batch Management page (batchSlice).
export interface BatchState {
  batches: BatchSummary[]
  total: number // matching batches across all pages
  hasLoadedList: boolean // false until the first list arrives (skeleton until then)
  isListLoading: boolean
  listError: string | null // message of the last failed list request
  // The latest list request; responses of older ones (filters changed meanwhile) are ignored.
  listRequestId: string | null
  timeSlots: BatchTimeSlot[] // options of the Batch Time filter
  batchDetails: Batch | null // the batch open in the View or Edit sheet
  batchDetailsId: string | null // whose details batchDetails is (or is being loaded)
  batchDetailsError: string | null
  batchDetailsRequestId: string | null
}

export interface BatchSearchFilterValues {
  searchText: string
  timeSlot: string // "09:00-10:00", or ALL_BATCH_TIMES
}

export interface UseBatchSearchFiltersResult {
  filters: BatchSearchFilterValues
  pagination: PaginationState
  setPagination: OnChangeFn<PaginationState>
  updateFilter: <TFilterName extends keyof BatchSearchFilterValues>(
    filterName: TFilterName,
    value: BatchSearchFilterValues[TFilterName]
  ) => void
  resetFilters: () => void
  hasActiveFilters: boolean
  searchParams: BatchListParams
}

export interface BatchSearchFiltersProps {
  filters: BatchSearchFilterValues
  timeSlotOptions: SelectOption[]
  hasActiveFilters: boolean
  onFilterChange: UseBatchSearchFiltersResult["updateFilter"]
  onReset: () => void
}

export interface BatchActionHandlers {
  onView: (batch: BatchSummary) => void
  onEdit: (batch: BatchSummary) => void
  onDelete: (batch: BatchSummary) => void
}

export interface BatchMobileCardProps extends BatchActionHandlers {
  batch: BatchSummary
}

// Add form when batch is null. The page keeps the last selected batch while a sheet closes,
// so its content doesn't vanish mid-animation.
export interface BatchSheetState {
  isOpen: boolean
  batch: BatchSummary | null
}

export interface BatchFormSheetProps {
  isOpen: boolean
  batch: BatchSummary | null
  onOpenChange: (isOpen: boolean) => void
  onBatchCreated: () => void
  // An edit was saved, or the batch turned out to be deleted: the list needs reloading.
  onBatchesChanged: () => void
}

export interface BatchFormProps {
  batch: Batch | null
  onSaved: () => void
  onCancel: () => void
  onBatchNotFound: () => void // the batch was deleted elsewhere while the form was open
}

export interface BatchDetailsSheetProps {
  isOpen: boolean
  batch: BatchSummary | null
  onOpenChange: (isOpen: boolean) => void
  onBatchNotFound: () => void
}

export interface DeleteBatchDialogProps {
  batch: BatchSummary | null
  onClose: () => void
  onDeleted: () => void // also called when the batch was already deleted elsewhere
}

export interface BatchStudentPickerProps {
  selectedStudents: BatchStudent[]
  onSelectedStudentsChange: (students: BatchStudent[]) => void
  error?: string
}

export interface BatchDetailsFallbackProps {
  error: string | null // null while loading
  onRetry: () => void
}

export interface UseBatchDetailsResult {
  batch: Batch | null // null while loading or after an error
  error: string | null
  reload: () => void
  handleOpenChangeComplete: (isSheetOpen: boolean) => void // for the sheet's onOpenChangeComplete
}
