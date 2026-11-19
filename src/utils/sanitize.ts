import stripLow from "validator/es/lib/stripLow"

// Removes invisible control characters and surrounding spaces from every field
// of a form, except the ones listed in fieldsToSkip (e.g. passwords, which are
// sent exactly as typed). Field-specific changes such as lower-casing an email
// are done where the payload is built.
// We don't HTML-escape: React escapes on render, and escaping would change the saved data.
export const sanitizeFormValues = <TFormValues extends Record<keyof TFormValues, string>>(
  values: TFormValues,
  fieldsToSkip: (keyof TFormValues)[] = []
): TFormValues => {
  const sanitizedValues = { ...values }

  for (const fieldName in values) {
    if (fieldsToSkip.includes(fieldName)) {
      continue
    }
    sanitizedValues[fieldName] = stripLow(values[fieldName]).trim() as TFormValues[typeof fieldName]
  }

  return sanitizedValues
}
