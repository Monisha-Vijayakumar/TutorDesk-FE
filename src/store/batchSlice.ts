import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { getApiError } from "@/api/apiErrorHandler"
import { ERROR_MESSAGES } from "@/api/errorMessages"
import { HTTP_STATUS } from "@/api/httpStatus"
import type {
  Batch,
  BatchListParams,
  BatchListResponse,
  BatchSummary,
  BatchTimeSlot,
  CreateBatchPayload,
  UpdateBatchRequest,
} from "@/api/interfaces/batch"
import type { ApiError } from "@/api/interfaces/common"
import { batchService } from "@/api/services/batchService"
import { BATCH_ACTION_TYPES, BATCH_SLICE_NAME } from "@/constants/actionTypes"
import type { BatchState } from "@/interfaces/batches"
import { logoutUser } from "./authSlice"
import type { RootState } from "./index"

// A 404 on view/edit/delete means the batch was deleted elsewhere meanwhile.
const BATCH_NOT_FOUND_MESSAGES = { [HTTP_STATUS.NOT_FOUND]: ERROR_MESSAGES.BATCH_NOT_FOUND }

const initialState: BatchState = {
  batches: [],
  total: 0,
  hasLoadedList: false,
  isListLoading: false,
  listError: null,
  listRequestId: null,
  timeSlots: [],
  batchDetails: null,
  batchDetailsId: null,
  batchDetailsError: null,
  batchDetailsRequestId: null,
}

// One page of batches for the current search / time filter. The page aborts it when the filters
// change or the page is left (signal cancels the HTTP request).
export const fetchBatches = createAsyncThunk<BatchListResponse, BatchListParams, { rejectValue: ApiError }>(
  BATCH_ACTION_TYPES.FETCH_BATCHES,
  async (params, { rejectWithValue, signal }) => {
    try {
      return await batchService.getBatches(params, signal)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.BATCHES_LOAD_FAILED))
    }
  }
)

// Options of the Batch Time filter. If this fails the filter only offers "All Batch Times";
// the list itself still works, so no error is shown for it.
export const fetchBatchTimeSlots = createAsyncThunk<BatchTimeSlot[], void, { rejectValue: ApiError }>(
  BATCH_ACTION_TYPES.FETCH_BATCH_TIME_SLOTS,
  async (_, { rejectWithValue, signal }) => {
    try {
      return await batchService.getBatchTimeSlots(signal)
    } catch (error) {
      return rejectWithValue(getApiError(error))
    }
  }
)

// One batch with its assigned students, for the View and Edit sheets.
export const fetchBatchDetails = createAsyncThunk<Batch, string, { rejectValue: ApiError }>(
  BATCH_ACTION_TYPES.FETCH_BATCH_DETAILS,
  async (batchId, { rejectWithValue, signal }) => {
    try {
      return await batchService.getBatch(batchId, signal)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.BATCH_LOAD_FAILED, BATCH_NOT_FOUND_MESSAGES))
    }
  }
)

// Create / update / delete don't change the stored list: the page reloads it afterwards, because the
// server decides order, filtering and paging.
export const createBatch = createAsyncThunk<Batch, CreateBatchPayload, { rejectValue: ApiError }>(
  BATCH_ACTION_TYPES.CREATE_BATCH,
  async (payload, { rejectWithValue }) => {
    try {
      return await batchService.createBatch(payload)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.BATCH_CREATE_FAILED))
    }
  }
)

export const updateBatch = createAsyncThunk<Batch, UpdateBatchRequest, { rejectValue: ApiError }>(
  BATCH_ACTION_TYPES.UPDATE_BATCH,
  async ({ batchId, payload }, { rejectWithValue }) => {
    try {
      return await batchService.updateBatch(batchId, payload)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.BATCH_UPDATE_FAILED, BATCH_NOT_FOUND_MESSAGES))
    }
  }
)

export const deleteBatch = createAsyncThunk<void, string, { rejectValue: ApiError }>(
  BATCH_ACTION_TYPES.DELETE_BATCH,
  async (batchId, { rejectWithValue }) => {
    try {
      await batchService.deleteBatch(batchId)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.BATCH_DELETE_FAILED, BATCH_NOT_FOUND_MESSAGES))
    }
  }
)

const batchSlice = createSlice({
  name: BATCH_SLICE_NAME,
  initialState,
  reducers: {
    // A View/Edit sheet finished closing. Takes the id of the request that sheet made, so details
    // loaded meanwhile for another sheet are kept.
    clearBatchDetails: (state, action: PayloadAction<string>) => {
      if (state.batchDetailsRequestId !== action.payload) {
        return
      }
      state.batchDetails = null
      state.batchDetailsId = null
      state.batchDetailsError = null
      state.batchDetailsRequestId = null
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBatches.pending, (state, action) => {
      state.isListLoading = true
      state.listError = null
      state.listRequestId = action.meta.requestId
    })

    builder.addCase(fetchBatches.fulfilled, (state, action) => {
      if (action.meta.requestId !== state.listRequestId) {
        return
      }
      state.batches = action.payload.batches
      state.total = action.payload.total
      state.hasLoadedList = true
      state.isListLoading = false
    })

    builder.addCase(fetchBatches.rejected, (state, action) => {
      if (action.meta.requestId !== state.listRequestId) {
        return
      }
      state.isListLoading = false
      // Aborted on purpose (page left): not an error.
      if (!action.meta.aborted) {
        state.listError = action.payload?.message ?? ERROR_MESSAGES.BATCHES_LOAD_FAILED
      }
    })

    builder.addCase(fetchBatchTimeSlots.fulfilled, (state, action) => {
      state.timeSlots = action.payload
    })

    // Always cleared while loading, so a sheet never shows another batch's (or an outdated) details
    // and the edit form always starts from the saved values.
    builder.addCase(fetchBatchDetails.pending, (state, action) => {
      state.batchDetails = null
      state.batchDetailsId = action.meta.arg
      state.batchDetailsError = null
      state.batchDetailsRequestId = action.meta.requestId
    })

    builder.addCase(fetchBatchDetails.fulfilled, (state, action) => {
      if (action.meta.requestId === state.batchDetailsRequestId) {
        state.batchDetails = action.payload
      }
    })

    builder.addCase(fetchBatchDetails.rejected, (state, action) => {
      if (action.meta.requestId === state.batchDetailsRequestId && !action.meta.aborted) {
        state.batchDetailsError = action.payload?.message ?? ERROR_MESSAGES.BATCH_LOAD_FAILED
      }
    })

    // Don't keep one session's data for the next login.
    builder.addCase(logoutUser.fulfilled, () => initialState)
  },
})

export const { clearBatchDetails } = batchSlice.actions

export const selectBatches = (state: RootState): BatchSummary[] => state.batches.batches

export const selectBatchTotal = (state: RootState): number => state.batches.total

export const selectHasLoadedBatchList = (state: RootState): boolean => state.batches.hasLoadedList

export const selectIsBatchListLoading = (state: RootState): boolean => state.batches.isListLoading

export const selectBatchListError = (state: RootState): string | null => state.batches.listError

export const selectBatchTimeSlots = (state: RootState): BatchTimeSlot[] => state.batches.timeSlots

// The details of this batch only — never another batch's while it loads.
export const selectBatchDetails = (state: RootState, batchId: string | null): Batch | null => {
  return state.batches.batchDetailsId === batchId ? state.batches.batchDetails : null
}

export const selectBatchDetailsError = (state: RootState, batchId: string | null): string | null => {
  return state.batches.batchDetailsId === batchId ? state.batches.batchDetailsError : null
}

export default batchSlice.reducer
