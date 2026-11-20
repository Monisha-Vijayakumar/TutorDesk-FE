import axios from "axios"
import { DEFAULT_API_BASE_URL, REQUEST_TIMEOUT_MS } from "@/constants/app"

// The JWT lives in an httpOnly cookie set by the backend,
// so every request has to send credentials.
// Failed requests are turned into user-facing messages by getApiError (@/api/apiErrorHandler).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
  withCredentials: true,
  timeout: REQUEST_TIMEOUT_MS,
  headers: { "Content-Type": "application/json" },
})
