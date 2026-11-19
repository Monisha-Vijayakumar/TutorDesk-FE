import { Link } from "react-router"
import type { TextLinkProps } from "@/interfaces/common"

export const TextLink = ({ to, children }: TextLinkProps) => {
  return (
    <Link to={to} className="font-medium text-foreground underline-offset-4 hover:underline">
      {children}
    </Link>
  )
}
