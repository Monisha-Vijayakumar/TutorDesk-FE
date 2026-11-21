import { Outlet } from "react-router"
import publicBackgroundUrl from "@/assets/backgrounds/publicBackground.webp"

// Shared background for the login, 404 and unauthorized pages (the landing page has its own design).
// Photo: "Glasses, notebooks, and pencils on a white desk" by Jess Bailey on Unsplash
// (https://unsplash.com/photos/k5BvNg8-SRA) — free under the Unsplash License.
export const PublicLayout = () => {
  return (
    <div
      className="relative min-h-svh bg-cover bg-center"
      style={{ backgroundImage: `url(${publicBackgroundUrl})` }}
    >
      {/* Light wash over the photo so text stays readable (stronger on phones, where the photo is cropped). */}
      <div className="absolute inset-0 bg-background/50 sm:bg-background/25" aria-hidden="true" />

      <div className="relative">
        <Outlet />
      </div>
    </div>
  )
}
