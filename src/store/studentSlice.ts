import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getApiError } from "@/api/apiErrorHandler"
import { ERROR_MESSAGES } from "@/api/errorMessages"
import { HTTP_STATUS } from "@/api/httpStatus"
import type { ApiError } from "@/api/interfaces/common"
import type {
  CreateStudentPayload,
  Student,
  StudentListParams,
  StudentListResponse,
  UpdateStudentRequest,
} from "@/api/interfaces/student"
import { studentService } from "@/api/services/studentService"
import { STUDENT_ACTION_TYPES, STUDENT_SLICE_NAME } from "@/constants/actionTypes"
import type { StudentState } from "@/interfaces/students"
import { logoutUser } from "./authSlice"
import type { RootState } from "./index"

// A 404 on edit/delete means the student was deleted elsewhere meanwhile.
const STUDENT_NOT_FOUND_MESSAGES = { [HTTP_STATUS.NOT_FOUND]: ERROR_MESSAGES.STUDENT_NOT_FOUND }

const initialState: StudentState = {
  students: [],
  total: 0,
  hasLoadedList: false,
  isListLoading: false,
  listError: null,
  listRequestId: null,
  options: [],
  optionsTotal: 0,
  hasLoadedOptions: false,
  isOptionsLoading: false,
  optionsError: null,
  optionsRequestId: null,
}

// One page of students for the current search / filters. The page aborts it when the filters change
// or the page is left (signal cancels the HTTP request).
export const fetchStudents = createAsyncThunk<StudentListResponse, StudentListParams, { rejectValue: ApiError }>(
  STUDENT_ACTION_TYPES.FETCH_STUDENTS,
  async (params, { rejectWithValue, signal }) => {
    try {
      return await studentService.getStudents(params, signal)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.STUDENTS_LOAD_FAILED))
    }
  }
)

// Students to choose from in another form (e.g. the batch form), with the same request as the list.
// Stored apart from the list so the Students page keeps its own page and filters.
export const fetchStudentOptions = createAsyncThunk<StudentListResponse, StudentListParams, { rejectValue: ApiError }>(
  STUDENT_ACTION_TYPES.FETCH_STUDENT_OPTIONS,
  async (params, { rejectWithValue, signal }) => {
    try {
      return await studentService.getStudents(params, signal)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.STUDENT_OPTIONS_LOAD_FAILED))
    }
  }
)

// Create / update / delete don't change the stored list: the page reloads it afterwards, because the
// server decides order, filtering and paging.
export const createStudent = createAsyncThunk<Student, CreateStudentPayload, { rejectValue: ApiError }>(
  STUDENT_ACTION_TYPES.CREATE_STUDENT,
  async (payload, { rejectWithValue }) => {
    try {
      return await studentService.createStudent(payload)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.STUDENT_CREATE_FAILED))
    }
  }
)

export const updateStudent = createAsyncThunk<Student, UpdateStudentRequest, { rejectValue: ApiError }>(
  STUDENT_ACTION_TYPES.UPDATE_STUDENT,
  async ({ studentId, payload }, { rejectWithValue }) => {
    try {
      return await studentService.updateStudent(studentId, payload)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.STUDENT_UPDATE_FAILED, STUDENT_NOT_FOUND_MESSAGES))
    }
  }
)

export const deleteStudent = createAsyncThunk<void, string, { rejectValue: ApiError }>(
  STUDENT_ACTION_TYPES.DELETE_STUDENT,
  async (studentId, { rejectWithValue }) => {
    try {
      await studentService.deleteStudent(studentId)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.STUDENT_DELETE_FAILED, STUDENT_NOT_FOUND_MESSAGES))
    }
  }
)

const studentSlice = createSlice({
  name: STUDENT_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchStudents.pending, (state, action) => {
      state.isListLoading = true
      state.listError = null
      state.listRequestId = action.meta.requestId
    })

    builder.addCase(fetchStudents.fulfilled, (state, action) => {
      if (action.meta.requestId !== state.listRequestId) {
        return
      }
      state.students = action.payload.students
      state.total = action.payload.total
      state.hasLoadedList = true
      state.isListLoading = false
    })

    builder.addCase(fetchStudents.rejected, (state, action) => {
      if (action.meta.requestId !== state.listRequestId) {
        return
      }
      state.isListLoading = false
      // Aborted on purpose (page left): not an error.
      if (!action.meta.aborted) {
        state.listError = action.payload?.message ?? ERROR_MESSAGES.STUDENTS_LOAD_FAILED
      }
    })

    builder.addCase(fetchStudentOptions.pending, (state, action) => {
      state.isOptionsLoading = true
      state.optionsError = null
      state.optionsRequestId = action.meta.requestId
    })

    builder.addCase(fetchStudentOptions.fulfilled, (state, action) => {
      if (action.meta.requestId !== state.optionsRequestId) {
        return
      }
      state.options = action.payload.students
      state.optionsTotal = action.payload.total
      state.hasLoadedOptions = true
      state.isOptionsLoading = false
    })

    builder.addCase(fetchStudentOptions.rejected, (state, action) => {
      if (action.meta.requestId !== state.optionsRequestId) {
        return
      }
      state.isOptionsLoading = false
      if (!action.meta.aborted) {
        state.optionsError = action.payload?.message ?? ERROR_MESSAGES.STUDENT_OPTIONS_LOAD_FAILED
      }
    })

    // Don't keep one session's data for the next login.
    builder.addCase(logoutUser.fulfilled, () => initialState)
  },
})

export const selectStudents = (state: RootState): Student[] => state.students.students

export const selectStudentTotal = (state: RootState): number => state.students.total

export const selectHasLoadedStudentList = (state: RootState): boolean => state.students.hasLoadedList

export const selectIsStudentListLoading = (state: RootState): boolean => state.students.isListLoading

export const selectStudentListError = (state: RootState): string | null => state.students.listError

export const selectStudentOptions = (state: RootState): Student[] => state.students.options

export const selectStudentOptionsTotal = (state: RootState): number => state.students.optionsTotal

export const selectHasLoadedStudentOptions = (state: RootState): boolean => state.students.hasLoadedOptions

export const selectIsStudentOptionsLoading = (state: RootState): boolean => state.students.isOptionsLoading

export const selectStudentOptionsError = (state: RootState): string | null => state.students.optionsError

export default studentSlice.reducer
