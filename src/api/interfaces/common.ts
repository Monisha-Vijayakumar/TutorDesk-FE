// Shapes shared by all API calls.

// One field-level validation error, when the BE sends them as a list.
export interface ApiFieldError {
  field: string
  message: string
}

// Error body the BE is expected to send (agree the final shape with tutordesk-be).
export interface ApiErrorResponse {
  message?: string
  // Field-level validation errors (400 / 422): { email: "..." } or [{ field: "email", message: "..." }].
  errors?: Record<string, string> | ApiFieldError[]
}

// What every failed request becomes (getApiError), and what every thunk rejects with.
export interface ApiError {
  status: number | null // null when there was no HTTP response (network error, timeout)
  message: string // safe to show in a toast
  fieldErrors: Record<string, string> // field name → message, when the BE reports them
}
