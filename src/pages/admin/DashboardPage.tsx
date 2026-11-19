import { ADMIN_PAGE_TITLES } from "@/constants/navigation"
import { selectCurrentUser } from "@/store/authSlice"
import { useAppSelector } from "@/store/hooks"

// Placeholder. Stat cards, today's batches and charts come in the Dashboard milestone.
export const DashboardPage = () => {
  const currentUser = useAppSelector(selectCurrentUser)

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-2xl font-semibold">{ADMIN_PAGE_TITLES.DASHBOARD}</h1>
      <p className="text-muted-foreground">Welcome, {currentUser?.name}.</p>
    </div>
  )
}
