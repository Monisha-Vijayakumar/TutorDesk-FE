import { API_ENDPOINTS } from "@/api/apiEndpoints"
import type {
  CreateReminderPayload,
  FeeListParams,
  FeeListResponse,
  FeeRecord,
  FeeResponse,
  FeeService,
  PaymentHistoryResponse,
  PaymentReminder,
  ReminderResponse,
  UpdateFeePayload,
} from "@/api/interfaces/fee"
import { mockFeeService } from "@/api/mocks/mockFeeService"
import { IS_MOCK_API_ENABLED } from "@/constants/app"
import { api } from "./apiClient"

// signal cancels the request when the list it was for is no longer needed (filters changed, page left).
const getFees = async (params: FeeListParams, signal?: AbortSignal): Promise<FeeListResponse> => {
  const response = await api.get<FeeListResponse>(API_ENDPOINTS.FEES.LIST, { params, signal })
  return response.data
}

// Saves the month's total fee and due date, plus a new payment when one was entered.
const updateFee = async (feeId: string, payload: UpdateFeePayload): Promise<FeeRecord> => {
  const response = await api.patch<FeeResponse>(API_ENDPOINTS.FEES.DETAILS(feeId), payload)
  return response.data.fee
}

// Payments and reminders of one student, all months.
const getPaymentHistory = async (studentId: string, signal?: AbortSignal): Promise<PaymentHistoryResponse> => {
  const response = await api.get<PaymentHistoryResponse>(API_ENDPOINTS.STUDENTS.PAYMENT_HISTORY(studentId), {
    signal,
  })
  return response.data
}

// Records that WhatsApp was opened with a reminder (stored as Initiated, never as sent).
const createFeeReminder = async (feeId: string, payload: CreateReminderPayload): Promise<PaymentReminder> => {
  const response = await api.post<ReminderResponse>(API_ENDPOINTS.FEES.REMINDERS(feeId), payload)
  return response.data.reminder
}

const realFeeService: FeeService = {
  getFees,
  updateFee,
  getPaymentHistory,
  createFeeReminder,
}

// In-memory demo fees in dev until tutordesk-be is ready (VITE_USE_MOCK_API=true).
export const feeService: FeeService = IS_MOCK_API_ENABLED ? mockFeeService : realFeeService
