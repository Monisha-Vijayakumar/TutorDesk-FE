import { useNavigate } from "react-router"
import { toast } from "sonner"
import { SUCCESS_MESSAGES } from "@/api/successMessages"
import { PATHS } from "@/routes/paths"
import { logoutUser } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"

// Logs out and returns to the landing page. It leaves the portal first and clears the user after:
// clearing it while a portal page is still shown would make ProtectedRoute send the user to Login.
// flushSync makes the navigation render right away (React Router otherwise renders it in a transition,
// after the logout's state update).
export const useLogout = (): (() => Promise<void>) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const logout = async (): Promise<void> => {
    await navigate(PATHS.home, { replace: true, flushSync: true })
    await dispatch(logoutUser())
    toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS)
  }

  return logout
}
