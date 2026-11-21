import { NavLink, Outlet } from "react-router"
import { PageHeader } from "@/components/PageHeader"
import { ADMIN_PAGE_TITLES, SETTINGS_NAV_ITEMS } from "@/constants/navigation"
import { cn } from "@/lib/utils"

// Settings page: its own menu (Profile, Update Password) next to the selected section — a row of
// links above it when the content area is narrow, a side menu from @3xl.
export const SettingsLayout = () => {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={ADMIN_PAGE_TITLES.SETTINGS} description="Manage your profile and password." />

      <div className="grid gap-6 @3xl:grid-cols-[14rem_minmax(0,1fr)] @3xl:items-start">
        <nav aria-label="Settings" className="grid grid-cols-1 gap-2 @sm:grid-cols-2 @3xl:grid-cols-1">
          {SETTINGS_NAV_ITEMS.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <Outlet />
      </div>
    </div>
  )
}
