import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getErrorMessage } from "@/services/api"
import { authService } from "@/services/authService"
import type { LoginPayload, SignupPayload, User } from "@/types/auth"

/**
 * sessionStatus tracks the initial "who am I?" check on app load:
 * idle → checking → ready. Route guards wait for "ready" before deciding.
 */
interface AuthState {
  user: User | null
  sessionStatus: "idle" | "checking" | "ready"
}

const initialState: AuthState = {
  user: null,
  sessionStatus: "idle",
}

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async () => authService.me(),
  {
    // Only run once (guards against StrictMode double effects).
    condition: (_, { getState }) =>
      (getState() as { auth: AuthState }).auth.sessionStatus === "idle",
  }
)

export const loginUser = createAsyncThunk<User, LoginPayload, { rejectValue: string }>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.login(payload)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Invalid email or password."))
    }
  }
)

export const signupUser = createAsyncThunk<User, SignupPayload, { rejectValue: string }>(
  "auth/signup",
  async (payload, { rejectWithValue }) => {
    try {
      return await authService.signup(payload)
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Could not create your account."))
    }
  }
)

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await authService.logout()
  } catch {
    // Clear local session even if the request fails.
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.sessionStatus = "checking"
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.sessionStatus = "ready"
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.sessionStatus = "ready"
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.sessionStatus = "ready"
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.sessionStatus = "ready"
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
      })
  },
})

export default authSlice.reducer
