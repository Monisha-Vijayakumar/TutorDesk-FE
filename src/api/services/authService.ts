import { API_ENDPOINTS } from "@/api/apiEndpoints"
import type { AuthResponse, AuthService, LoginPayload, User } from "@/api/interfaces/auth"
import { mockAuthService } from "@/api/mocks/mockAuthService"
import { IS_MOCK_API_ENABLED } from "@/constants/app"
import { api } from "./apiClient"

const login = async (payload: LoginPayload): Promise<User> => {
  const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, payload)
  return response.data.user
}

const logout = async (): Promise<void> => {
  await api.post(API_ENDPOINTS.AUTH.LOGOUT)
}

const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<AuthResponse>(API_ENDPOINTS.AUTH.CURRENT_USER)
  return response.data.user
}

const realAuthService: AuthService = {
  login,
  logout,
  getCurrentUser,
}

// Demo logins in dev until tutordesk-be is ready (VITE_USE_MOCK_API=true).
export const authService: AuthService = IS_MOCK_API_ENABLED ? mockAuthService : realAuthService
