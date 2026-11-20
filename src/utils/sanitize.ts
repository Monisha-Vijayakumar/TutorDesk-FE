import stripLow from "validator/es/lib/stripLow"

// Removes invisible control characters and surrounding spaces from every text field
// of a form, except the ones listed in fieldsToSkip (e.g. passwords, which are
// sent exactly as typed). Non-text fields (checkbox lists, switches) come from fixed
// options and are returned as they are. Field-specific changes such as lower-casing
// an email are done where the payload is built.
// We don't HTML-escape: React escapes on render, and escaping would change the saved data.
export const sanitizeFormValues = <TFormValues extends object>(
  values: TFormValues,
  fieldsToSkip: (keyof TFormValues)[] = []
): TFormValues => {
  const sanitizedValues = { ...values }

  for (const fieldName in values) {
    const value = values[fieldName]
    if (typeof value !== "string" || fieldsToSkip.includes(fieldName)) {
      continue
    }
    sanitizedValues[fieldName] = stripLow(value).trim() as TFormValues[typeof fieldName]
  }

  return sanitizedValues
}
