import axios from "axios"
import { ERROR_MESSAGES } from "@/api/errorMessages"
import type { ApiErrorResponse } from "@/api/interfaces/common"
import { DEFAULT_API_BASE_URL } from "@/constants/app"

// The JWT lives in an httpOnly cookie set by the backend,
// so every request has to send credentials.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

export const getErrorMessage = (error: unknown, fallbackMessage: string = ERROR_MESSAGES.GENERIC): string => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallbackMessage
  }

  if (!error.response) {
    return ERROR_MESSAGES.NETWORK
  }

  return error.response.data?.message ?? fallbackMessage
}
