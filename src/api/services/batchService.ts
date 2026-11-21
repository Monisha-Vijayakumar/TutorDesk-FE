import { API_ENDPOINTS } from "@/api/apiEndpoints"
import type {
  Batch,
  BatchListParams,
  BatchListResponse,
  BatchResponse,
  BatchService,
  BatchTimeSlot,
  BatchTimeSlotsResponse,
  CreateBatchPayload,
  UpdateBatchPayload,
} from "@/api/interfaces/batch"
import { mockBatchService } from "@/api/mocks/mockBatchService"
import { IS_MOCK_API_ENABLED } from "@/constants/app"
import { api } from "./apiClient"

// signal cancels the request when its result is no longer needed (filters changed, sheet closed).
const getBatches = async (params: BatchListParams, signal?: AbortSignal): Promise<BatchListResponse> => {
  const response = await api.get<BatchListResponse>(API_ENDPOINTS.BATCHES.LIST, { params, signal })
  return response.data
}

const getBatchTimeSlots = async (signal?: AbortSignal): Promise<BatchTimeSlot[]> => {
  const response = await api.get<BatchTimeSlotsResponse>(API_ENDPOINTS.BATCHES.TIME_SLOTS, { signal })
  return response.data.timeSlots
}

const getBatch = async (batchId: string, signal?: AbortSignal): Promise<Batch> => {
  const response = await api.get<BatchResponse>(API_ENDPOINTS.BATCHES.DETAILS(batchId), { signal })
  return response.data.batch
}

const createBatch = async (payload: CreateBatchPayload): Promise<Batch> => {
  const response = await api.post<BatchResponse>(API_ENDPOINTS.BATCHES.LIST, payload)
  return response.data.batch
}

const updateBatch = async (batchId: string, payload: UpdateBatchPayload): Promise<Batch> => {
  const response = await api.patch<BatchResponse>(API_ENDPOINTS.BATCHES.DETAILS(batchId), payload)
  return response.data.batch
}

// Hard delete in the BE: the batch and its student assignments are removed; students are not touched.
const deleteBatch = async (batchId: string): Promise<void> => {
  await api.delete(API_ENDPOINTS.BATCHES.DETAILS(batchId))
}

const realBatchService: BatchService = {
  getBatches,
  getBatchTimeSlots,
  getBatch,
  createBatch,
  updateBatch,
  deleteBatch,
}

// In-memory demo batches in dev until tutordesk-be is ready (VITE_USE_MOCK_API=true).
export const batchService: BatchService = IS_MOCK_API_ENABLED ? mockBatchService : realBatchService
