import { createAsyncThunk, createSlice, isRejectedWithValue } from "@reduxjs/toolkit"
import { getApiError, hasApiErrorStatus } from "@/api/apiErrorHandler"
import { ERROR_MESSAGES } from "@/api/errorMessages"
import { HTTP_STATUS } from "@/api/httpStatus"
import type { LoginPayload, User } from "@/api/interfaces/auth"
import type { ApiError } from "@/api/interfaces/common"
import { authService } from "@/api/services/authService"
import { AUTH_ACTION_TYPES, AUTH_SLICE_NAME } from "@/constants/actionTypes"
import type { AuthState } from "@/interfaces/auth"
import type { RootState } from "./index"

const initialState: AuthState = {
  user: null,
  isSessionChecked: false,
  isSessionExpired: false,
}

// Called once when the app loads: asks the BE who is logged in (using the cookie).
export const fetchCurrentUser = createAsyncThunk<User, void, { rejectValue: ApiError }>(
  AUTH_ACTION_TYPES.FETCH_CURRENT_USER,
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getCurrentUser()
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  }
)

export const loginUser = createAsyncThunk<User, LoginPayload, { rejectValue: ApiError }>(
  AUTH_ACTION_TYPES.LOGIN,
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.login(payload)
    } catch (error) {
      // A 401 here means wrong credentials, not an expired session.
      return rejectWithValue(
        getApiError(error, ERROR_MESSAGES.LOGIN_FAILED, { [HTTP_STATUS.UNAUTHORIZED]: ERROR_MESSAGES.LOGIN_FAILED })
      )
    }
  }
)

export const logoutUser = createAsyncThunk(AUTH_ACTION_TYPES.LOGOUT, async () => {
  try {
    await authService.logout()
  } catch {
    // Ignore the error: we clear the user on our side either way.
  }
})

const authSlice = createSlice({
  name: AUTH_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Session check finished and someone is logged in.
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload
      state.isSessionChecked = true
    })

    // Session check finished and nobody is logged in (or the request failed).
    builder.addCase(fetchCurrentUser.rejected, (state) => {
      state.user = null
      state.isSessionChecked = true
    })

    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload
      state.isSessionExpired = false
    })

    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null
    })

    // Any request of any module answered 401 while logged in: the cookie has expired. Clearing the
    // user sends ProtectedRoute to the login page (which explains why), like a failed session check.
    builder.addMatcher(isRejectedWithValue(), (state, action) => {
      if (state.user && hasApiErrorStatus(action.payload, HTTP_STATUS.UNAUTHORIZED)) {
        state.user = null
        state.isSessionExpired = true
      }
    })
  },
})

export const selectCurrentUser = (state: RootState): User | null => state.auth.user

// False until the first session check on app load has finished.
// Route guards show a loader until then, so a logged-in user isn't sent to /login on refresh.
export const selectIsSessionChecked = (state: RootState): boolean => state.auth.isSessionChecked

// True after a 401 logged the user out, until they log in again.
export const selectIsSessionExpired = (state: RootState): boolean => state.auth.isSessionExpired

export default authSlice.reducer
