import { SIDEBAR_STATE_COOKIE_NAME } from "@/constants/app"

// The shadcn Sidebar saves expanded/collapsed in a cookie but only reads it on the server.
// Read it here so a page reload keeps the admin's choice. Expanded unless they collapsed it.
export const getIsSidebarOpenOnLoad = (): boolean => {
  const savedState = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${SIDEBAR_STATE_COOKIE_NAME}=`))
    ?.split("=")[1]

  return savedState !== "false"
}
