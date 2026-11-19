// Names for Redux slices and async actions (shown in Redux DevTools).
// These are not API URLs — those live in @/api/apiEndpoints.

export const AUTH_SLICE_NAME = "auth"

export const AUTH_ACTION_TYPES = {
  FETCH_CURRENT_USER: `${AUTH_SLICE_NAME}/fetchCurrentUser`,
  LOGIN: `${AUTH_SLICE_NAME}/login`,
  LOGOUT: `${AUTH_SLICE_NAME}/logout`,
} as const
