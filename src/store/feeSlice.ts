import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { getApiError } from "@/api/apiErrorHandler"
import { ERROR_MESSAGES } from "@/api/errorMessages"
import { HTTP_STATUS } from "@/api/httpStatus"
import type { ApiError } from "@/api/interfaces/common"
import type {
  CreateReminderRequest,
  FeeListParams,
  FeeListResponse,
  FeeRecord,
  PaymentHistoryResponse,
  PaymentReminder,
  UpdateFeeRequest,
} from "@/api/interfaces/fee"
import { feeService } from "@/api/services/feeService"
import { FEE_ACTION_TYPES, FEE_SLICE_NAME } from "@/constants/actionTypes"
import type { FeeState } from "@/interfaces/fees"
import { logoutUser } from "./authSlice"
import type { RootState } from "./index"

// A 404 on a fee action means the student was deleted elsewhere meanwhile.
const FEE_NOT_FOUND_MESSAGES = { [HTTP_STATUS.NOT_FOUND]: ERROR_MESSAGES.FEE_NOT_FOUND }

const initialState: FeeState = {
  fees: [],
  total: 0,
  hasLoadedList: false,
  isListLoading: false,
  listError: null,
  listRequestId: null,
  paymentHistory: null,
  paymentHistoryStudentId: null,
  paymentHistoryError: null,
  paymentHistoryRequestId: null,
  sendingReminderFeeIds: [],
}

// One page of fee records for a month and the current search / filters. The page aborts it when
// those change or the page is left (signal cancels the HTTP request).
export const fetchFees = createAsyncThunk<FeeListResponse, FeeListParams, { rejectValue: ApiError }>(
  FEE_ACTION_TYPES.FETCH_FEES,
  async (params, { rejectWithValue, signal }) => {
    try {
      return await feeService.getFees(params, signal)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.FEES_LOAD_FAILED))
    }
  }
)

// Doesn't change the stored list: the page reloads it afterwards (paid / outstanding / status are
// recalculated by the server and can move the record out of the current filter).
export const updateFee = createAsyncThunk<FeeRecord, UpdateFeeRequest, { rejectValue: ApiError }>(
  FEE_ACTION_TYPES.UPDATE_FEE,
  async ({ feeId, payload }, { rejectWithValue }) => {
    try {
      return await feeService.updateFee(feeId, payload)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.FEE_UPDATE_FAILED, FEE_NOT_FOUND_MESSAGES))
    }
  }
)

export const fetchPaymentHistory = createAsyncThunk<PaymentHistoryResponse, string, { rejectValue: ApiError }>(
  FEE_ACTION_TYPES.FETCH_PAYMENT_HISTORY,
  async (studentId, { rejectWithValue, signal }) => {
    try {
      return await feeService.getPaymentHistory(studentId, signal)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.PAYMENT_HISTORY_LOAD_FAILED))
    }
  }
)

export const createFeeReminder = createAsyncThunk<
  PaymentReminder,
  CreateReminderRequest,
  { state: RootState; rejectValue: ApiError }
>(
  FEE_ACTION_TYPES.CREATE_FEE_REMINDER,
  async ({ feeId, payload }, { rejectWithValue }) => {
    try {
      return await feeService.createFeeReminder(feeId, payload)
    } catch (error) {
      return rejectWithValue(getApiError(error, ERROR_MESSAGES.REMINDER_RECORD_FAILED))
    }
  },
  {
    // Never record the same fee's reminder twice at once (double click).
    condition: ({ feeId }, { getState }) => !getState().fees.sendingReminderFeeIds.includes(feeId),
  }
)

const removeFeeId = (feeIds: string[], feeId: string): string[] => feeIds.filter((id) => id !== feeId)

const feeSlice = createSlice({
  name: FEE_SLICE_NAME,
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchFees.pending, (state, action) => {
      state.isListLoading = true
      state.listError = null
      state.listRequestId = action.meta.requestId
    })

    builder.addCase(fetchFees.fulfilled, (state, action) => {
      if (action.meta.requestId !== state.listRequestId) {
        return
      }
      state.fees = action.payload.fees
      state.total = action.payload.total
      state.hasLoadedList = true
      state.isListLoading = false
    })

    builder.addCase(fetchFees.rejected, (state, action) => {
      if (action.meta.requestId !== state.listRequestId) {
        return
      }
      state.isListLoading = false
      // Aborted on purpose (page left): not an error.
      if (!action.meta.aborted) {
        state.listError = action.payload?.message ?? ERROR_MESSAGES.FEES_LOAD_FAILED
      }
    })

    // Another student's history is cleared straight away, so it can never show for the wrong student.
    // Reopening the same student's history keeps it on screen while it refreshes.
    builder.addCase(fetchPaymentHistory.pending, (state, action) => {
      if (state.paymentHistoryStudentId !== action.meta.arg) {
        state.paymentHistory = null
      }
      state.paymentHistoryStudentId = action.meta.arg
      state.paymentHistoryError = null
      state.paymentHistoryRequestId = action.meta.requestId
    })

    builder.addCase(fetchPaymentHistory.fulfilled, (state, action) => {
      if (action.meta.requestId === state.paymentHistoryRequestId) {
        state.paymentHistory = action.payload
      }
    })

    builder.addCase(fetchPaymentHistory.rejected, (state, action) => {
      if (action.meta.requestId === state.paymentHistoryRequestId && !action.meta.aborted) {
        state.paymentHistory = null
        state.paymentHistoryError = action.payload?.message ?? ERROR_MESSAGES.PAYMENT_HISTORY_LOAD_FAILED
      }
    })

    builder.addCase(createFeeReminder.pending, (state, action) => {
      state.sendingReminderFeeIds.push(action.meta.arg.feeId)
    })

    builder.addCase(createFeeReminder.fulfilled, (state, action) => {
      state.sendingReminderFeeIds = removeFeeId(state.sendingReminderFeeIds, action.meta.arg.feeId)
    })

    builder.addCase(createFeeReminder.rejected, (state, action) => {
      state.sendingReminderFeeIds = removeFeeId(state.sendingReminderFeeIds, action.meta.arg.feeId)
    })

    // Don't keep one session's data for the next login.
    builder.addCase(logoutUser.fulfilled, () => initialState)
  },
})

export const selectFees = (state: RootState): FeeRecord[] => state.fees.fees

export const selectFeeTotal = (state: RootState): number => state.fees.total

export const selectHasLoadedFeeList = (state: RootState): boolean => state.fees.hasLoadedList

export const selectIsFeeListLoading = (state: RootState): boolean => state.fees.isListLoading

export const selectFeeListError = (state: RootState): string | null => state.fees.listError

// The history of this student only — never another student's while it loads.
export const selectPaymentHistory = (state: RootState, studentId: string | null): PaymentHistoryResponse | null => {
  return state.fees.paymentHistoryStudentId === studentId ? state.fees.paymentHistory : null
}

export const selectPaymentHistoryError = (state: RootState): string | null => state.fees.paymentHistoryError

export const selectSendingReminderFeeIds = (state: RootState): string[] => state.fees.sendingReminderFeeIds

export default feeSlice.reducer
