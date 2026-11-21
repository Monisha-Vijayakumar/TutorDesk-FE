import type {
  Batch,
  BatchListParams,
  BatchListResponse,
  BatchPayload,
  BatchStudent,
  BatchSummary,
  BatchTimeSlot,
  MockBatchRecord,
} from "@/api/interfaces/batch"
import type { BatchStudentCount } from "@/api/interfaces/dashboard"
import type { MockStudentRecord } from "@/api/interfaces/student"
import { HTTP_STATUS } from "@/api/httpStatus"
import { BATCH_TIME_SLOT_SEPARATOR } from "@/constants/batches"
import { createMockApiError } from "./mockApiError"

// DEV ONLY — in-memory batches while tutordesk-be isn't ready (VITE_USE_MOCK_API=true).
// Fake demo records; data resets on page reload. Mirrors what the BE is expected to do: hard delete,
// only current (not deleted) students are returned or can be assigned, a student may be in several batches.

const SEED_BATCH_NAMES = [
  "Class 10 Maths",
  "Class 12 Physics",
  "Class 9 Science",
  "Spoken English",
  "Class 11 Chemistry",
  "Class 8 Maths",
  "Weekend Revision",
  "Class 12 Accountancy",
  "Class 7 Science",
  "Board Exam Crash Course",
  "Class 6 English",
  "Class 10 Science",
  "Evening Doubt Clearing",
]
// The last entry leaves the batch without a time, which is valid.
const SEED_TIME_SLOTS: (BatchTimeSlot | null)[] = [
  { startTime: "09:00", endTime: "10:00" },
  { startTime: "16:00", endTime: "17:30" },
  { startTime: "18:00", endTime: "19:00" },
  null,
]
const SEED_STUDENT_COUNT = 28
const MAX_SEED_STUDENTS_PER_BATCH = 5

const createSeedBatch = (name: string, index: number): MockBatchRecord => {
  const timeSlot = SEED_TIME_SLOTS[index % SEED_TIME_SLOTS.length]
  // 0–4 students per batch; overlapping on purpose, as a student can be in more than one batch.
  const studentIds = Array.from(
    { length: index % MAX_SEED_STUDENTS_PER_BATCH },
    (_, position) => `mock-student-${((index * 3 + position) % SEED_STUDENT_COUNT) + 1}`
  )

  return {
    id: `mock-batch-${index + 1}`,
    name,
    description: index % 3 === 0 ? null : `Regular ${name} sessions for enrolled students.`,
    startTime: timeSlot?.startTime ?? null,
    endTime: timeSlot?.endTime ?? null,
    studentIds,
    // Older batches first in the seed, so the list (newest first) starts with the last one.
    createdAt: new Date(Date.UTC(2026, 6, 1, 0, index)).toISOString(),
  }
}

// Created on first use rather than at import time, so nothing runs in builds that don't use the mock.
let mockBatches: MockBatchRecord[] | null = null

const getMockBatches = (): MockBatchRecord[] => {
  mockBatches ??= SEED_BATCH_NAMES.map(createSeedBatch)
  return mockBatches
}

const findMockBatchIndex = (batchId: string): number => {
  const batchIndex = getMockBatches().findIndex((batch) => batch.id === batchId)
  if (batchIndex === -1) {
    throw createMockApiError(HTTP_STATUS.NOT_FOUND, "Batch not found.")
  }
  return batchIndex
}


// Assigned students that still exist; a deleted student drops out of every batch.
const getBatchStudents = (record: MockBatchRecord, currentStudents: MockStudentRecord[]): BatchStudent[] => {
  return currentStudents
    .filter((student) => record.studentIds.includes(student.id))
    .map((student) => ({
      id: student.id,
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
    }))
}

const toBatch = (record: MockBatchRecord, currentStudents: MockStudentRecord[]): Batch => {
  const students = getBatchStudents(record, currentStudents)
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    startTime: record.startTime,
    endTime: record.endTime,
    studentCount: students.length,
    createdAt: record.createdAt,
    students,
  }
}

// Only the list fields (drops the students).
const toBatchSummary = (batch: Batch): BatchSummary => {
  return {
    id: batch.id,
    name: batch.name,
    description: batch.description,
    startTime: batch.startTime,
    endTime: batch.endTime,
    studentCount: batch.studentCount,
    createdAt: batch.createdAt,
  }
}

