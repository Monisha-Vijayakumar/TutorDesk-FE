import { Construction } from "lucide-react"
import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import type { PlaceholderPageProps } from "@/interfaces/common"

// Temporary page for admin sections that are not built yet. Replaced in each feature's milestone.
export const PlaceholderPage = ({ title }: PlaceholderPageProps) => {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} />
      <EmptyState icon={Construction} title="Coming soon" description="This page is being built." />
    </div>
  )
}
