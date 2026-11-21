import type { ChangeEvent, ComponentProps, Dispatch, SetStateAction } from "react"

// One optional error message per form field, e.g. { email: "Email is required." }
export type FormErrors<TFormValues> = Partial<Record<keyof TFormValues, string>>

// Names of the text fields of a form (the ones a <FormField> input can bind to).
export type TextFieldName<TFormValues> = {
  [TFieldName in keyof TFormValues]: TFormValues[TFieldName] extends string ? TFieldName : never
}[keyof TFormValues] &
  string

// Required fields show a red * after the label (RequiredMark). Optional fields have no marker —
// never write "(optional)" in a label.
export interface FormFieldProps extends ComponentProps<"input"> {
  id: string
  label: string
  error?: string
  hint?: string
  isRequired?: boolean
}

export interface FormFieldErrorProps {
  id: string
  error?: string
}

export interface FormTextareaFieldProps extends ComponentProps<"textarea"> {
  id: string
  label: string
  error?: string
  hint?: string
  isRequired?: boolean
}

// Props that connect a <FormField> or <FormTextareaField> to a value in the form.
export interface FormFieldBindings {
  id: string
  name: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
}

export interface UseFormResult<TFormValues> {
  formValues: TFormValues
  formErrors: FormErrors<TFormValues>
  setFormErrors: Dispatch<SetStateAction<FormErrors<TFormValues>>>
  // For non-text fields (selects, checkbox groups, switches).
  setFieldValue: <TFieldName extends keyof TFormValues>(fieldName: TFieldName, value: TFormValues[TFieldName]) => void
  getFieldProps: (fieldName: TextFieldName<TFormValues>) => FormFieldBindings
  resetForm: () => void
}

// isAlpha options for name and place fields (ALPHA_WITH_SPACES_OPTIONS / ALPHA_WITH_PUNCTUATION_OPTIONS).
export interface AlphaFieldOptions {
  ignore: string
}

export interface SelectOption {
  value: string
  label: string
}

export interface FormSelectFieldProps {
  id: string
  label: string
  value: string
  options: SelectOption[]
  placeholder: string
  onValueChange: (value: string) => void
  error?: string
  disabled?: boolean
  isRequired?: boolean
}

export interface FormCheckboxGroupProps {
  id: string
  label: string
  options: SelectOption[]
  selectedValues: string[]
  onSelectedValuesChange: (selectedValues: string[]) => void
  error?: string
  isRequired?: boolean
}
