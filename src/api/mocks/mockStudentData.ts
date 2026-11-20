import type {
  CreateStudentPayload,
  MockStudentRecord,
  Student,
  StudentDetailsPayload,
  StudentListParams,
  StudentListResponse,
  UpdateStudentPayload,
} from "@/api/interfaces/student"
import { HTTP_STATUS } from "@/api/httpStatus"
import { PAISE_PER_RUPEE } from "@/constants/fees"
import { STUDENT_CODE_PREFIX } from "@/constants/validation"
import { createMockApiError } from "./mockApiError"
import { getMockCurrentPaymentSummary } from "./mockFeeData"

// DEV ONLY — in-memory students while tutordesk-be isn't ready (VITE_USE_MOCK_API=true).
// Fake demo records; data resets on page reload. Mirrors what the BE is expected to do:
// generate Student IDs, reject duplicate emails, and soft-delete (deleted students stay stored but are
// never listed, edited or deleted again). Each student's current payment comes from the fee mock.

const FIRST_NAMES = ["Aarav", "Diya", "Vihaan", "Ananya", "Arjun", "Ishita", "Kabir", "Meera", "Rohan", "Saanvi"]
const LAST_NAMES = ["Sharma", "Iyer", "Patel", "Nair", "Reddy", "Gupta", "Menon"]
const SEED_SUBJECTS = [["Mathematics"], ["Physics", "Chemistry"], ["Mathematics", "Science", "English"], ["Biology"]]
const SEED_STUDENT_COUNT = 28
const FIRST_STUDENT_NUMBER = 100000001

const createSeedStudent = (index: number): MockStudentRecord => {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length]
  const lastName = LAST_NAMES[index % LAST_NAMES.length]
  const hasEmail = index % 3 !== 0
  const parentPhone = `+9191234${String(56780 + index).padStart(5, "0")}`
  // Some students have no phone of their own, so the parent's number is saved for them.
  const hasOwnPhone = index % 4 !== 0

  return {
    id: `mock-student-${index + 1}`,
    studentCode: `${STUDENT_CODE_PREFIX}${FIRST_STUDENT_NUMBER + index}`,
    firstName,
    lastName,
    email: hasEmail ? `${firstName}.${lastName}${index + 1}@example.com`.toLowerCase() : null,
    phone: hasOwnPhone ? `+9198765${String(43210 + index).padStart(5, "0")}` : parentPhone,
    parentName: `${FIRST_NAMES[(index + 3) % FIRST_NAMES.length]} ${lastName}`,
    parentPhone,
    grade: `Class ${(index % 12) + 1}`,
    subjects: SEED_SUBJECTS[index % SEED_SUBJECTS.length],
    monthlyFee: (1500 + (index % 4) * 500) * PAISE_PER_RUPEE,
    joinDate: "2026-06-01",
    // Older students first in the seed, so the list (newest first) starts with the last one.
    createdAt: new Date(Date.UTC(2026, 5, 1, 0, index)).toISOString(),
    deletedAt: null,
  }
}

// Created on first use rather than at import time, so nothing runs in builds that don't use the mock.
let mockStudents: MockStudentRecord[] | null = null
let nextStudentNumber = FIRST_STUDENT_NUMBER + SEED_STUDENT_COUNT

const getMockStudents = (): MockStudentRecord[] => {
  mockStudents ??= Array.from({ length: SEED_STUDENT_COUNT }, (_, index) => createSeedStudent(index))
  return mockStudents
}

// Only students that haven't been deleted are visible to the API.
export const getCurrentMockStudents = (): MockStudentRecord[] => {
  return getMockStudents().filter((student) => student.deletedAt === null)
}

// Emails only have to be unique among current students, so a deleted student's email can be reused.
const assertEmailIsFree = (email: string | null, excludedStudentId?: string): void => {
  if (!email) {
    return
  }

  const isTaken = getCurrentMockStudents().some(
    (student) => student.email === email && student.id !== excludedStudentId
  )
  if (isTaken) {
    throw createMockApiError(HTTP_STATUS.CONFLICT, "A student with this email already exists.")
  }
}

