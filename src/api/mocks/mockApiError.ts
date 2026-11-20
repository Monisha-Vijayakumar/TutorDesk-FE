import { AxiosError, AxiosHeaders } from "axios"
import type { ApiErrorResponse } from "@/api/interfaces/common"

// DEV ONLY — mock services throw the same kind of error axios throws for a failed response,
// so getApiError handles mock and real errors the same way.
export const createMockApiError = (status: number, message: string): AxiosError<ApiErrorResponse> => {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, null, {
    status,
    statusText: "",
    headers: {},
    config,
    data: { message },
  })
}
