import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { ERROR_MESSAGES } from "@/api/errorMessages"
import type { LoginPayload, User } from "@/api/interfaces/auth"
import { getErrorMessage } from "@/api/services/apiClient"
import { authService } from "@/api/services/authService"
import { AUTH_ACTION_TYPES, AUTH_SLICE_NAME } from "@/constants/actionTypes"
import type { AuthState } from "@/interfaces/auth"
import type { RootState } from "./index"

const initialState: AuthState = {
  user: null,
  isSessionChecked: false,
}

// Called once when the app loads: asks the BE who is logged in (using the cookie).
export const fetchCurrentUser = createAsyncThunk<User>(AUTH_ACTION_TYPES.FETCH_CURRENT_USER, () =>
  authService.getCurrentUser()
)

export const loginUser = createAsyncThunk<User, LoginPayload, { rejectValue: string }>(
  AUTH_ACTION_TYPES.LOGIN,
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.login(payload)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, ERROR_MESSAGES.LOGIN_FAILED))
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
    })

    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null
    })
  },
})

export const selectCurrentUser = (state: RootState): User | null => state.auth.user

// False until the first session check on app load has finished.
// Route guards show a loader until then, so a logged-in user isn't sent to /login on refresh.
export const selectIsSessionChecked = (state: RootState): boolean => state.auth.isSessionChecked

export default authSlice.reducer
