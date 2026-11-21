import { ProfileForm } from "@/components/settings/ProfileForm"
import { selectCurrentUser } from "@/store/authSlice"
import { useAppSelector } from "@/store/hooks"

export const ProfileSettingsPage = () => {
  const currentUser = useAppSelector(selectCurrentUser)

  // Always set on admin pages (ProtectedRoute); the check keeps TypeScript happy.
  if (!currentUser) {
    return null
  }

  return <ProfileForm user={currentUser} />
}
