import type { ReactNode } from "react"

export interface TextLinkProps {
  to: string
  children: ReactNode
}

export interface StatusPageProps {
  statusCode: string
  title: string
  message: string
}

export interface SafeHtmlProps {
  // HTML from data (e.g. a rich-text note). It is cleaned with DOMPurify before rendering.
  html: string
  className?: string
}

export interface AppLogoProps {
  size?: "sm" | "lg"
  isNameVisible?: boolean
  className?: string
}

export interface PlaceholderPageProps {
  title: string
}
