import { LANDING_SECTION_IDS, LANDING_STEPS } from "@/constants/landing"
import { TONE_CLASSES } from "@/constants/tones"
import { cn } from "@/lib/utils"
import { LandingSectionHeading } from "./LandingSectionHeading"

// Three numbered steps from first login to the first reminder.
export const LandingHowItWorks = () => {
  return (
    <section id={LANDING_SECTION_IDS.HOW_IT_WORKS} className="scroll-mt-16 bg-muted/40 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6">
        <LandingSectionHeading
          eyebrow="How it works"
          title="Up and running in an afternoon."
          description="Three steps from adding your students to sending your first reminder."
        />
        <ol className="grid gap-6 md:grid-cols-3">
          {LANDING_STEPS.map((step, index) => {
            const Icon = step.icon

            return (
              <li key={step.title} className="relative flex flex-col gap-4 rounded-2xl border bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className={cn("flex size-12 items-center justify-center rounded-xl", TONE_CLASSES[step.tone].iconTile)}>
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-4xl font-semibold text-muted-foreground/30" aria-hidden="true">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold">
                  <span className="sr-only">Step {index + 1}: </span>
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
