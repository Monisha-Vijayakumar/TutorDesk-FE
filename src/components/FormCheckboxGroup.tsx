import { FormFieldError } from "@/components/FormFieldError"
import { RequiredMark } from "@/components/RequiredFieldMarkers"
import { Checkbox } from "@/components/ui/checkbox"
import type { FormCheckboxGroupProps } from "@/interfaces/form"
import { cn } from "@/lib/utils"

// Pick several options from a list, shown as large tappable tiles (works well on phones).
export const FormCheckboxGroup = ({
  id,
  label,
  options,
  selectedValues,
  onSelectedValuesChange,
  error,
  isRequired,
}: FormCheckboxGroupProps) => {
  const errorId = `${id}-error`
  const hasError = Boolean(error)

  const handleCheckedChange = (optionValue: string, isChecked: boolean): void => {
    const nextValues = isChecked
      ? [...selectedValues, optionValue]
      : selectedValues.filter((selectedValue) => selectedValue !== optionValue)
    onSelectedValuesChange(nextValues)
  }

  return (
    <fieldset
      id={id}
      className="flex flex-col gap-1.5"
      aria-invalid={hasError || undefined}
      aria-describedby={hasError ? errorId : undefined}
    >
      <legend className="mb-1.5 flex gap-1 text-sm leading-none font-medium">
        {label}
        {isRequired && <RequiredMark />}
        {/* A fieldset can't take aria-required, so screen readers get the word instead. */}
        {isRequired && <span className="sr-only">(required)</span>}
      </legend>
      <div className="grid grid-cols-1 gap-2 min-[400px]:grid-cols-2">
        {options.map((option) => {
          const isChecked = selectedValues.includes(option.value)

          return (
            <label
              key={option.value}
              className={cn(
                "flex min-h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors",
                isChecked ? "border-primary bg-muted" : "hover:bg-muted/50",
                hasError && "border-destructive/60"
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => handleCheckedChange(option.value, checked)}
              />
              {option.label}
            </label>
          )
        })}
      </div>
      <FormFieldError id={errorId} error={error} />
    </fieldset>
  )
}
