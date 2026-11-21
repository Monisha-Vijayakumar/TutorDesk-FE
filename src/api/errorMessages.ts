export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",

  // Common HTTP errors, used by getApiError when the BE doesn't send a message that can be shown.
  BAD_REQUEST: "Invalid request. Please check the submitted information.",
  SESSION_EXPIRED: "Your session has expired. Please log in again.",
  FORBIDDEN: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested information could not be found.",
  CONFLICT: "This operation conflicts with existing information.",
  UNPROCESSABLE_ENTITY: "Please check the submitted information and try again.",
  SERVER_ERROR: "Something went wrong on the server. Please try again later.",
  BAD_GATEWAY: "The server is temporarily unavailable. Please try again.",
  SERVICE_UNAVAILABLE: "The service is currently unavailable. Please try again later.",
  NETWORK: "Unable to connect to the server. Please check your internet connection.",
  TIMEOUT: "The request timed out. Please try again.",

  // Fallbacks for one action, used when the error has no status-specific message.
  LOGIN_FAILED: "Invalid email or password.",
  PROFILE_UPDATE_FAILED: "Couldn't update your profile. Please try again.",
  PASSWORD_CHANGE_FAILED: "Couldn't update your password. Please try again.",
  STUDENTS_LOAD_FAILED: "Couldn't load students. Please try again.",
  STUDENT_CREATE_FAILED: "Couldn't add the student. Please try again.",
  STUDENT_UPDATE_FAILED: "Couldn't update the student. Please try again.",
  STUDENT_DELETE_FAILED: "Couldn't delete the student. Please try again.",
  // 404 on a student action: someone else deleted the student while this form/dialog was open.
  STUDENT_NOT_FOUND: "This student was already deleted. The list has been refreshed.",
  FEES_LOAD_FAILED: "Couldn't load fees. Please try again.",
  DASHBOARD_LOAD_FAILED: "Couldn't load the dashboard. Please try again.",
  FEE_COLLECTION_LOAD_FAILED: "Couldn't load the fee collection. Please try again.",
  FEE_UPDATE_FAILED: "Couldn't save the payment details. Please try again.",
  FEE_NOT_FOUND: "This student was deleted. The list has been refreshed.",
  PAYMENT_HISTORY_LOAD_FAILED: "Couldn't load the payment history.",
  // WhatsApp still opened; only saving the reminder record failed.
  REMINDER_RECORD_FAILED: "WhatsApp opened, but the reminder couldn't be saved in the history.",
  BATCHES_LOAD_FAILED: "Couldn't load batches. Please try again.",
  BATCH_LOAD_FAILED: "Couldn't load the batch details. Please try again.",
  BATCH_CREATE_FAILED: "Couldn't add the batch. Please try again.",
  BATCH_UPDATE_FAILED: "Couldn't update the batch. Please try again.",
  BATCH_DELETE_FAILED: "Couldn't delete the batch. Please try again.",
  // 404 on a batch action: someone else deleted the batch while it was open here.
  BATCH_NOT_FOUND: "This batch was already deleted. The list has been refreshed.",
  STUDENT_OPTIONS_LOAD_FAILED: "Couldn't load students. Please try again.",
} as const
