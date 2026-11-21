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
// validator's blacklist puts these in a RegExp character class, so the dash must stay last
// (" -(" would be a character range, and dashes would never be removed).
export const PHONE_SEPARATORS = " ()-"

export const VALIDATION_MESSAGES = {
  // The login field shows only "Email" while the student portal is on hold (a Student ID still works).
  LOGIN_IDENTIFIER_REQUIRED: "Email is required.",
  LOGIN_IDENTIFIER_INVALID: "Enter a valid email address.",
  LETTERS_ONLY: "Only letters and spaces are allowed.",
  LETTERS_AND_PUNCTUATION_ONLY: "Only letters, spaces and . ' - are allowed.",
  NAME_REQUIRED: "Name is required.",
  EMAIL_REQUIRED: "Email is required.",
  EMAIL_INVALID: "Enter a valid email address.",
  PASSWORD_REQUIRED: "Password is required.",
  // Matches validator's isStrongPassword defaults.
  PASSWORD_TOO_WEAK: "Use at least 8 characters with an uppercase letter, a lowercase letter, a number and a symbol.",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match.",
  CURRENT_PASSWORD_REQUIRED: "Current password is required.",
  NEW_PASSWORD_REQUIRED: "New password is required.",
  CONFIRM_PASSWORD_REQUIRED: "Confirm your new password.",
  NEW_PASSWORD_SAME_AS_CURRENT: "New password must be different from the current password.",
  PHONE_REQUIRED: "Phone number is required.",
  MOBILE_NUMBER_INVALID: "Enter a valid 10-digit mobile number, e.g. +91 98765 43210.",
  ADDRESS_REQUIRED: "Address is required.",
  ADDRESS_TOO_LONG: (maxLength: number) => `Address can be at most ${maxLength} characters.`,
  FEE_DUE_DAY_REQUIRED: "Fee due day is required.",
  FEE_DUE_DAY_INVALID: (minDay: number, maxDay: number) => `Enter a day between ${minDay} and ${maxDay}.`,
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
  START_DATE_REQUIRED: "Start date is required.",
  END_DATE_REQUIRED: "End date is required.",
  END_DATE_IN_FUTURE: "End date can't be in the future.",
  START_DATE_TOO_EARLY: (years: number) => `Pick a start date within the last ${years} years.`,
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
  BATCH_NAME_REQUIRED: "Batch name is required.",
  BATCH_NAME_TOO_LONG: (maxLength: number) => `Batch name can be at most ${maxLength} characters.`,
  BATCH_DESCRIPTION_TOO_LONG: (maxLength: number) => `Description can be at most ${maxLength} characters.`,
  TIME_INVALID: "Enter a valid time.",
  BATCH_START_TIME_REQUIRED: "Enter a start time.",
  BATCH_END_TIME_REQUIRED: "Enter an end time.",
  BATCH_END_TIME_NOT_AFTER_START: "End time must be later than the start time.",
} as const
