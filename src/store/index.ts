import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import feeReducer from "./feeSlice"
import studentReducer from "./studentSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    fees: feeReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
