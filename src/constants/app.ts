export const APP_NAME = "TutorDesk"

export const DEFAULT_API_BASE_URL = "http://localhost:5000/api"

// Toasts appear at the top centre and close on their own after 5 seconds.
export const TOAST_POSITION = "top-center"
export const TOAST_DURATION_MS = 5000

// Demo login without a BE. Only possible in `npm run dev`; production builds always use the real API.
export const IS_MOCK_API_ENABLED = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === "true"
