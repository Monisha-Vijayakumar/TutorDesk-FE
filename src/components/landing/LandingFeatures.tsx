import { CheckCircle2, CircleAlert } from "lucide-react"
import { TONE_CLASSES } from "@/constants/tones"
import { LANDING_FEATURES, LANDING_HIGHLIGHTS, LANDING_PAIN_POINTS, LANDING_SECTION_IDS } from "@/constants/landing"
import { cn } from "@/lib/utils"
import { LandingSectionHeading } from "./LandingSectionHeading"

// What fee collection feels like today, then what TutorDesk does: the two main features in large cards
// and the rest in a grid.
export const LandingFeatures = () => {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-8 rounded-3xl border bg-card p-6 sm:p-10 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold tracking-wide text-chart-2 uppercase">Sound familiar?</p>
            <h2 className="font-heading text-3xl font-semibold text-balance">
              Teaching is the easy part. Collecting fees isn't.
            </h2>
            <p className="text-muted-foreground">TutorDesk turns all of this into one screen and one click.</p>
          </div>
          <ul className="flex flex-col gap-3">
            {LANDING_PAIN_POINTS.map((painPoint) => (
              <li key={painPoint} className="flex gap-3 rounded-xl bg-chart-2/10 p-3 text-sm">
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-chart-2" aria-hidden="true" />
                {painPoint}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id={LANDING_SECTION_IDS.FEATURES} className="mx-auto flex max-w-6xl scroll-mt-20 flex-col gap-12 px-4 py-16 sm:px-6">
        <LandingSectionHeading
          eyebrow="Features"
          title="Fee collection, finally under control."
          description="Everything a tuition center needs to keep track of students, fees and reminders — nothing it doesn't."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {LANDING_HIGHLIGHTS.map((highlight) => {
            const Icon = highlight.icon
            const toneClasses = TONE_CLASSES[highlight.tone]

            return (
              <article
                key={highlight.title}
                className={cn("flex flex-col gap-5 rounded-3xl border bg-linear-to-br to-card to-60% p-6 sm:p-8", toneClasses.background)}
              >
                <span className={cn("flex size-12 items-center justify-center rounded-xl", toneClasses.iconTile)}>
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-heading text-xl font-semibold">{highlight.title}</h3>
                  <p className="text-muted-foreground">{highlight.description}</p>
                </div>
                <ul className="flex flex-col gap-3">
                  {highlight.points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-chart-status-paid" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>

        {/* Wrapping rows, centred, so an incomplete last row sits in the middle (two or three per row). */}
        <div className="flex flex-wrap justify-center gap-4">
          {LANDING_FEATURES.map((feature) => {
            const Icon = feature.icon

            return (
              <article
                key={feature.title}
                className="flex w-full flex-col gap-3 rounded-2xl border bg-card p-5 sm:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)]"
              >
                <span className={cn("flex size-11 items-center justify-center rounded-xl", TONE_CLASSES[feature.tone].iconTile)}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-heading font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
