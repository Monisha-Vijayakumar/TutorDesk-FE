import { GraduationCap } from "lucide-react"
import { APP_NAME } from "@/constants/app"
import type { AppLogoProps } from "@/interfaces/common"
import { cn } from "@/lib/utils"

const LOGO_SIZE_CLASSES = {
  sm: { mark: "size-8 rounded-lg", icon: "size-5", name: "text-lg" },
  lg: { mark: "size-14 rounded-2xl", icon: "size-8", name: "text-3xl sm:text-4xl" },
} as const

// TutorDesk logo: graduation cap in a rounded square, optionally followed by the app name.
export const AppLogo = ({ size = "sm", isNameVisible = true, className }: AppLogoProps) => {
  const sizeClasses = LOGO_SIZE_CLASSES[size]

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center bg-primary text-primary-foreground",
          sizeClasses.mark
        )}
      >
        <GraduationCap className={sizeClasses.icon} />
      </span>
      {isNameVisible && (
        <span className={cn("font-heading font-semibold", sizeClasses.name)}>{APP_NAME}</span>
      )}
    </span>
  )
}
