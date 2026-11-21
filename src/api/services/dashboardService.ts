import { API_ENDPOINTS } from "@/api/apiEndpoints"
import type {
  DashboardService,
  DashboardStats,
  FeeCollection,
  FeeCollectionParams,
} from "@/api/interfaces/dashboard"
import { mockDashboardService } from "@/api/mocks/mockDashboardService"
import { IS_MOCK_API_ENABLED } from "@/constants/app"
import { api } from "./apiClient"

// All dashboard numbers in one request; the BE works them out with aggregation pipelines (FR-33).
const getDashboardStats = async (signal?: AbortSignal): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS, { signal })
  return response.data
}

// Payments received in a date range (the fee collection chart and its period filter).
const getFeeCollection = async (params: FeeCollectionParams, signal?: AbortSignal): Promise<FeeCollection> => {
  const response = await api.get<FeeCollection>(API_ENDPOINTS.DASHBOARD.FEE_COLLECTION, { params, signal })
  return response.data
}

const realDashboardService: DashboardService = {
  getDashboardStats,
  getFeeCollection,
}

// Worked out from the in-memory demo data in dev until tutordesk-be is ready (VITE_USE_MOCK_API=true).
export const dashboardService: DashboardService = IS_MOCK_API_ENABLED ? mockDashboardService : realDashboardService
