import type {
  Batch,
  BatchListParams,
  BatchListResponse,
  BatchService,
  BatchTimeSlot,
  CreateBatchPayload,
  UpdateBatchPayload,
} from "@/api/interfaces/batch"
import {
  createMockBatch,
  deleteMockBatch,
  getMockBatch,
  getMockBatchTimeSlots,
  listMockBatches,
  updateMockBatch,
} from "./mockBatchData"
import { waitForMockDelay } from "./mockDelay"
import { getCurrentMockStudents } from "./mockStudentData"

// DEV ONLY — answers batch requests from in-memory data while tutordesk-be isn't ready.
// Picked in batchService.ts when IS_MOCK_API_ENABLED is true. Errors are thrown like axios errors.

const getBatches = async (params: BatchListParams): Promise<BatchListResponse> => {
  await waitForMockDelay()
  return listMockBatches(params, getCurrentMockStudents())
}

const getBatchTimeSlots = async (): Promise<BatchTimeSlot[]> => {
  await waitForMockDelay()
  return getMockBatchTimeSlots()
}

const getBatch = async (batchId: string): Promise<Batch> => {
  await waitForMockDelay()
  return getMockBatch(batchId, getCurrentMockStudents())
}

const createBatch = async (payload: CreateBatchPayload): Promise<Batch> => {
  await waitForMockDelay()
  return createMockBatch(payload, getCurrentMockStudents())
}

const updateBatch = async (batchId: string, payload: UpdateBatchPayload): Promise<Batch> => {
  await waitForMockDelay()
  return updateMockBatch(batchId, payload, getCurrentMockStudents())
}

const deleteBatch = async (batchId: string): Promise<void> => {
  await waitForMockDelay()
  deleteMockBatch(batchId)
}

export const mockBatchService: BatchService = {
  getBatches,
  getBatchTimeSlots,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
}
