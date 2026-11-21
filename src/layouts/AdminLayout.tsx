import { Outlet, useNavigation } from "react-router"
import { AppLogo } from "@/components/AppLogo"
import { AdminSidebar } from "@/components/layout/AdminSidebar"
import { AdminUserMenu } from "@/components/layout/AdminUserMenu"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { selectCurrentUser } from "@/store/authSlice"
import { useAppSelector } from "@/store/hooks"
import { getIsSidebarOpenOnLoad } from "@/utils/sidebar"

// Admin shell: collapsible sidebar (drawer on phones) + top bar with the profile menu.
// The notification bell is added in the notifications milestone.
export const AdminLayout = () => {
  const currentUser = useAppSelector(selectCurrentUser)
  // "loading" while the next page's code downloads (lazy routes): the current page stays, a bar shows.
  const isPageLoading = useNavigation().state === "loading"

  return (
    <SidebarProvider defaultOpen={getIsSidebarOpenOnLoad()}>
      <AdminSidebar />

      <SidebarInset className="min-w-0 bg-muted/30">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background px-4 sm:px-6">
          {isPageLoading && (
            <div
              role="progressbar"
              aria-label="Loading page"
              className="absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-chart-1"
            />
          )}
          <SidebarTrigger className="size-10 md:hidden" aria-label="Open navigation menu" />
          <AppLogo className="md:hidden" />
          <p className="hidden min-w-0 truncate text-sm font-medium text-muted-foreground md:block">
            {currentUser?.centerName}
          </p>

          <div className="ml-auto">
            <AdminUserMenu />
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6">
          {/* Capped width so pages don't stretch across large monitors. It's also the container that
              page components size themselves against (@container), so they use the space the sidebar leaves. */}
          <div className="@container w-full max-w-screen-3xl">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
