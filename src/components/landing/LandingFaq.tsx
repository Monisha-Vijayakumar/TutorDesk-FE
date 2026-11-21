import { ChevronDown } from "lucide-react"
import { LANDING_FAQS, LANDING_SECTION_IDS } from "@/constants/landing"
import { LandingSectionHeading } from "./LandingSectionHeading"

// Questions owners ask before switching, as native disclosure widgets (keyboard and screen-reader ready).
export const LandingFaq = () => {
  return (
    <section id={LANDING_SECTION_IDS.FAQ} className="mx-auto flex max-w-3xl scroll-mt-16 flex-col gap-10 px-4 py-16 sm:px-6">
      <LandingSectionHeading eyebrow="FAQ" title="Questions owners ask" />
      <div className="flex flex-col gap-3">
        {LANDING_FAQS.map((faq) => (
          <details key={faq.question} className="group rounded-xl border bg-card">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-3 font-medium [&::-webkit-details-marker]:hidden">
              {faq.question}
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="px-5 pb-4 text-sm text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
