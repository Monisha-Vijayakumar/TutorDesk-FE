import { AppLogo } from "@/components/AppLogo"
import { LANDING_NAV_LINKS } from "@/constants/landing"
import { LandingAuthButton } from "./LandingAuthButton"

// Top bar of the landing page: logo + name on the left, section links (from md) and Log in on the right.
export const LandingNavbar = () => {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a
          href="#top"
          className="inline-flex min-h-10 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="TutorDesk home"
        >
          <AppLogo />
        </a>
        <nav aria-label="Page sections" className="hidden items-center gap-1 md:flex">
          {LANDING_NAV_LINKS.map((link) => (
            <a
              key={link.sectionId}
              href={`#${link.sectionId}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <LandingAuthButton />
      </div>
    </header>
  )
}
