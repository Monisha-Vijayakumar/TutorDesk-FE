import { useEffect, useState } from "react"

// Returns the value only after it has stopped changing for delayMs,
// e.g. so a search request fires when the user stops typing, not on every key.
export const useDebouncedValue = <TValue>(value: TValue, delayMs: number): TValue => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(timeoutId)
  }, [value, delayMs])

  return debouncedValue
}
