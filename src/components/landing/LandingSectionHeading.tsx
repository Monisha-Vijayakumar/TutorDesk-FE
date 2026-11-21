import type { LandingSectionHeadingProps } from "@/interfaces/landing"

// Small coloured label, section title and an optional line under it — the same on every section.
export const LandingSectionHeading = ({ eyebrow, title, description }: LandingSectionHeadingProps) => {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
      <p className="text-sm font-semibold tracking-wide text-chart-1 uppercase">{eyebrow}</p>
      <h2 className="font-heading text-3xl font-semibold text-balance sm:text-4xl">{title}</h2>
      {description && <p className="text-muted-foreground text-pretty sm:text-lg">{description}</p>}
    </div>
  )
}
