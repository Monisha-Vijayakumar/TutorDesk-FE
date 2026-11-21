import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, Layers, Plus, SearchX } from "lucide-react"
import type { BatchSummary } from "@/api/interfaces/batch"
import { BatchDetailsSheet } from "@/components/batches/BatchDetailsSheet"
import { BatchFormSheet } from "@/components/batches/BatchFormSheet"
import { BatchMobileCard } from "@/components/batches/BatchMobileCard"
import { BatchSearchFilters } from "@/components/batches/BatchSearchFilters"
import { getBatchTableColumns } from "@/components/batches/batchTableColumns"
import { DeleteBatchDialog } from "@/components/batches/DeleteBatchDialog"
import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { ADMIN_PAGE_TITLES } from "@/constants/navigation"
import { useBatchSearchFilters } from "@/hooks/useBatchSearchFilters"
import type { BatchSheetState } from "@/interfaces/batches"
import {
  fetchBatches,
  fetchBatchTimeSlots,
  selectBatches,
  selectBatchListError,
  selectBatchTimeSlots,
  selectBatchTotal,
  selectHasLoadedBatchList,
  selectIsBatchListLoading,
} from "@/store/batchSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { getBatchTimeSlotOptions } from "@/utils/batchTime"

const CLOSED_SHEET: BatchSheetState = { isOpen: false, batch: null }

const getBatchRowId = (batch: BatchSummary): string => batch.id

export const BatchesPage = () => {
  const dispatch = useAppDispatch()
  const { filters, pagination, setPagination, updateFilter, resetFilters, hasActiveFilters, searchParams } =
    useBatchSearchFilters()
  const batches = useAppSelector(selectBatches)
  const totalBatches = useAppSelector(selectBatchTotal)
  const hasLoadedList = useAppSelector(selectHasLoadedBatchList)
  const isListLoading = useAppSelector(selectIsBatchListLoading)
  const listError = useAppSelector(selectBatchListError)
  const timeSlots = useAppSelector(selectBatchTimeSlots)

  const [formSheet, setFormSheet] = useState<BatchSheetState>(CLOSED_SHEET)
  const [detailsSheet, setDetailsSheet] = useState<BatchSheetState>(CLOSED_SHEET)
  const [batchToDelete, setBatchToDelete] = useState<BatchSummary | null>(null)

  // Load the list whenever the search, filter or page change. The previous request is aborted,
  // so a slow older response can't replace newer results.
  useEffect(() => {
    const request = dispatch(fetchBatches(searchParams))
    return () => request.abort()
  }, [dispatch, searchParams])

  useEffect(() => {
    const request = dispatch(fetchBatchTimeSlots())
    return () => request.abort()
  }, [dispatch])

  const reloadBatches = useCallback((): void => {
    dispatch(fetchBatches(searchParams))
  }, [dispatch, searchParams])

  // After a change the times in use may differ too, so the filter options are reloaded with the list.
  const reloadBatchesAndTimeSlots = (): void => {
    dispatch(fetchBatchTimeSlots())
    reloadBatches()
  }

  const timeSlotOptions = useMemo(
    () => getBatchTimeSlotOptions(timeSlots, filters.timeSlot),
    [timeSlots, filters.timeSlot]
  )

  const columns = useMemo(
    () =>
      getBatchTableColumns({
        onView: (batch) => setDetailsSheet({ isOpen: true, batch }),
        onEdit: (batch) => setFormSheet({ isOpen: true, batch }),
        onDelete: setBatchToDelete,
      }),
    []
  )

  const openAddBatchForm = (): void => {
    setFormSheet({ isOpen: true, batch: null })
  }

  const handleFormSheetOpenChange = (isOpen: boolean): void => {
    setFormSheet((previousState) => ({ ...previousState, isOpen }))
  }

  const handleDetailsSheetOpenChange = (isOpen: boolean): void => {
    setDetailsSheet((previousState) => ({ ...previousState, isOpen }))
  }

  // Viewed a batch that was deleted elsewhere meanwhile.
  const handleViewedBatchNotFound = (): void => {
    handleDetailsSheetOpenChange(false)
    reloadBatchesAndTimeSlots()
  }

  // New batches are listed first, so show page 1 where the new record appears
  // (changing the page reloads the list; on page 1 already, reload it here).
  const handleBatchCreated = (): void => {
    dispatch(fetchBatchTimeSlots())
    if (pagination.pageIndex === 0) {
      reloadBatches()
      return
    }
    setPagination((previousPagination) => ({ ...previousPagination, pageIndex: 0 }))
  }

  // Deleting the only row on a later page would leave an empty page; go back one instead.
  const handleBatchDeleted = (): void => {
    setBatchToDelete(null)
    dispatch(fetchBatchTimeSlots())
    if (batches.length === 1 && pagination.pageIndex > 0) {
      setPagination((previousPagination) => ({ ...previousPagination, pageIndex: previousPagination.pageIndex - 1 }))
      return
    }
    reloadBatches()
  }

  const addBatchButton = (
    <Button size="lg" className="w-full sm:w-auto" onClick={openAddBatchForm}>
      <Plus />
      Add Batch
    </Button>
  )

  const emptyState = hasActiveFilters ? (
    <EmptyState
      icon={SearchX}
      title="No batches match your search or filters."
      action={
        <Button variant="outline" size="lg" onClick={resetFilters}>
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Layers}
      title="No batches found."
      description="Add your first batch to group students by timing."
      action={addBatchButton}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={ADMIN_PAGE_TITLES.BATCHES}
        description="Create batches, set their timings and assign students."
        action={addBatchButton}
      />

      <BatchSearchFilters
        filters={filters}
        timeSlotOptions={timeSlotOptions}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
      />

      {listError ? (
        <EmptyState
          icon={AlertCircle}
          title={listError}
          action={
            <Button variant="outline" size="lg" onClick={reloadBatches}>
              Try again
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={batches}
          rowCount={totalBatches}
          pagination={pagination}
          onPaginationChange={setPagination}
          getRowId={getBatchRowId}
          renderMobileCard={(batch) => (
            <BatchMobileCard
              batch={batch}
              onView={(selectedBatch) => setDetailsSheet({ isOpen: true, batch: selectedBatch })}
              onEdit={(selectedBatch) => setFormSheet({ isOpen: true, batch: selectedBatch })}
              onDelete={setBatchToDelete}
            />
          )}
          isLoading={!hasLoadedList}
          isFetching={isListLoading}
          emptyState={emptyState}
        />
      )}

      <BatchFormSheet
        isOpen={formSheet.isOpen}
        batch={formSheet.batch}
        onOpenChange={handleFormSheetOpenChange}
        onBatchCreated={handleBatchCreated}
        onBatchesChanged={reloadBatchesAndTimeSlots}
      />

      <BatchDetailsSheet
        isOpen={detailsSheet.isOpen}
        batch={detailsSheet.batch}
        onOpenChange={handleDetailsSheetOpenChange}
        onBatchNotFound={handleViewedBatchNotFound}
      />

      <DeleteBatchDialog batch={batchToDelete} onClose={() => setBatchToDelete(null)} onDeleted={handleBatchDeleted} />
    </div>
  )
}
