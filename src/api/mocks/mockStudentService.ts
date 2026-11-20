import type {
  CreateStudentPayload,
  Student,
  StudentListParams,
  StudentListResponse,
  StudentService,
  UpdateStudentPayload,
} from "@/api/interfaces/student"
import { waitForMockDelay } from "./mockDelay"
import { createMockStudent, deleteMockStudent, listMockStudents, updateMockStudent } from "./mockStudentData"

// DEV ONLY — answers student requests from in-memory data while tutordesk-be isn't ready.
// Picked in studentService.ts when IS_MOCK_API_ENABLED is true. Errors are thrown like axios errors.

const getStudents = async (params: StudentListParams): Promise<StudentListResponse> => {
  await waitForMockDelay()
  return listMockStudents(params)
}

const createStudent = async (payload: CreateStudentPayload): Promise<Student> => {
  await waitForMockDelay()
  return createMockStudent(payload)
}

const updateStudent = async (studentId: string, payload: UpdateStudentPayload): Promise<Student> => {
  await waitForMockDelay()
  return updateMockStudent(studentId, payload)
}

const deleteStudent = async (studentId: string): Promise<void> => {
  await waitForMockDelay()
  deleteMockStudent(studentId)
}

export const mockStudentService: StudentService = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
}
