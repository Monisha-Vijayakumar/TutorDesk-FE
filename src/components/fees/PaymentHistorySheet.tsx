import { useCallback, useEffect, type ReactNode } from "react"
import { AlertCircle, BellRing, Wallet } from "lucide-react"
import { EmptyState } from "@/components/EmptyState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  PAYMENT_METHOD_LABELS,
  REMINDER_CHANNEL_LABELS,
  REMINDER_STATUS_LABELS,
  REMINDER_TYPE_LABELS,
} from "@/constants/fees"
import { SKELETON_ROW_COUNT } from "@/constants/table"
import type { PaymentHistorySheetProps } from "@/interfaces/fees"
import { fetchPaymentHistory, selectPaymentHistory, selectPaymentHistoryError } from "@/store/feeSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { formatDisplayDate, formatDisplayDateTime, formatMonthLabel } from "@/utils/date"
import { formatCurrency, formatFullName } from "@/utils/format"

const SECTION_TITLE_CLASS = "text-sm font-semibold text-foreground"
const SKELETON_ITEMS = Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => index)

// One student's payment transactions and payment reminders (all months), kept as separate lists.
export const PaymentHistorySheet = ({ isOpen, fee, onOpenChange }: PaymentHistorySheetProps) => {
  const dispatch = useAppDispatch()
  // The last selected student (kept while the sheet closes, so nothing flashes on close).
  const studentId = fee ? fee.student.id : null
  // Only this student's history: never the previously opened student's while this one loads.
  const history = useAppSelector((state) => selectPaymentHistory(state, studentId))
  const historyError = useAppSelector(selectPaymentHistoryError)

  const loadHistory = useCallback((): void => {
    if (studentId) {
      dispatch(fetchPaymentHistory(studentId))
    }
  }, [dispatch, studentId])

  // Load (or refresh) each time the sheet opens, so new payments and reminders show.
  useEffect(() => {
    if (!isOpen || !studentId) {
      return
    }
    const request = dispatch(fetchPaymentHistory(studentId))
    return () => request.abort()
  }, [dispatch, isOpen, studentId])

  const renderContent = (): ReactNode => {
    if (historyError) {
      return (
        <EmptyState
          icon={AlertCircle}
          title={historyError}
          action={
            <Button variant="outline" size="lg" onClick={loadHistory}>
              Try again
            </Button>
          }
        />
      )
    }

    if (!history) {
      return (
        <div className="flex flex-col gap-3" role="status" aria-label="Loading">
          {SKELETON_ITEMS.map((item) => (
            <Skeleton key={item} className="h-16 w-full" />
          ))}
        </div>
      )
    }

    return (
      <>
        <section className="flex flex-col gap-3" aria-labelledby="payment-transactions-title">
          <h3 id="payment-transactions-title" className={SECTION_TITLE_CLASS}>
            Payments ({history.payments.length})
          </h3>
          {history.payments.length === 0 ? (
            <EmptyState icon={Wallet} title="No payments recorded yet." />
          ) : (
            <ul className="flex flex-col gap-2">
              {history.payments.map((payment) => (
                <li key={payment.id} className="flex flex-col gap-1 rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium tabular-nums">{formatCurrency(payment.amount)}</span>
                    <Badge variant="secondary">{PAYMENT_METHOD_LABELS[payment.method]}</Badge>
                  </div>
                  <p>
                    Paid on {formatDisplayDate(payment.paidOn)}
                    <span className="text-muted-foreground"> · for {formatMonthLabel(payment.month)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDisplayDateTime(payment.recordedAt)} by {payment.recordedBy}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3" aria-labelledby="payment-reminders-title">
          <div className="flex flex-col gap-1">
            <h3 id="payment-reminders-title" className={SECTION_TITLE_CLASS}>
              Reminders ({history.reminders.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              WhatsApp reminders show as Initiated: TutorDesk opens WhatsApp but can't confirm the message was sent.
            </p>
          </div>
          {history.reminders.length === 0 ? (
            <EmptyState icon={BellRing} title="No reminders sent yet." />
          ) : (
            <ul className="flex flex-col gap-2">
              {history.reminders.map((reminder) => (
                <li key={reminder.id} className="flex flex-col gap-1 rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">
                      {REMINDER_CHANNEL_LABELS[reminder.channel]} · {REMINDER_TYPE_LABELS[reminder.type]}
                    </span>
                    <Badge variant="outline">{REMINDER_STATUS_LABELS[reminder.status]}</Badge>
                  </div>
                  <p>
                    To {reminder.contact}
                    <span className="text-muted-foreground"> · for {formatMonthLabel(reminder.month)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDisplayDateTime(reminder.initiatedAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <SheetTitle className="text-lg">Payment history</SheetTitle>
          <SheetDescription>
            {fee
              ? `${formatFullName(fee.student.firstName, fee.student.lastName)} (${fee.student.studentCode}) — all months`
              : ""}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">{renderContent()}</div>
      </SheetContent>
    </Sheet>
  )
}
