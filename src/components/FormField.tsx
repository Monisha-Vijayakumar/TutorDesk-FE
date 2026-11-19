import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormFieldProps } from "@/interfaces/form"

export const FormField = ({ id, label, error, ...inputProps }: FormFieldProps) => {
  const errorId = `${id}-error`
  const hasError = Boolean(error)

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        {...inputProps}
      />
      {hasError && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
