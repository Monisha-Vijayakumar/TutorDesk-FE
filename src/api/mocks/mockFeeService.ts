import type {
  CreateReminderPayload,
  FeeListParams,
  FeeListResponse,
  FeeRecord,
  FeeService,
  PaymentHistoryResponse,
  PaymentReminder,
  UpdateFeePayload,
} from "@/api/interfaces/fee"
import { waitForMockDelay } from "./mockDelay"
import { createMockReminder, getMockPaymentHistory, listMockFees, updateMockFee } from "./mockFeeData"
import { getCurrentMockStudents } from "./mockStudentData"

// DEV ONLY — answers fee requests from in-memory data while tutordesk-be isn't ready.
// Picked in feeService.ts when IS_MOCK_API_ENABLED is true. Errors are thrown like axios errors.

const getFees = async (params: FeeListParams): Promise<FeeListResponse> => {
  await waitForMockDelay()
  return listMockFees(params, getCurrentMockStudents())
}

const updateFee = async (feeId: string, payload: UpdateFeePayload): Promise<FeeRecord> => {
  await waitForMockDelay()
  return updateMockFee(feeId, payload, getCurrentMockStudents())
}

const getPaymentHistory = async (studentId: string): Promise<PaymentHistoryResponse> => {
  await waitForMockDelay()
  return getMockPaymentHistory(studentId, getCurrentMockStudents())
}

const createFeeReminder = async (feeId: string, payload: CreateReminderPayload): Promise<PaymentReminder> => {
  await waitForMockDelay()
  return createMockReminder(feeId, payload, getCurrentMockStudents())
}

export const mockFeeService: FeeService = {
  getFees,
  updateFee,
  getPaymentHistory,
  createFeeReminder,
}