const matchesBatchSearch = (batch: Batch, search: string): boolean => {
  const searchText = search.toLowerCase()
  if (batch.name.toLowerCase().includes(searchText)) {
    return true
  }
  return batch.students.some((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
    return student.studentCode.toLowerCase().includes(searchText) || fullName.includes(searchText)
  })
}

const matchesTimeSlot = (batch: Batch, params: BatchListParams): boolean => {
  if (!params.startTime || !params.endTime) {
    return true
  }
  return batch.startTime === params.startTime && batch.endTime === params.endTime
}

export const listMockBatches = (params: BatchListParams, currentStudents: MockStudentRecord[]): BatchListResponse => {
  const matchingBatches = getMockBatches()
    .map((record) => toBatch(record, currentStudents))
    .filter((batch) => !params.search || matchesBatchSearch(batch, params.search))
    .filter((batch) => matchesTimeSlot(batch, params))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))

  const firstIndex = (params.page - 1) * params.limit
  return {
    batches: matchingBatches.slice(firstIndex, firstIndex + params.limit).map(toBatchSummary),
    total: matchingBatches.length,
  }
}

// Dashboard: every batch with its number of current students, most students first.
export const getMockBatchStudentCounts = (currentStudents: MockStudentRecord[]): BatchStudentCount[] => {
  return getMockBatches()
    .map((record) => toBatch(record, currentStudents))
    .map((batch) => ({ batchId: batch.id, name: batch.name, studentCount: batch.studentCount }))
    .sort((first, second) => second.studentCount - first.studentCount || first.name.localeCompare(second.name))
}

// Distinct time slots in use, earliest first. Batches without a time aren't included.
export const getMockBatchTimeSlots = (): BatchTimeSlot[] => {
  const timeSlotsByValue = new Map<string, BatchTimeSlot>()
  for (const batch of getMockBatches()) {
    if (batch.startTime && batch.endTime) {
      const value = `${batch.startTime}${BATCH_TIME_SLOT_SEPARATOR}${batch.endTime}`
      timeSlotsByValue.set(value, { startTime: batch.startTime, endTime: batch.endTime })
    }
  }
  return [...timeSlotsByValue.entries()]
    .sort(([firstValue], [secondValue]) => firstValue.localeCompare(secondValue))
    .map(([, timeSlot]) => timeSlot)
}

export const getMockBatch = (batchId: string, currentStudents: MockStudentRecord[]): Batch => {
  return toBatch(getMockBatches()[findMockBatchIndex(batchId)], currentStudents)
}

// Only current students can be assigned (one may have been deleted while the form was open).
const assertStudentsExist = (studentIds: string[], currentStudents: MockStudentRecord[]): void => {
  const currentStudentIds = new Set(currentStudents.map((student) => student.id))
  if (studentIds.some((studentId) => !currentStudentIds.has(studentId))) {
    throw createMockApiError(HTTP_STATUS.BAD_REQUEST, "One or more selected students no longer exist.")
  }
}

const getBatchDetails = (payload: BatchPayload): Omit<MockBatchRecord, "id" | "createdAt"> => {
  return {
    name: payload.name,
    description: payload.description,
    startTime: payload.startTime,
    endTime: payload.endTime,
    studentIds: [...new Set(payload.studentIds)],
  }
}

export const createMockBatch = (payload: BatchPayload, currentStudents: MockStudentRecord[]): Batch => {
  assertStudentsExist(payload.studentIds, currentStudents)

  const batch: MockBatchRecord = {
    ...getBatchDetails(payload),
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  getMockBatches().push(batch)
  return toBatch(batch, currentStudents)
}

// Records handed to Redux get frozen in the store, so changes always replace the record.
export const updateMockBatch = (batchId: string, payload: BatchPayload, currentStudents: MockStudentRecord[]): Batch => {
  const batchIndex = findMockBatchIndex(batchId)
  assertStudentsExist(payload.studentIds, currentStudents)

  const batches = getMockBatches()
  batches[batchIndex] = { ...batches[batchIndex], ...getBatchDetails(payload) }
  return toBatch(batches[batchIndex], currentStudents)
}

// Hard delete: the batch and its assignments are gone; the students stay as they are.
export const deleteMockBatch = (batchId: string): void => {
  getMockBatches().splice(findMockBatchIndex(batchId), 1)
}
