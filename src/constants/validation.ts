// Options for validator's isAlpha on name and place fields.
export const ALPHA_LOCALE = "en-US"

// Person name, city, state: letters and spaces, e.g. "Ravi Kumar", "Tamil Nadu".
export const ALPHA_WITH_SPACES_OPTIONS = { ignore: " " }

// Center name, branch: letters, spaces and . ' - e.g. "St. Mary's Academy", "Navi-Mumbai".
export const ALPHA_WITH_PUNCTUATION_OPTIONS = { ignore: " .'-" }

// Student ID (studentCode) used for student login: "S" followed by 9 digits, e.g. S100000001.
export const STUDENT_CODE_PREFIX = "S"
export const STUDENT_CODE_DIGIT_COUNT = 9

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
} as const
