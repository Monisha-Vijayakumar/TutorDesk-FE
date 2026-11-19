import { Outlet } from "react-router"
import publicBackgroundUrl from "@/assets/backgrounds/publicBackground.svg"

// Shared background for the public pages (home, login, 404, unauthorized).
export const PublicLayout = () => {
  return (
    <div
      className="min-h-svh bg-cover bg-center"
      style={{ backgroundImage: `url(${publicBackgroundUrl})` }}
    >
      <Outlet />
    </div>
  )
}
