import { useEffect } from "react"
import { RouterProvider } from "react-router"
import { Toaster } from "@/components/ui/sonner"
import { TOAST_DURATION_MS, TOAST_POSITION } from "@/constants/app"
import { router } from "@/routes/router"
import { fetchCurrentUser } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"

const App = () => {
  const dispatch = useAppDispatch()

  // Restore the session from the httpOnly cookie when the app first loads.
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position={TOAST_POSITION} duration={TOAST_DURATION_MS} />
    </>
  )
}

export default App
