import type { SelectOption } from "@/interfaces/form"

export const GRADE_OPTIONS: SelectOption[] = Array.from({ length: 12 }, (_, index) => {
  const grade = `Class ${index + 1}`
  return { value: grade, label: grade }
})

// Subjects the center teaches. Fixed list for now — see Open Questions in CLAUDE.md (may move to Settings).
export const SUBJECT_OPTIONS: SelectOption[] = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Tamil",
  "Social Science",
  "Computer Science",
  "Accountancy",
  "Economics",
].map((subject) => ({ value: subject, label: subject }))

// Subjects shown as badges in a table row before "+N more".
export const MAX_VISIBLE_SUBJECTS = 2

export const MAX_MONTHLY_FEE_RUPEES = 100000
