// "Ravi Kumar Sharma" → "RK" (first letters of the first two words), used for avatars.
export const getInitials = (name: string): string => {
  const words = name.split(" ").filter((word) => word.length > 0)

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}
