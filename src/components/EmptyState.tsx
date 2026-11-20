import type { EmptyStateProps } from "@/interfaces/common"

// Used for "nothing here yet", "no results" and "couldn't load" messages.
export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-background px-4 py-12 text-center sm:py-16">
      <Icon className="size-8 text-muted-foreground" aria-hidden="true" />
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
