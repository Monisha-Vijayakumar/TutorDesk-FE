// Times are "HH:mm" (24-hour). A batch has both a start and an end time, or neither.
export interface BatchTimeSlot {
  startTime: string
  endTime: string
}

// One row of the batch list.
export interface BatchSummary {
  id: string
  name: string
  description: string | null
  startTime: string | null
  endTime: string | null
  studentCount: number // assigned current students (deleted students aren't counted)
  createdAt: string
}

// A current student assigned to a batch. Deleted students are never returned.
export interface BatchStudent {
  id: string
  studentCode: string
  firstName: string
  lastName: string
}

export interface Batch extends BatchSummary {
  students: BatchStudent[]
}

// Query string for GET /batches. page is 1-based. startTime and endTime are sent together.
export interface BatchListParams {
  search?: string // batch name, or Student ID / name of an assigned student; partial and case-insensitive
  startTime?: string
  endTime?: string
  page: number
  limit: number
}

export interface BatchListResponse {
  batches: BatchSummary[]
  total: number // matching batches across all pages
}

export interface BatchTimeSlotsResponse {
  timeSlots: BatchTimeSlot[]
}

// Add and edit send every field. Empty optional fields are sent as null, which clears them on edit.
export interface BatchPayload {
  name: string
  description: string | null
  startTime: string | null
  endTime: string | null
  studentIds: string[] // no duplicates; may be empty
}

export type CreateBatchPayload = BatchPayload

export type UpdateBatchPayload = BatchPayload

export interface UpdateBatchRequest {
  batchId: string
  payload: UpdateBatchPayload
}

// Response of GET /batches/:id, POST /batches and PATCH /batches/:id.
export interface BatchResponse {
  batch: Batch
}

// What every batch service (real API or dev mock) must provide.
export interface BatchService {
  getBatches: (params: BatchListParams, signal?: AbortSignal) => Promise<BatchListResponse>
  getBatchTimeSlots: (signal?: AbortSignal) => Promise<BatchTimeSlot[]>
  getBatch: (batchId: string, signal?: AbortSignal) => Promise<Batch>
  createBatch: (payload: CreateBatchPayload) => Promise<Batch>
  updateBatch: (batchId: string, payload: UpdateBatchPayload) => Promise<Batch>
  deleteBatch: (batchId: string) => Promise<void>
}

// DEV mock storage only: the BE keeps the assigned students as a list of student ids on the batch.
export interface MockBatchRecord extends Omit<BatchSummary, "studentCount"> {
  studentIds: string[]
}
