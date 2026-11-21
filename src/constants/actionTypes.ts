// Names for Redux slices and async actions (shown in Redux DevTools).
// These are not API URLs — those live in @/api/apiEndpoints.

export const AUTH_SLICE_NAME = "auth"

export const AUTH_ACTION_TYPES = {
  FETCH_CURRENT_USER: `${AUTH_SLICE_NAME}/fetchCurrentUser`,
  LOGIN: `${AUTH_SLICE_NAME}/login`,
  LOGOUT: `${AUTH_SLICE_NAME}/logout`,
  UPDATE_PROFILE: `${AUTH_SLICE_NAME}/updateProfile`,
  CHANGE_PASSWORD: `${AUTH_SLICE_NAME}/changePassword`,
} as const

export const STUDENT_SLICE_NAME = "students"

export const STUDENT_ACTION_TYPES = {
  FETCH_STUDENTS: `${STUDENT_SLICE_NAME}/fetchStudents`,
  CREATE_STUDENT: `${STUDENT_SLICE_NAME}/createStudent`,
  UPDATE_STUDENT: `${STUDENT_SLICE_NAME}/updateStudent`,
  DELETE_STUDENT: `${STUDENT_SLICE_NAME}/deleteStudent`,
  // Students to pick from in other forms (e.g. assigning students to a batch).
  FETCH_STUDENT_OPTIONS: `${STUDENT_SLICE_NAME}/fetchStudentOptions`,
} as const

export const BATCH_SLICE_NAME = "batches"

export const BATCH_ACTION_TYPES = {
  FETCH_BATCHES: `${BATCH_SLICE_NAME}/fetchBatches`,
  FETCH_BATCH_TIME_SLOTS: `${BATCH_SLICE_NAME}/fetchBatchTimeSlots`,
  FETCH_BATCH_DETAILS: `${BATCH_SLICE_NAME}/fetchBatchDetails`,
  CREATE_BATCH: `${BATCH_SLICE_NAME}/createBatch`,
  UPDATE_BATCH: `${BATCH_SLICE_NAME}/updateBatch`,
  DELETE_BATCH: `${BATCH_SLICE_NAME}/deleteBatch`,
} as const

export const DASHBOARD_SLICE_NAME = "dashboard"

export const DASHBOARD_ACTION_TYPES = {
  FETCH_DASHBOARD_STATS: `${DASHBOARD_SLICE_NAME}/fetchDashboardStats`,
  FETCH_FEE_COLLECTION: `${DASHBOARD_SLICE_NAME}/fetchFeeCollection`,
} as const

export const FEE_SLICE_NAME = "fees"

export const FEE_ACTION_TYPES = {
  FETCH_FEES: `${FEE_SLICE_NAME}/fetchFees`,
  UPDATE_FEE: `${FEE_SLICE_NAME}/updateFee`,
  FETCH_PAYMENT_HISTORY: `${FEE_SLICE_NAME}/fetchPaymentHistory`,
  CREATE_FEE_REMINDER: `${FEE_SLICE_NAME}/createFeeReminder`,
} as const
