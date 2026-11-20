import type { AuthService, DemoAccount, LoginPayload, User } from "@/api/interfaces/auth"
import { HTTP_STATUS } from "@/api/httpStatus"
import { USER_ROLES } from "@/constants/userRoles"
import { createMockApiError } from "./mockApiError"
import { waitForMockDelay } from "./mockDelay"

// DEV ONLY — demo logins while tutordesk-be isn't ready. Used when VITE_USE_MOCK_API=true
// in `npm run dev` (see IS_MOCK_API_ENABLED). These are fake demo credentials, not real ones.

const DEMO_SESSION_STORAGE_KEY = "tutordesk-demo-user-id"

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    identifier: "admin@tutordesk.dev",
    password: "Demo@1234",
    user: {
      id: "demo-admin",
      name: "Monisha Vijayakumar",
      email: "admin@tutordesk.dev",
      role: USER_ROLES.ADMIN,
      centerName: "Bright Minds Tuition",
    },
  },
  {
    identifier: "S100000001",
    password: "Demo@1234",
    user: {
      id: "demo-student",
      name: "Demo Student",
      role: USER_ROLES.STUDENT,
      studentCode: "S100000001",
      mustChangePassword: false,
    },
  },
]

const login = async (payload: LoginPayload): Promise<User> => {
  await waitForMockDelay()

  const matchingAccount = DEMO_ACCOUNTS.find(
    (account) => account.identifier === payload.identifier && account.password === payload.password
  )
  if (!matchingAccount) {
    throw createMockApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid email, Student ID or password.")
  }

  // Remember the demo user for this tab so a page refresh keeps them logged in.
  sessionStorage.setItem(DEMO_SESSION_STORAGE_KEY, matchingAccount.user.id)
  return matchingAccount.user
}

const logout = async (): Promise<void> => {
  sessionStorage.removeItem(DEMO_SESSION_STORAGE_KEY)
}

const getCurrentUser = async (): Promise<User> => {
  await waitForMockDelay()

  const savedUserId = sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY)
  const savedAccount = DEMO_ACCOUNTS.find((account) => account.user.id === savedUserId)
  if (!savedAccount) {
    throw createMockApiError(HTTP_STATUS.UNAUTHORIZED, "Not logged in.")
  }

  return savedAccount.user
}

export const mockAuthService: AuthService = {
  login,
  logout,
  getCurrentUser,
}
