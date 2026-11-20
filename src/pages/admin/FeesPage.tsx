import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, CalendarX, SearchX } from "lucide-react"
import { toast } from "sonner"
import { getApiError } from "@/api/apiErrorHandler"
import type { FeeListParams, FeeRecord } from "@/api/interfaces/fee"
import { SUCCESS_MESSAGES } from "@/api/successMessages"
import { EmptyState } from "@/components/EmptyState"
import { FeeFormSheet } from "@/components/fees/FeeFormSheet"
import { FeeMobileCard } from "@/components/fees/FeeMobileCard"
import { getFeeTableColumns } from "@/components/fees/feeTableColumns"
import { PaymentHistorySheet } from "@/components/fees/PaymentHistorySheet"
import { FormSelectField } from "@/components/FormSelectField"
import { PageHeader } from "@/components/PageHeader"
import { PaymentSearchFilters } from "@/components/PaymentSearchFilters"
import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/constants/app"
import { FEE_MONTH_PICKER_COUNT, REMINDER_CHANNELS, REMINDER_TYPES } from "@/constants/fees"
import { ADMIN_PAGE_TITLES } from "@/constants/navigation"
import { usePaymentSearchFilters } from "@/hooks/usePaymentSearchFilters"
import type { FeeSheetState } from "@/interfaces/fees"
import { selectCurrentUser } from "@/store/authSlice"
import {
  createFeeReminder,
  fetchFees,
  selectFeeListError,
  selectFees,
  selectFeeTotal,
  selectHasLoadedFeeList,
  selectIsFeeListLoading,
  selectSendingReminderFeeIds,
} from "@/store/feeSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { formatMonthLabel, getCurrentMonth, getRecentMonthOptions } from "@/utils/date"
import { buildPaymentReminderMessage, buildWhatsAppChatUrl } from "@/utils/feeReminder"

const CLOSED_SHEET: FeeSheetState = { isOpen: false, fee: null }

const getFeeRowId = (fee: FeeRecord): string => fee.id

