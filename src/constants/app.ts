export const APP_NAME = "TutorDesk"

export const DEFAULT_API_BASE_URL = "http://localhost:5000/api"

// Requests taking longer than this fail with the timeout message.
export const REQUEST_TIMEOUT_MS = 30000

// Toasts appear at the top centre and close on their own after 5 seconds.
export const TOAST_POSITION = "top-center"
export const TOAST_DURATION_MS = 5000
// Fixed id so the "session expired" toast shows only once.
export const SESSION_EXPIRED_TOAST_ID = "session-expired"

// Must match SIDEBAR_COOKIE_NAME in src/components/ui/sidebar.tsx (generated file).
export const SIDEBAR_STATE_COOKIE_NAME = "sidebar_state"

// Demo mode without a BE (VITE_USE_MOCK_API=true), also on the deployed site until the BE is ready.
export const IS_MOCK_API_ENABLED = import.meta.env.VITE_USE_MOCK_API === "true"
