import axios from "axios"

/**
 * Shared axios instance. The JWT lives in an httpOnly cookie set by the BE,
 * so every request must send credentials.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

/** Pull a human-readable message out of an API/network error. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "Unable to reach the server. Check your connection."
    const data = error.response.data as { message?: string } | undefined
    return data?.message ?? fallback
  }
  return fallback
}
