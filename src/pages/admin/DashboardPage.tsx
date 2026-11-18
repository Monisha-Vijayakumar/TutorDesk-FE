import { useAppSelector } from "@/store/hooks"

/** Placeholder — stat cards, today's batches and charts come in the Dashboard milestone. */
export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user)

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {user?.name}.</p>
    </div>
  )
}
