import type { FormFieldErrorProps } from "@/interfaces/form"

// Inline error under a form field. The id is referenced by the field's aria-describedby.
export const FormFieldError = ({ id, error }: FormFieldErrorProps) => {
  if (!error) {
    return null
  }

  return (
    <p id={id} className="text-xs text-destructive">
      {error}
    </p>
  )
}
