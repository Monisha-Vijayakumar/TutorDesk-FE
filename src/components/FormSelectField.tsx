import { FormFieldError } from "@/components/FormFieldError"
import { RequiredMark } from "@/components/RequiredFieldMarkers"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FormSelectFieldProps } from "@/interfaces/form"

// Labelled dropdown with an inline error. An empty string value means "nothing selected".
export const FormSelectField = ({
  id,
  label,
  value,
  options,
  placeholder,
  onValueChange,
  error,
  disabled,
  isRequired,
}: FormSelectFieldProps) => {
  const errorId = `${id}-error`
  const hasError = Boolean(error)

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="gap-1">
        {label}
        {isRequired && <RequiredMark />}
      </Label>
      <Select
        items={options}
        value={value || null}
        onValueChange={(selectedValue) => onValueChange(selectedValue ?? "")}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          // The trigger sets its height with data-[size=default]; override it the same way (40px on phones).
          className="w-full data-[size=default]:h-10 md:data-[size=default]:h-9"
          aria-required={isRequired || undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormFieldError id={errorId} error={error} />
    </div>
  )
}
