import { FormFieldError } from "@/components/FormFieldError"
import { RequiredMark } from "@/components/RequiredFieldMarkers"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { FormTextareaFieldProps } from "@/interfaces/form"
import { cn } from "@/lib/utils"

// Multi-line version of FormField: same label, required marker, hint and inline error.
export const FormTextareaField = ({
  id,
  label,
  error,
  hint,
  isRequired,
  className,
  ...textareaProps
}: FormTextareaFieldProps) => {
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
      <Textarea
        id={id}
        className={cn("min-h-20", className)}
        aria-required={isRequired || undefined}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        {...textareaProps}
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
