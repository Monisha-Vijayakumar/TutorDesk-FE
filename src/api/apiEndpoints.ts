// Every backend endpoint the app calls lives here (REQUIREMENTS §7).
// Paths are relative to VITE_API_BASE_URL, which already ends in /api.

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    CURRENT_USER: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
  },
  STUDENTS: {
    LIST: "/students",
    DETAILS: (studentId: string) => `/students/${studentId}`,
    // Payment transactions and payment reminders for one student, all months.
    PAYMENT_HISTORY: (studentId: string) => `/students/${studentId}/payment-history`,
    RESET_PASSWORD: (studentId: string) => `/students/${studentId}/reset-password`,
  },
  ATTENDANCE: {
    LIST: "/attendance",
  },
  // One fee record per student per month (REQUIREMENTS §4.5).
  FEES: {
    LIST: "/fees",
    DETAILS: (feeId: string) => `/fees/${feeId}`,
    REMINDERS: (feeId: string) => `/fees/${feeId}/reminders`,
  },
  DASHBOARD: {
    STATS: "/dashboard/stats",
  },
  STUDENT_PORTAL: {
    SUMMARY: "/me/summary",
    ATTENDANCE: "/me/attendance",
    FEES: "/me/fees",
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_AS_READ: (notificationId: string) => `/notifications/${notificationId}/read`,
    MARK_ALL_AS_READ: "/notifications/read-all",
  },
  SETTINGS: {
    UPDATE: "/settings",
  },
} as const
