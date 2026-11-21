import { PlayCircle } from "lucide-react"
import demoPosterUrl from "@/assets/videos/tutordeskDemoPoster.webp"
import demoVideoUrl from "@/assets/videos/tutordeskDemo.mp4"
import { LANDING_SECTION_IDS } from "@/constants/landing"
import { LandingAuthButton } from "./LandingAuthButton"

// Headline ("Manage Smarter. Teach Better."), tagline, description and the buttons, next to the 15-second product tour.
// The video only downloads when someone presses play (preload="none"); the poster is a 30 KB still.
export const LandingHero = () => {
  return (
    <section id="top" className="relative overflow-hidden bg-linear-to-br from-chart-1/10 via-background to-chart-2/10">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <p className="rounded-full border border-chart-1/30 bg-chart-1/10 px-3 py-1 text-sm font-medium text-chart-1">
            For tuition centers
          </p>
          <h1 className="font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Manage Smarter. Teach Better.
          </h1>
          <p className="text-xl font-medium text-foreground text-balance sm:text-2xl">
            Students, Batches, Payments &amp; <span className="whitespace-nowrap">WhatsApp Follow-Ups</span> — All in
            One Place.
          </p>
          <p className="max-w-xl text-lg text-muted-foreground text-pretty">
            Simplify your daily operations: manage students with ease, keep batches organised and track every monthly
            fee and payment. See at a glance who has paid, partly paid, is pending or overdue — and send parents a
            polite WhatsApp reminder in one click.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <LandingAuthButton className="sm:min-w-32" />
            <a
              href={`#${LANDING_SECTION_IDS.HOW_IT_WORKS}`}
              className="inline-flex h-10 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
            >
              See how it works
            </a>
          </div>
        </div>

        <figure id={LANDING_SECTION_IDS.DEMO} className="flex scroll-mt-24 flex-col gap-3">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-xl ring-1 ring-foreground/5">
            <video
              className="aspect-video w-full bg-muted"
              src={demoVideoUrl}
              poster={demoPosterUrl}
              controls
              muted
              playsInline
              preload="none"
              aria-label="15-second tour of TutorDesk: dashboard, fee collection, WhatsApp reminders and payment history"
            />
          </div>
          <figcaption className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <PlayCircle className="size-4" aria-hidden="true" />
            A 15-second tour of TutorDesk
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
