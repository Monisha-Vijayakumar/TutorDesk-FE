import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getApiError } from "@/api/apiErrorHandler"
import { ERROR_MESSAGES } from "@/api/errorMessages"
import type { ApiError } from "@/api/interfaces/common"
import type { DashboardStats, FeeCollection, FeeCollectionParams } from "@/api/interfaces/dashboard"
import { dashboardService } from "@/api/services/dashboardService"
import { DASHBOARD_ACTION_TYPES, DASHBOARD_SLICE_NAME } from "@/constants/actionTypes"
import type { DashboardState } from "@/interfaces/dashboard"
import { logoutUser } from "./authSlice"
import type { RootState } from "./index"

const initialState: DashboardState = {
  stats: null,
  isLoading: false,
  error: null,
  requestId: null,
  feeCollection: null,
  isFeeCollectionLoading: false,
  feeCollectionError: null,
  feeCollectionRequestId: null,
}

// Loaded each time the dashboard opens. The page aborts it when it's left.
export const fetchDashboardStats = createAsyncThunk<DashboardStats, void, { rejectValue: ApiError }>(
  DASHBOARD_ACTION_TYPES.FETCH_DASHBOARD_STATS,
  async (_, { rejectWithValue, signal }) => {
    try {
      return await dashboardService.getDashboardStats(signal)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.DASHBOARD_LOAD_FAILED))
    }
  }
)

// Payments received in the period chosen in the fee collection chart. Aborted when the period changes.
export const fetchFeeCollection = createAsyncThunk<FeeCollection, FeeCollectionParams, { rejectValue: ApiError }>(
  DASHBOARD_ACTION_TYPES.FETCH_FEE_COLLECTION,
  async (params, { rejectWithValue, signal }) => {
    try {
      return await dashboardService.getFeeCollection(params, signal)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.FEE_COLLECTION_LOAD_FAILED))
    }
  }
)

const dashboardSlice = createSlice({
  name: DASHBOARD_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // The previous numbers stay on screen (dimmed) while they refresh.
    builder.addCase(fetchDashboardStats.pending, (state, action) => {
      state.isLoading = true
      state.error = null
      state.requestId = action.meta.requestId
    })

    builder.addCase(fetchDashboardStats.fulfilled, (state, action) => {
      if (action.meta.requestId !== state.requestId) {
        return
      }
      state.stats = action.payload
      state.isLoading = false
    })

    builder.addCase(fetchDashboardStats.rejected, (state, action) => {
      if (action.meta.requestId !== state.requestId) {
        return
      }
      state.isLoading = false
      // Aborted on purpose (page left): not an error.
      if (!action.meta.aborted) {
        state.error = action.payload?.message ?? ERROR_MESSAGES.DASHBOARD_LOAD_FAILED
      }
    })

    builder.addCase(fetchFeeCollection.pending, (state, action) => {
      state.isFeeCollectionLoading = true
      state.feeCollectionError = null
      state.feeCollectionRequestId = action.meta.requestId
    })

    builder.addCase(fetchFeeCollection.fulfilled, (state, action) => {
      if (action.meta.requestId !== state.feeCollectionRequestId) {
        return
      }
      state.feeCollection = action.payload
      state.isFeeCollectionLoading = false
    })

    builder.addCase(fetchFeeCollection.rejected, (state, action) => {
      if (action.meta.requestId !== state.feeCollectionRequestId) {
        return
      }
      state.isFeeCollectionLoading = false
      if (!action.meta.aborted) {
        state.feeCollectionError = action.payload?.message ?? ERROR_MESSAGES.FEE_COLLECTION_LOAD_FAILED
      }
    })

    // Don't keep one session's data for the next login.
    builder.addCase(logoutUser.fulfilled, () => initialState)
  },
})

export const selectDashboardStats = (state: RootState): DashboardStats | null => state.dashboard.stats

export const selectIsDashboardLoading = (state: RootState): boolean => state.dashboard.isLoading

export const selectDashboardError = (state: RootState): string | null => state.dashboard.error

export const selectFeeCollection = (state: RootState): FeeCollection | null => state.dashboard.feeCollection

export const selectIsFeeCollectionLoading = (state: RootState): boolean => state.dashboard.isFeeCollectionLoading

export const selectFeeCollectionError = (state: RootState): string | null => state.dashboard.feeCollectionError

export default dashboardSlice.reducer
