import { useState } from "react"
import { Menu } from "lucide-react"
import { Outlet } from "react-router"
import { AppLogo } from "@/components/AppLogo"
import { AdminUserMenu } from "@/components/layout/AdminUserMenu"
import { SidebarNav } from "@/components/layout/SidebarNav"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ADMIN_NAV_ITEMS } from "@/constants/navigation"
import { cn } from "@/lib/utils"
import { selectCurrentUser } from "@/store/authSlice"
import { useAppSelector } from "@/store/hooks"

// Admin shell: sidebar on desktop, slide-out drawer on phones, top bar with the profile menu.
// The notification bell is added in the notifications milestone.
export const AdminLayout = () => {
  const currentUser = useAppSelector(selectCurrentUser)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-muted/30">
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col gap-6 border-r bg-background p-4 md:flex">
        <AppLogo />
        <SidebarNav items={ADMIN_NAV_ITEMS} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background px-4">
          <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
            <SheetTrigger
              aria-label="Open navigation menu"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 gap-6 p-4">
              <SheetTitle>
                <AppLogo />
              </SheetTitle>
              <SidebarNav items={ADMIN_NAV_ITEMS} onNavigate={() => setIsMobileNavOpen(false)} />
            </SheetContent>
          </Sheet>

          <AppLogo className="md:hidden" />
          <p className="hidden text-sm font-medium text-muted-foreground md:block">
            {currentUser?.centerName}
          </p>

          <div className="ml-auto">
            <AdminUserMenu />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
