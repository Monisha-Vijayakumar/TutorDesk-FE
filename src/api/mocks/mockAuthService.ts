import type {
  AuthService,
  ChangePasswordPayload,
  DemoAccount,
  DemoAccountChanges,
  LoginPayload,
  UpdateProfilePayload,
  User,
} from "@/api/interfaces/auth"
import { HTTP_STATUS } from "@/api/httpStatus"
import { USER_ROLES } from "@/constants/userRoles"
import { createMockApiError } from "./mockApiError"
import { waitForMockDelay } from "./mockDelay"

// DEV ONLY — demo logins while tutordesk-be isn't ready. Used when VITE_USE_MOCK_API=true
// in `npm run dev` (see IS_MOCK_API_ENABLED). These are fake demo credentials, not real ones.

const DEMO_SESSION_STORAGE_KEY = "tutordesk-demo-user-id"
// Profile edits and password changes made in this tab, so a refresh keeps them (cleared with the tab).
const DEMO_ACCOUNT_CHANGES_STORAGE_KEY = "tutordesk-demo-account-changes"

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    identifier: "admin@tutordesk.com",
    password: "Demo@1234",
    // Like the seeded admin: has to change the seeded password after the first login.
    user: {
      id: "demo-admin",
      name: "Monisha Vijayakumar",
      email: "admin@tutordesk.com",
      role: USER_ROLES.ADMIN,
      phone: "+919876543210",
      address: "12, Gandhi Street, Anna Nagar",
      centerName: "Bright Minds Tuition",
      branch: "Anna Nagar",
      city: "Chennai",
      state: "Tamil Nadu",
      feeDueDay: 10,
      mustChangePassword: false,
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

const readAccountChanges = (): DemoAccountChanges => {
  const savedChanges = sessionStorage.getItem(DEMO_ACCOUNT_CHANGES_STORAGE_KEY)
  return savedChanges ? (JSON.parse(savedChanges) as DemoAccountChanges) : {}
}

const saveAccountChange = (account: DemoAccount): void => {
  const changes = readAccountChanges()
  changes[account.user.id] = { user: account.user, password: account.password }
  sessionStorage.setItem(DEMO_ACCOUNT_CHANGES_STORAGE_KEY, JSON.stringify(changes))
}

// The demo accounts with this tab's changes applied.
const getDemoAccounts = (): DemoAccount[] => {
  const changes = readAccountChanges()
  return DEMO_ACCOUNTS.map((account) => {
    const change = changes[account.user.id]
    return change ? { ...account, user: change.user, password: change.password } : account
  })
}

const getLoggedInAccount = (): DemoAccount => {
  const savedUserId = sessionStorage.getItem(DEMO_SESSION_STORAGE_KEY)
  const savedAccount = getDemoAccounts().find((account) => account.user.id === savedUserId)
  if (!savedAccount) {
    throw createMockApiError(HTTP_STATUS.UNAUTHORIZED, "Not logged in.")
  }
  return savedAccount
}

const login = async (payload: LoginPayload): Promise<User> => {
  await waitForMockDelay()

  const matchingAccount = getDemoAccounts().find(
    (account) => account.identifier === payload.identifier && account.password === payload.password
  )
  if (!matchingAccount) {
    throw createMockApiError(HTTP_STATUS.UNAUTHORIZED, "Invalid email or password.")
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
  return getLoggedInAccount().user
}

// Email and role stay as they are.
const updateProfile = async (payload: UpdateProfilePayload): Promise<User> => {
  await waitForMockDelay()
  const account = getLoggedInAccount()
  const updatedAccount = { ...account, user: { ...account.user, ...payload } }
  saveAccountChange(updatedAccount)
  return updatedAccount.user
}

const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  await waitForMockDelay()
  const account = getLoggedInAccount()

  if (payload.currentPassword !== account.password) {
    const message = "Current password is incorrect."
    throw createMockApiError(HTTP_STATUS.BAD_REQUEST, message, { currentPassword: message })
  }
  if (payload.newPassword === account.password) {
    const message = "New password must be different from the current password."
    throw createMockApiError(HTTP_STATUS.BAD_REQUEST, message, { newPassword: message })
  }

  saveAccountChange({
    ...account,
    password: payload.newPassword,
    user: { ...account.user, mustChangePassword: false },
  })
}

export const mockAuthService: AuthService = {
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword,
}