// Position of a current student in the store. A deleted student counts as not found,
// so it can't be edited or deleted again.
const findCurrentMockStudentIndex = (studentId: string): number => {
  const studentIndex = getMockStudents().findIndex(
    (student) => student.id === studentId && student.deletedAt === null
  )
  if (studentIndex === -1) {
    throw createMockApiError(HTTP_STATUS.NOT_FOUND, "Student not found.")
  }
  return studentIndex
}

// Records handed to Redux get frozen in the store, so changes always replace the record.
const replaceMockStudent = (studentIndex: number, changes: Partial<MockStudentRecord>): MockStudentRecord => {
  const students = getMockStudents()
  students[studentIndex] = { ...students[studentIndex], ...changes }
  return students[studentIndex]
}

// The API shape: adds this month's payment summary, worked out from the fee records.
const toStudent = (record: MockStudentRecord): Student => {
  return { ...record, currentPayment: getMockCurrentPaymentSummary(record) }
}

const matchesStudentSearch = (student: Student, search: string): boolean => {
  const searchText = search.toLowerCase()
  const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
  return student.studentCode.toLowerCase().includes(searchText) || fullName.includes(searchText)
}

// "YYYY-MM-DD" strings sort the same way as the dates they represent.
const matchesPaymentDateRange = (paidOn: string | null, paidFrom?: string, paidTo?: string): boolean => {
  if (!paidFrom && !paidTo) {
    return true
  }
  if (!paidOn) {
    return false
  }
  return (!paidFrom || paidOn >= paidFrom) && (!paidTo || paidOn <= paidTo)
}

export const listMockStudents = (params: StudentListParams): StudentListResponse => {
  const matchingStudents = getCurrentMockStudents()
    .map(toStudent)
    .filter((student) => !params.search || matchesStudentSearch(student, params.search))
    .filter((student) => !params.paymentStatus || student.currentPayment.status === params.paymentStatus)
    .filter((student) => matchesPaymentDateRange(student.currentPayment.paidOn, params.paidFrom, params.paidTo))
    .sort((first, second) => second.createdAt.localeCompare(first.createdAt))

  const firstIndex = (params.page - 1) * params.limit
  return {
    students: matchingStudents.slice(firstIndex, firstIndex + params.limit),
    total: matchingStudents.length,
  }
}

// The editable fields of a student, from an add or edit request (the add request's password isn't stored).
const getStudentDetails = (payload: StudentDetailsPayload): StudentDetailsPayload => {
  return {
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    parentName: payload.parentName,
    parentPhone: payload.parentPhone,
    grade: payload.grade,
    subjects: payload.subjects,
    monthlyFee: payload.monthlyFee,
    joinDate: payload.joinDate,
  }
}

export const createMockStudent = (payload: CreateStudentPayload): Student => {
  assertEmailIsFree(payload.email)

  // The real BE hashes and stores payload.password; the mock doesn't keep it.
  const student: MockStudentRecord = {
    ...getStudentDetails(payload),
    id: crypto.randomUUID(),
    studentCode: `${STUDENT_CODE_PREFIX}${nextStudentNumber}`,
    createdAt: new Date().toISOString(),
    deletedAt: null,
  }
  // Student IDs are never reused, even after a delete.
  nextStudentNumber += 1

  getMockStudents().push(student)
  return toStudent(student)
}

export const updateMockStudent = (studentId: string, payload: UpdateStudentPayload): Student => {
  const studentIndex = findCurrentMockStudentIndex(studentId)
  assertEmailIsFree(payload.email, studentId)

  return toStudent(replaceMockStudent(studentIndex, getStudentDetails(payload)))
}

// Soft delete: the record stays (payment and attendance history is kept) but disappears from the API.
export const deleteMockStudent = (studentId: string): void => {
  replaceMockStudent(findCurrentMockStudentIndex(studentId), { deletedAt: new Date().toISOString() })
}
