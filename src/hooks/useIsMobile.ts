import { useEffect, useState } from "react"

// Matches Tailwind's `md` breakpoint. Used by the shadcn Sidebar to switch to a drawer on phones.
const MOBILE_BREAKPOINT_PX = 768

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`)
    const handleChange = (): void => setIsMobile(mediaQuery.matches)

    handleChange()
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return isMobile
}