// Monthly fees: search/filter like the Students page, edit payment details, send WhatsApp reminders
// and view payment history. No add or delete here — students are managed on the Students page.
export const FeesPage = () => {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(selectCurrentUser)
  const fees = useAppSelector(selectFees)
  const totalFees = useAppSelector(selectFeeTotal)
  const hasLoadedList = useAppSelector(selectHasLoadedFeeList)
  const isListLoading = useAppSelector(selectIsFeeListLoading)
  const listError = useAppSelector(selectFeeListError)
  const sendingReminderFeeIds = useAppSelector(selectSendingReminderFeeIds)

  const [month, setMonth] = useState(getCurrentMonth())
  const monthOptions = useMemo(() => getRecentMonthOptions(FEE_MONTH_PICKER_COUNT), [])
  const {
    filters,
    pagination,
    setPagination,
    updateFilter,
    resetFilters,
    goToFirstPage,
    hasActiveFilters,
    dateRangeError,
    searchParams,
  } = usePaymentSearchFilters()
  const feeListParams = useMemo((): FeeListParams => ({ ...searchParams, month }), [searchParams, month])

  const [editSheet, setEditSheet] = useState<FeeSheetState>(CLOSED_SHEET)
  const [historySheet, setHistorySheet] = useState<FeeSheetState>(CLOSED_SHEET)

  const instituteName = currentUser?.centerName ?? APP_NAME

  // Load the list whenever the month, search, filters or page change. The previous request is
  // aborted, so a slow older response can't replace newer results.
  useEffect(() => {
    const request = dispatch(fetchFees(feeListParams))
    return () => request.abort()
  }, [dispatch, feeListParams])

  const reloadFees = useCallback((): void => {
    dispatch(fetchFees(feeListParams))
  }, [dispatch, feeListParams])

  const handleMonthChange = (selectedMonth: string): void => {
    setMonth(selectedMonth)
    goToFirstPage()
  }

  // Opens WhatsApp with the parent's number and a pre-filled message built from the latest saved fee,
  // then records that a reminder was initiated. The admin still has to press Send in WhatsApp.
  // window.open runs first, straight from the click, so pop-up blockers allow it. While the record
  // is being saved the button is disabled, so a double click can't open WhatsApp twice.
  const handleSendReminder = useCallback(
    async (fee: FeeRecord): Promise<void> => {
      if (sendingReminderFeeIds.includes(fee.id)) {
        return
      }

      const message = buildPaymentReminderMessage(fee, instituteName)
      window.open(buildWhatsAppChatUrl(fee.student.parentPhone, message), "_blank", "noopener,noreferrer")

      const result = await dispatch(
        createFeeReminder({
          feeId: fee.id,
          payload: {
            channel: REMINDER_CHANNELS.WHATSAPP,
            type: REMINDER_TYPES.MANUAL,
            contact: fee.student.parentPhone,
          },
        })
      )

      if (createFeeReminder.fulfilled.match(result)) {
        toast.success(SUCCESS_MESSAGES.REMINDER_INITIATED)
        return
      }
      // Skipped by the thunk's duplicate check: nothing to report.
      if (result.meta.condition) {
        return
      }
      toast.error((result.payload ?? getApiError(result.error)).message)
      // The fee may have changed meanwhile (paid, or student deleted): show the current state.
      reloadFees()
    },
    [dispatch, instituteName, reloadFees, sendingReminderFeeIds]
  )

  const columns = useMemo(
    () =>
      getFeeTableColumns({
        onEdit: (fee) => setEditSheet({ isOpen: true, fee }),
        onSendReminder: handleSendReminder,
        onViewHistory: (fee) => setHistorySheet({ isOpen: true, fee }),
        sendingReminderFeeIds,
      }),
    [handleSendReminder, sendingReminderFeeIds]
  )

  const emptyState = hasActiveFilters ? (
    <EmptyState
      icon={SearchX}
      title="No fees match your search or filters."
      action={
        <Button variant="outline" size="lg" onClick={resetFilters}>
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={CalendarX}
      title={`No fees for ${formatMonthLabel(month)}.`}
      description="Students appear here from the month they joined."
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={ADMIN_PAGE_TITLES.FEES}
        description="Track monthly fees, record payments and send WhatsApp payment reminders."
      />

      <PaymentSearchFilters
        filters={filters}
        dateRangeError={dateRangeError}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
        leadingFilter={
          <FormSelectField
            id="fee-month"
            label="Month"
            value={month}
            options={monthOptions}
            placeholder="Select a month"
            onValueChange={handleMonthChange}
          />
        }
      />

      {listError ? (
        <EmptyState
          icon={AlertCircle}
          title={listError}
          action={
            <Button variant="outline" size="lg" onClick={reloadFees}>
              Try again
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={fees}
          rowCount={totalFees}
          pagination={pagination}
          onPaginationChange={setPagination}
          getRowId={getFeeRowId}
          renderMobileCard={(fee) => (
            <FeeMobileCard
              fee={fee}
              isSendingReminder={sendingReminderFeeIds.includes(fee.id)}
              onEdit={(selectedFee) => setEditSheet({ isOpen: true, fee: selectedFee })}
              onSendReminder={handleSendReminder}
              onViewHistory={(selectedFee) => setHistorySheet({ isOpen: true, fee: selectedFee })}
            />
          )}
          isLoading={!hasLoadedList}
          isFetching={isListLoading}
          emptyState={emptyState}
        />
      )}

      <FeeFormSheet
        isOpen={editSheet.isOpen}
        fee={editSheet.fee}
        onOpenChange={(isOpen) => setEditSheet((previousState) => ({ ...previousState, isOpen }))}
        onFeesChanged={reloadFees}
      />
      <PaymentHistorySheet
        isOpen={historySheet.isOpen}
        fee={historySheet.fee}
        onOpenChange={(isOpen) => setHistorySheet((previousState) => ({ ...previousState, isOpen }))}
      />
    </div>
  )
}
