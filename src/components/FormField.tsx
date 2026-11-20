import { FormFieldError } from "@/components/FormFieldError"
import { RequiredMark } from "@/components/RequiredFieldMarkers"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormFieldProps } from "@/interfaces/form"
import { cn } from "@/lib/utils"

export const FormField = ({ id, label, error, hint, isRequired, className, ...inputProps }: FormFieldProps) => {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const hasError = Boolean(error)
  const isHintVisible = Boolean(hint) && !hasError

  let describedBy: string | undefined
  if (hasError) {
    describedBy = errorId
  } else if (isHintVisible) {
    describedBy = hintId
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="gap-1">
        {label}
        {isRequired && <RequiredMark />}
      </Label>
      <Input
        id={id}
        // Taller on phones for an easier tap target.
        className={cn("h-10 md:h-9", className)}
        aria-required={isRequired || undefined}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {isHintVisible && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      <FormFieldError id={errorId} error={error} />
    </div>
  )
}
