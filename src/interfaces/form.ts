import type { ChangeEvent, ComponentProps, Dispatch, SetStateAction } from "react"

// One optional error message per form field, e.g. { email: "Email is required." }
export type FormErrors<TFormValues> = Partial<Record<keyof TFormValues, string>>

export interface FormFieldProps extends ComponentProps<"input"> {
  id: string
  label: string
  error?: string
}

// Props that connect a <FormField> to a value in the form.
export interface FormFieldBindings {
  id: string
  name: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  error?: string
}

export interface UseFormResult<TFormValues> {
  formValues: TFormValues
  formErrors: FormErrors<TFormValues>
  setFormErrors: Dispatch<SetStateAction<FormErrors<TFormValues>>>
  getFieldProps: (fieldName: keyof TFormValues & string) => FormFieldBindings
}
