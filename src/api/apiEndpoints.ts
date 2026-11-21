// Every backend endpoint the app calls lives here (REQUIREMENTS §7).
// Paths are relative to VITE_API_BASE_URL, which already ends in /api.

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    CURRENT_USER: "/auth/me",
    CHANGE_PASSWORD: "/auth/change-password",
    UPDATE_PROFILE: "/auth/profile",
  },
  STUDENTS: {
    LIST: "/students",
    DETAILS: (studentId: string) => `/students/${studentId}`,
    // Payment transactions and payment reminders for one student, all months.
    PAYMENT_HISTORY: (studentId: string) => `/students/${studentId}/payment-history`,
    RESET_PASSWORD: (studentId: string) => `/students/${studentId}/reset-password`,
  },
  BATCHES: {
    LIST: "/batches",
    DETAILS: (batchId: string) => `/batches/${batchId}`,
    // Distinct start/end times of the batches, for the Batch Time filter.
    TIME_SLOTS: "/batches/time-slots",
  },
  // One fee record per student per month (REQUIREMENTS §4.5).
  FEES: {
    LIST: "/fees",
    DETAILS: (feeId: string) => `/fees/${feeId}`,
    REMINDERS: (feeId: string) => `/fees/${feeId}/reminders`,
  },
  DASHBOARD: {
    STATS: "/dashboard/stats",
    FEE_COLLECTION: "/dashboard/fee-collection",
  },
  STUDENT_PORTAL: {
    SUMMARY: "/me/summary",
    FEES: "/me/fees",
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_AS_READ: (notificationId: string) => `/notifications/${notificationId}/read`,
    MARK_ALL_AS_READ: "/notifications/read-all",
  },
} as const
