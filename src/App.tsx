import { useEffect } from "react"
import { RouterProvider } from "react-router"
import { router } from "@/routes/router"
import { fetchCurrentUser } from "@/store/authSlice"
import { useAppDispatch } from "@/store/hooks"

function App() {
  const dispatch = useAppDispatch()

  // Restore the session from the httpOnly cookie on first load.
  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return <RouterProvider router={router} />
}

export default App
