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
    PAYMENTS: (studentId: string) => `/students/${studentId}/payments`,
    RESET_PASSWORD: (studentId: string) => `/students/${studentId}/reset-password`,
  },
  BATCHES: {
    LIST: "/batches",
    DETAILS: (batchId: string) => `/batches/${batchId}`,
    STUDENTS: (batchId: string) => `/batches/${batchId}/students`,
    STUDENT: (batchId: string, studentId: string) => `/batches/${batchId}/students/${studentId}`,
  },
  ATTENDANCE: {
    LIST: "/attendance",
  },
  FEES: {
    LIST: "/fees",
  },
  PAYMENTS: {
    LIST: "/payments",
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
