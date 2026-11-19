import { ChevronDown, LogOut, Settings } from "lucide-react"
import { useNavigate } from "react-router"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ADMIN_PAGE_TITLES } from "@/constants/navigation"
import { useLogout } from "@/hooks/useLogout"
import { PATHS } from "@/routes/paths"
import { selectCurrentUser } from "@/store/authSlice"
import { useAppSelector } from "@/store/hooks"
import { getInitials } from "@/utils/format"

// Avatar button in the top bar that opens the profile menu (settings, log out).
export const AdminUserMenu = () => {
  const currentUser = useAppSelector(selectCurrentUser)
  const navigate = useNavigate()
  const logout = useLogout()

  if (!currentUser) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open profile menu"
        className="flex items-center gap-2 rounded-full p-1 pr-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar>
          <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-sm font-medium sm:inline">{currentUser.name}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <p className="text-sm font-medium text-foreground">{currentUser.name}</p>
            <p className="truncate font-normal">{currentUser.email}</p>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(PATHS.adminSettings)}>
          <Settings />
          {ADMIN_PAGE_TITLES.SETTINGS}
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={logout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
