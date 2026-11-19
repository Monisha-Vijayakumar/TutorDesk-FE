import { Construction } from "lucide-react"
import type { PlaceholderPageProps } from "@/interfaces/common"

// Temporary page for admin sections that are not built yet. Replaced in each feature's milestone.
export const PlaceholderPage = ({ title }: PlaceholderPageProps) => {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold">{title}</h1>
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-16 text-center">
        <Construction className="size-8 text-muted-foreground" />
        <p className="font-medium">Coming soon</p>
        <p className="text-sm text-muted-foreground">This page is being built.</p>
      </div>
    </div>
  )
}
