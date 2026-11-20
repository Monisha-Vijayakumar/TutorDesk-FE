import type { FeeRecord, PaymentHistoryResponse } from "@/api/interfaces/fee"

// API shapes (FeeRecord, payloads, history, FeeService) live in @/api/interfaces/fee.

export interface FeeFormValues {
  totalFee: string // whole rupees as typed
  dueDate: string // "YYYY-MM-DD"
  // "Record a payment" section — only used when paymentAmount is filled in.
  paymentAmount: string // whole rupees
  paymentDate: string
  paymentMethod: string
}

// Redux state of the Fees page (feeSlice): the month's fee list and the open payment history.
export interface FeeState {
  fees: FeeRecord[]
  total: number // matching fee records across all pages
  hasLoadedList: boolean // false until the first list arrives (skeleton until then)
  isListLoading: boolean
  listError: string | null // message of the last failed list request
  // The latest list request; responses of older ones (filters or month changed meanwhile) are ignored.
  listRequestId: string | null
  paymentHistory: PaymentHistoryResponse | null
  paymentHistoryStudentId: string | null // whose history paymentHistory is (or is being loaded)
  paymentHistoryError: string | null
  paymentHistoryRequestId: string | null
  // Fee records whose reminder is being recorded: their Send button is disabled meanwhile,
  // so a double click can't open WhatsApp twice or log two reminders.
  sendingReminderFeeIds: string[]
}

export interface FeeActionHandlers {
  onEdit: (fee: FeeRecord) => void
  onSendReminder: (fee: FeeRecord) => void
  onViewHistory: (fee: FeeRecord) => void
}

export interface FeeTableColumnOptions extends FeeActionHandlers {
  sendingReminderFeeIds: string[]
}

export interface FeeMobileCardProps extends FeeActionHandlers {
  fee: FeeRecord
  isSendingReminder: boolean
}

// The page keeps the last selected fee while a sheet closes, so its content doesn't vanish mid-animation.
export interface FeeSheetState {
  isOpen: boolean
  fee: FeeRecord | null
}

export interface FeeFormSheetProps {
  isOpen: boolean
  fee: FeeRecord | null
  onOpenChange: (isOpen: boolean) => void
  // A payment was saved, or the student turned out to be deleted: the list needs reloading.
  onFeesChanged: () => void
}

export interface FeeFormProps {
  fee: FeeRecord
  onSaved: () => void
  onCancel: () => void
  onFeeNotFound: () => void // the student was deleted elsewhere while the form was open
}

export interface PaymentHistorySheetProps {
  isOpen: boolean
  fee: FeeRecord | null // history is for fee.student (all months)
  onOpenChange: (isOpen: boolean) => void
}
