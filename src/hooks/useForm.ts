import { useState, type ChangeEvent } from "react"
import type { FormErrors, FormFieldBindings, UseFormResult } from "@/interfaces/form"

// Holds the values and errors of a form made of text inputs.
// Each input's `name` must match a key in the form values.
export const useForm = <TFormValues extends Record<keyof TFormValues, string>>(
  initialValues: TFormValues
): UseFormResult<TFormValues> => {
  const [formValues, setFormValues] = useState<TFormValues>(initialValues)
  const [formErrors, setFormErrors] = useState<FormErrors<TFormValues>>({})

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target
    setFormValues((previousValues) => ({ ...previousValues, [name]: value }))
  }

  const getFieldProps = (fieldName: keyof TFormValues & string): FormFieldBindings => {
    return {
      id: fieldName,
      name: fieldName,
      value: formValues[fieldName],
      onChange: handleInputChange,
      error: formErrors[fieldName],
    }
  }

  return { formValues, formErrors, setFormErrors, getFieldProps }
}
