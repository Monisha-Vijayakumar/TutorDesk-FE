import axios, { AxiosError } from "axios"
import { ERROR_MESSAGES } from "@/api/errorMessages"
import { HTTP_STATUS } from "@/api/httpStatus"
import type { ApiError } from "@/api/interfaces/common"

// Shown when the BE doesn't send a message that can be shown for that status.
const STATUS_MESSAGES: Record<number, string> = {
  [HTTP_STATUS.BAD_REQUEST]: ERROR_MESSAGES.BAD_REQUEST,
  [HTTP_STATUS.UNAUTHORIZED]: ERROR_MESSAGES.SESSION_EXPIRED,
  [HTTP_STATUS.FORBIDDEN]: ERROR_MESSAGES.FORBIDDEN,
  [HTTP_STATUS.NOT_FOUND]: ERROR_MESSAGES.NOT_FOUND,
  [HTTP_STATUS.CONFLICT]: ERROR_MESSAGES.CONFLICT,
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: ERROR_MESSAGES.UNPROCESSABLE_ENTITY,
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: ERROR_MESSAGES.SERVER_ERROR,
  [HTTP_STATUS.BAD_GATEWAY]: ERROR_MESSAGES.BAD_GATEWAY,
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: ERROR_MESSAGES.SERVICE_UNAVAILABLE,
}

// Longer server messages are usually technical details rather than text written for users.
const MAX_SERVER_MESSAGE_LENGTH = 200

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null
}

// Field-level validation errors, in either shape the BE may send. Anything else is ignored.
const getFieldErrors = (responseData: unknown): Record<string, string> => {
  const fieldErrors: Record<string, string> = {}
  if (!isObject(responseData)) {
    return fieldErrors
  }

  const { errors } = responseData
  if (Array.isArray(errors)) {
    for (const fieldError of errors) {
      if (isObject(fieldError) && typeof fieldError.field === "string" && typeof fieldError.message === "string") {
        fieldErrors[fieldError.field] = fieldError.message
      }
    }
  } else if (isObject(errors)) {
    for (const [fieldName, message] of Object.entries(errors)) {
      if (typeof message === "string") {
        fieldErrors[fieldName] = message
      }
    }
  }
  return fieldErrors
}

// The BE's own message, only for 4xx responses: those explain what was wrong with the request
// (validation, duplicates…). 5xx messages can contain internal details, so they're never shown.
const getServerMessage = (responseData: unknown, status: number): string | undefined => {
  if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR || !isObject(responseData)) {
    return undefined
  }
  if (typeof responseData.message !== "string") {
    return undefined
  }

  const message = responseData.message.trim()
  return message && message.length <= MAX_SERVER_MESSAGE_LENGTH ? message : undefined
}

// Turns any failed request into one ApiError with a message for a toast. Every thunk uses it, so
// HTTP status handling lives in one place. Message order: the BE's message → statusMessages (an
// action's own text for a status, e.g. login 401) → the common text for the status → fallbackMessage.
export const getApiError = (
  error: unknown,
  fallbackMessage: string = ERROR_MESSAGES.GENERIC,
  statusMessages: Partial<Record<number, string>> = {}
): ApiError => {
  if (!axios.isAxiosError(error)) {
    return { status: null, message: fallbackMessage, fieldErrors: {} }
  }

  if (error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT) {
    return { status: null, message: ERROR_MESSAGES.TIMEOUT, fieldErrors: {} }
  }

  // The request went out but no response came back (offline, server down, blocked).
  if (!error.response) {
    return { status: null, message: ERROR_MESSAGES.NETWORK, fieldErrors: {} }
  }

  const { status, data } = error.response
  const message =
    getServerMessage(data, status) ?? statusMessages[status] ?? STATUS_MESSAGES[status] ?? fallbackMessage
  return { status, message, fieldErrors: getFieldErrors(data) }
}

// True when an ApiError (or any thunk rejection value) has this HTTP status, e.g. 404 or 409.
export const hasApiErrorStatus = (error: unknown, status: number): boolean => {
  return isObject(error) && error.status === status
}
