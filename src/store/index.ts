import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import batchReducer from "./batchSlice"
import dashboardReducer from "./dashboardSlice"
import feeReducer from "./feeSlice"
import studentReducer from "./studentSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    batches: batchReducer,
    fees: feeReducer,
    dashboard: dashboardReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
