import { ChevronsLeft } from "lucide-react"
import { NavLink, useLocation } from "react-router"
import { AppLogo } from "@/components/AppLogo"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ADMIN_NAV_ITEMS } from "@/constants/navigation"

const COLLAPSE_SIDEBAR_LABEL = "Collapse sidebar"
const EXPAND_SIDEBAR_LABEL = "Expand sidebar"

// Admin navigation. Laptop/tablet: full sidebar (logo + name, icon + label) that collapses to an
// icon rail; click the logo to expand again. Phones: the same menu in a drawer opened from the top bar.
// Ctrl/Cmd+B also toggles it (built into the shadcn Sidebar).
export const AdminSidebar = () => {
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar()
  const { pathname } = useLocation()
  const isCollapsed = state === "collapsed" && !isMobile

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-14 flex-row items-center justify-between border-b border-sidebar-border px-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                  onClick={() => setOpen(true)}
                  aria-label={EXPAND_SIDEBAR_LABEL}
                />
              }
            >
              <AppLogo isNameVisible={false} />
            </TooltipTrigger>
            <TooltipContent side="right">{EXPAND_SIDEBAR_LABEL}</TooltipContent>
          </Tooltip>
        ) : (
          <>
            <AppLogo />
            {!isMobile && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpen(false)}
                      aria-label={COLLAPSE_SIDEBAR_LABEL}
                    />
                  }
                >
                  <ChevronsLeft />
                </TooltipTrigger>
                <TooltipContent side="right">{COLLAPSE_SIDEBAR_LABEL}</TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon

              return (
                <SidebarMenuItem key={item.path}>
                  {/* The tooltip only shows while collapsed (handled by SidebarMenuButton). */}
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.path)}
                    tooltip={item.label}
                    className="h-10 font-medium text-muted-foreground data-active:bg-sidebar-primary data-active:text-sidebar-primary-foreground"
                    render={<NavLink to={item.path} onClick={() => setOpenMobile(false)} />}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
