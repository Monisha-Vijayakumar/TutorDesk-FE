import { useState, type ChangeEvent } from "react"
import type { FormErrors, FormFieldBindings, TextFieldName, UseFormResult } from "@/interfaces/form"

// Holds the values and errors of a form. Text inputs bind with getFieldProps (each input's
// `name` must match a key in the form values); selects, checkbox groups and switches use setFieldValue.
export const useForm = <TFormValues extends object>(initialValues: TFormValues): UseFormResult<TFormValues> => {
  const [formValues, setFormValues] = useState<TFormValues>(initialValues)
  const [formErrors, setFormErrors] = useState<FormErrors<TFormValues>>({})

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target
    setFormValues((previousValues) => ({ ...previousValues, [name]: value }))
  }

  const setFieldValue = <TFieldName extends keyof TFormValues>(
    fieldName: TFieldName,
    value: TFormValues[TFieldName]
  ): void => {
    setFormValues((previousValues) => ({ ...previousValues, [fieldName]: value }))
  }

  const getFieldProps = (fieldName: TextFieldName<TFormValues>): FormFieldBindings => {
    return {
      id: fieldName,
      name: fieldName,
      value: String(formValues[fieldName]),
      onChange: handleInputChange,
      error: formErrors[fieldName],
    }
  }

  return { formValues, formErrors, setFormErrors, setFieldValue, getFieldProps }
}
