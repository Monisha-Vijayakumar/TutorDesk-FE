export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Logged in successfully.",
  LOGOUT_SUCCESS: "You have been logged out.",
  PROFILE_UPDATED: "Profile updated.",
  PASSWORD_CHANGED: "Password updated.",
  // The admin needs the generated Student ID to share it with the student.
  STUDENT_CREATED: (studentCode: string) => `Student added. Student ID: ${studentCode}`,
  STUDENT_UPDATED: "Student details updated.",
  STUDENT_DELETED: "Student deleted.",
  FEE_UPDATED: "Payment details saved.",
  PAYMENT_RECORDED: (amount: string) => `Payment of ${amount} recorded.`,
  // Opening WhatsApp doesn't send anything — the admin still has to press Send there.
  BATCH_CREATED: "Batch added.",
  BATCH_UPDATED: "Batch updated.",
  BATCH_DELETED: "Batch deleted.",
  REMINDER_INITIATED: "WhatsApp opened with the reminder. Press Send in WhatsApp to deliver it.",
} as const
