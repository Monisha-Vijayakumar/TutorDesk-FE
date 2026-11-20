import { CURRENCY_CODE, CURRENCY_LOCALE, PAISE_PER_RUPEE } from "@/constants/fees"

const currencyFormatter = new Intl.NumberFormat(CURRENCY_LOCALE, {
  style: "currency",
  currency: CURRENCY_CODE,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

// Paise (integer) → "₹2,500" / "₹1,00,000" / "₹916.50". Money is only converted for display.
export const formatCurrency = (amountInPaise: number): string => {
  return currencyFormatter.format(amountInPaise / PAISE_PER_RUPEE)
}

export const formatFullName =(firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`
}

// "Ravi Kumar Sharma" → "RK" (first letters of the first two words), used for avatars.
export const getInitials = (name: string): string => {
  const words = name.split(" ").filter((word) => word.length > 0)

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}
