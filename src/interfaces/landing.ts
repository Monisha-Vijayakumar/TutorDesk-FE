import type { LucideIcon } from "lucide-react"
import type { Tone } from "@/interfaces/common"

// Landing (home) page content: feature cards, how-it-works steps, FAQ entries, navbar links.

export interface LandingFeature {
  title: string
  description: string
  icon: LucideIcon
  tone: Tone
}

// A large feature card with its own bullet points (fees, dashboard).
export interface LandingHighlight extends LandingFeature {
  points: string[]
}

export interface LandingStep {
  title: string
  description: string
  icon: LucideIcon
  tone: Tone
}

export interface LandingFaq {
  question: string
  answer: string
}

export interface LandingNavLink {
  label: string
  sectionId: string
}

export interface LandingSectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
}

export interface LandingAuthButtonProps {
  variant?: "default" | "outline" | "secondary"
  className?: string
}
