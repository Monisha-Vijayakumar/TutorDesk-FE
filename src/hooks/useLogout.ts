import { useNavigate } from "react-router"
import { toast } from "sonner"
import { SUCCESS_MESSAGES } from "@/api/successMessages"
import { PATHS } from "@/routes/paths"
import { logoutUser } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"

export const useLogout = (): (() => Promise<void>) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const logout = async (): Promise<void> => {
    await dispatch(logoutUser())
    toast.success(SUCCESS_MESSAGES.LOGOUT_SUCCESS)
    navigate(PATHS.login, { replace: true })
  }

  return logout
}
