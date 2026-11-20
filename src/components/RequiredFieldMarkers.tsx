// How required form fields are marked (NFR-24). Both live here so the marker and its explanation
// always match.

// Red asterisk after the label of a required field. Hidden from screen readers:
// the field itself carries aria-required, so "required" isn't read twice.
export const RequiredMark = () => {
  return (
    <span className="text-destructive" aria-hidden="true">
      *
    </span>
  )
}

// Shown at the top of every form that has required fields, so the red * is explained the same way everywhere.
export const RequiredFieldsNote = () => {
  return (
    <p className="text-xs text-muted-foreground">
      Fields marked <RequiredMark /> are required.
    </p>
  )
}
