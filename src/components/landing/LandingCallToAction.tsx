import { AppLogo } from "@/components/AppLogo"
import { LandingAuthButton } from "./LandingAuthButton"

// Closing call to action and the footer.
export const LandingCallToAction = () => {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-linear-to-br from-chart-1 to-chart-1/80 px-6 py-12 text-center text-white sm:py-16">
          <h2 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">
            Spend your time teaching, not chasing fees.
          </h2>
          <p className="max-w-xl text-white/85 text-pretty">
            See every fee, every payment and every reminder in one place — and send the next reminder in one click.
          </p>
          <LandingAuthButton variant="secondary" className="min-w-32" />
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <AppLogo />
          <p>© {new Date().getFullYear()} TutorDesk. Made for tuition centers.</p>
        </div>
      </footer>
    </>
  )
}
