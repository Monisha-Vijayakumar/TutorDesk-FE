// Options for validator's isAlpha on name and place fields.
export const ALPHA_LOCALE = "en-US"

// Person name, city, state: letters and spaces, e.g. "Ravi Kumar", "Tamil Nadu".
export const ALPHA_WITH_SPACES_OPTIONS = { ignore: " " }

// Center name, branch: letters, spaces and . ' - e.g. "St. Mary's Academy", "Navi-Mumbai".
export const ALPHA_WITH_PUNCTUATION_OPTIONS = { ignore: " .'-" }

// Student ID (studentCode) used for student login: "S" followed by 9 digits, e.g. S100000001.
export const STUDENT_CODE_PREFIX = "S"
export const STUDENT_CODE_DIGIT_COUNT = 9

// Phone numbers are checked as Indian mobile numbers (optional +91 / 0 prefix).
// Spaces, dashes and brackets people type are removed before checking and saving.
export const PHONE_LOCALE = "en-IN"
export const PHONE_SEPARATORS = " -()"

export const VALIDATION_MESSAGES = {
  LOGIN_IDENTIFIER_REQUIRED: "Email or Student ID is required.",
  LOGIN_IDENTIFIER_INVALID: "Enter a valid email or Student ID (e.g. S100000001).",
  LETTERS_ONLY: "Only letters and spaces are allowed.",
  LETTERS_AND_PUNCTUATION_ONLY: "Only letters, spaces and . ' - are allowed.",
  NAME_REQUIRED: "Name is required.",
  EMAIL_REQUIRED: "Email is required.",
  EMAIL_INVALID: "Enter a valid email address.",
  PASSWORD_REQUIRED: "Password is required.",
  // Matches validator's isStrongPassword defaults.
  PASSWORD_TOO_WEAK: "Use at least 8 characters with an uppercase letter, a lowercase letter, a number and a symbol.",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match.",
  CENTER_NAME_REQUIRED: "Center name is required.",
  CITY_REQUIRED: "City is required.",
  STATE_REQUIRED: "State is required.",
  FIRST_NAME_REQUIRED: "First name is required.",
  LAST_NAME_REQUIRED: "Last name is required.",
  EMAIL_TAKEN: "Another student already uses this email.",
  PARENT_NAME_REQUIRED: "Parent name is required.",
  PARENT_PHONE_REQUIRED: "Parent WhatsApp number is required.",
  PHONE_INVALID: "Enter a valid 10-digit WhatsApp number, e.g. +91 98765 43210.",
  GRADE_REQUIRED: "Select a class.",
  SUBJECTS_REQUIRED: "Select at least one subject.",
  MONTHLY_FEE_REQUIRED: "Monthly fee is required.",
  MONTHLY_FEE_INVALID: "Enter a whole amount between ₹1 and ₹1,00,000.",
  JOIN_DATE_REQUIRED: "Join date is required.",
  DATE_INVALID: "Enter a valid date.",
  DATE_RANGE_INVALID: "Start date can't be later than end date.",
  TOTAL_FEE_REQUIRED: "Total fee is required.",
  TOTAL_FEE_INVALID: "Enter a whole amount between ₹0 and ₹1,00,000.",
  TOTAL_FEE_BELOW_PAID: (paidAmount: string) => `Total fee can't be less than the ${paidAmount} already paid.`,
  DUE_DATE_REQUIRED: "Due date is required.",
  PAYMENT_AMOUNT_INVALID: "Enter a whole amount of at least ₹1.",
  PAYMENT_AMOUNT_TOO_HIGH: (outstandingAmount: string) =>
    `Amount can't be more than the outstanding ${outstandingAmount}.`,
  PAYMENT_DATE_REQUIRED: "Payment date is required when you enter an amount.",
  PAYMENT_DATE_IN_FUTURE: "Payment date can't be in the future.",
  PAYMENT_METHOD_REQUIRED: "Payment method is required when you enter an amount.",
} as const
