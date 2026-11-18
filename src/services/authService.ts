import { api } from "./api"
import type { LoginPayload, SignupPayload, User } from "@/types/auth"

// Assumed response shape: { user: User } — confirm against tutordesk-be.
interface AuthResponse {
  user: User
}

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await api.post<AuthResponse>("/auth/login", payload)
    return data.user
  },
  async signup(payload: SignupPayload) {
    const { data } = await api.post<AuthResponse>("/auth/signup", payload)
    return data.user
  },
  async logout() {
    await api.post("/auth/logout")
  },
  async me() {
    const { data } = await api.get<AuthResponse>("/auth/me")
    return data.user
  },
}
