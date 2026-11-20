import whitelist from "validator/es/lib/whitelist"
import type { FeeRecord } from "@/api/interfaces/fee"
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  LOCAL_MOBILE_NUMBER_LENGTH,
  PAYMENT_STATUSES,
  WHATSAPP_CHAT_BASE_URL,
} from "@/constants/fees"
import { formatDisplayDate, formatMonthLabel } from "@/utils/date"
import { formatCurrency, formatFullName } from "@/utils/format"

const DIGITS = "0123456789"

// Reminders go to the parent's WhatsApp number, and only while something is still owed.
export const canSendPaymentReminder = (fee: FeeRecord): boolean => {
  return (
    fee.status !== PAYMENT_STATUSES.PAID && fee.outstandingAmount > 0 && fee.student.parentPhone.trim() !== ""
  )
}

// wa.me needs the international number as digits only: "+91 98765 43210" / "09876543210" / "9876543210"
// → "919876543210". Numbers saved without a country code are Indian.
export const toWhatsAppNumber = (phone: string): string => {
  const digits = whitelist(phone, DIGITS)
  if (digits.length === LOCAL_MOBILE_NUMBER_LENGTH) {
    return `${DEFAULT_PHONE_COUNTRY_CODE}${digits}`
  }
  if (digits.length === LOCAL_MOBILE_NUMBER_LENGTH + 1 && digits.startsWith("0")) {
    return `${DEFAULT_PHONE_COUNTRY_CODE}${digits.slice(1)}`
  }
  return digits
}

// What the reminder is about. When something has been paid, the message names the remaining
// balance (not the full fee) so a partly paid parent isn't asked for the whole amount again.
const getReminderSubject = (fee: FeeRecord): string => {
  const outstanding = formatCurrency(fee.outstandingAmount)
  if (fee.paidAmount > 0) {
    return `the remaining balance of ${outstanding}`
  }
  return fee.status === PAYMENT_STATUSES.OVERDUE ? "the overdue payment" : "the pending payment"
}

// The WhatsApp message, built from the latest saved fee details.
export const buildPaymentReminderMessage = (fee: FeeRecord, instituteName: string): string => {
  const studentName = formatFullName(fee.student.firstName, fee.student.lastName)

  return [
    `Hello ${fee.student.parentName},`,
    "",
    `This is a friendly reminder regarding ${getReminderSubject(fee)} for ${studentName} (Student ID: ${fee.student.studentCode}) for ${formatMonthLabel(fee.month)}.`,
    "",
    `Due Date: ${formatDisplayDate(fee.dueDate)}`,
    `Total Fee: ${formatCurrency(fee.totalFee)}`,
    `Amount Paid: ${formatCurrency(fee.paidAmount)}`,
    `Outstanding Amount: ${formatCurrency(fee.outstandingAmount)}`,
    "",
    "Kindly arrange the remaining payment at your earliest convenience.",
    "",
    "Thank you,",
    instituteName,
  ].join("\n")
}

// Click-to-chat link: opens WhatsApp (or WhatsApp Business) with the number and message filled in.
// Nothing is sent until the admin presses Send in WhatsApp.
export const buildWhatsAppChatUrl = (phone: string, message: string): string => {
  return `${WHATSAPP_CHAT_BASE_URL}${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`
}
