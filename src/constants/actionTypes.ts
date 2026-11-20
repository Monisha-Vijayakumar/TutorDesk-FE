// Names for Redux slices and async actions (shown in Redux DevTools).
// These are not API URLs — those live in @/api/apiEndpoints.

export const AUTH_SLICE_NAME = "auth"

export const AUTH_ACTION_TYPES = {
  FETCH_CURRENT_USER: `${AUTH_SLICE_NAME}/fetchCurrentUser`,
  LOGIN: `${AUTH_SLICE_NAME}/login`,
  LOGOUT: `${AUTH_SLICE_NAME}/logout`,
} as const

export const STUDENT_SLICE_NAME = "students"

export const STUDENT_ACTION_TYPES = {
  FETCH_STUDENTS: `${STUDENT_SLICE_NAME}/fetchStudents`,
  CREATE_STUDENT: `${STUDENT_SLICE_NAME}/createStudent`,
  UPDATE_STUDENT: `${STUDENT_SLICE_NAME}/updateStudent`,
  DELETE_STUDENT: `${STUDENT_SLICE_NAME}/deleteStudent`,
} as const

export const FEE_SLICE_NAME = "fees"

export const FEE_ACTION_TYPES = {
  FETCH_FEES: `${FEE_SLICE_NAME}/fetchFees`,
  UPDATE_FEE: `${FEE_SLICE_NAME}/updateFee`,
  FETCH_PAYMENT_HISTORY: `${FEE_SLICE_NAME}/fetchPaymentHistory`,
  CREATE_FEE_REMINDER: `${FEE_SLICE_NAME}/createFeeReminder`,
} as const
