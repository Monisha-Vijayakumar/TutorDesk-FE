import { API_ENDPOINTS } from "@/api/apiEndpoints"
import type {
  CreateStudentPayload,
  Student,
  StudentListParams,
  StudentListResponse,
  StudentResponse,
  StudentService,
  UpdateStudentPayload,
} from "@/api/interfaces/student"
import { mockStudentService } from "@/api/mocks/mockStudentService"
import { IS_MOCK_API_ENABLED } from "@/constants/app"
import { api } from "./apiClient"

// signal cancels the request when the list it was for is no longer needed (filters changed, page left).
const getStudents = async (params: StudentListParams, signal?: AbortSignal): Promise<StudentListResponse> => {
  const response = await api.get<StudentListResponse>(API_ENDPOINTS.STUDENTS.LIST, { params, signal })
  return response.data
}

const createStudent = async (payload: CreateStudentPayload): Promise<Student> => {
  const response = await api.post<StudentResponse>(API_ENDPOINTS.STUDENTS.LIST, payload)
  return response.data.student
}

const updateStudent = async (studentId: string, payload: UpdateStudentPayload): Promise<Student> => {
  const response = await api.patch<StudentResponse>(API_ENDPOINTS.STUDENTS.DETAILS(studentId), payload)
  return response.data.student
}

// Soft delete in the BE (the record stays, the student disappears from lists and can't log in).
const deleteStudent = async (studentId: string): Promise<void> => {
  await api.delete(API_ENDPOINTS.STUDENTS.DETAILS(studentId))
}

const realStudentService: StudentService = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
}

// In-memory demo students in dev until tutordesk-be is ready (VITE_USE_MOCK_API=true).
export const studentService: StudentService = IS_MOCK_API_ENABLED ? mockStudentService : realStudentService
