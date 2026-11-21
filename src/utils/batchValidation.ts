import isAfter from "validator/es/lib/isAfter"
import isEmpty from "validator/es/lib/isEmpty"
import isLength from "validator/es/lib/isLength"
import isTime from "validator/es/lib/isTime"
import type { ApiError } from "@/api/interfaces/common"
import { IS_BATCH_TIME_REQUIRED, MAX_BATCH_DESCRIPTION_LENGTH, MAX_BATCH_NAME_LENGTH } from "@/constants/batches"
import { VALIDATION_MESSAGES } from "@/constants/validation"
import type { BatchFormValues } from "@/interfaces/batches"
import type { FormErrors } from "@/interfaces/form"
import { getFormErrorsFromApi, keepFieldErrors } from "@/utils/validation"

// isAfter compares dates, so both times are put on the same (any) day.
const TIME_COMPARISON_DATE = "2000-01-01"

const validateBatchName = (value: string): string | undefined => {
  if (isEmpty(value)) {
    return VALIDATION_MESSAGES.BATCH_NAME_REQUIRED
  }
  if (!isLength(value, { max: MAX_BATCH_NAME_LENGTH })) {
    return VALIDATION_MESSAGES.BATCH_NAME_TOO_LONG(MAX_BATCH_NAME_LENGTH)
  }
  return undefined
}

const validateTime = (value: string, requiredMessage: string): string | undefined => {
  if (isEmpty(value)) {
    return requiredMessage
  }
  if (!isTime(value)) {
    return VALIDATION_MESSAGES.TIME_INVALID
  }
  return undefined
}

// Batch Time is a start and an end time, or neither (while IS_BATCH_TIME_REQUIRED is false).
const validateBatchTime = (startTime: string, endTime: string): FormErrors<BatchFormValues> => {
  if (isEmpty(startTime) && isEmpty(endTime) && !IS_BATCH_TIME_REQUIRED) {
    return {}
  }

  const startTimeError = validateTime(startTime, VALIDATION_MESSAGES.BATCH_START_TIME_REQUIRED)
  const endTimeError = validateTime(endTime, VALIDATION_MESSAGES.BATCH_END_TIME_REQUIRED)
  if (startTimeError || endTimeError) {
    return { startTime: startTimeError, endTime: endTimeError }
  }

  const isEndAfterStart = isAfter(`${TIME_COMPARISON_DATE}T${endTime}`, `${TIME_COMPARISON_DATE}T${startTime}`)
  return isEndAfterStart ? {} : { endTime: VALIDATION_MESSAGES.BATCH_END_TIME_NOT_AFTER_START }
}

// Expects values that have already been through sanitizeFormValues. Only the name is required;
// description and students are optional.
export const validateBatchForm = (values: BatchFormValues): FormErrors<BatchFormValues> => {
  const fieldErrors: FormErrors<BatchFormValues> = {
    name: validateBatchName(values.name),
    description: isLength(values.description, { max: MAX_BATCH_DESCRIPTION_LENGTH })
      ? undefined
      : VALIDATION_MESSAGES.BATCH_DESCRIPTION_TOO_LONG(MAX_BATCH_DESCRIPTION_LENGTH),
    ...validateBatchTime(values.startTime, values.endTime),
  }

  return keepFieldErrors(fieldErrors)
}

// Field errors the API reports (400 / 422). The API calls the students field studentIds.
export const getBatchFormErrorsFromApi = (apiError: ApiError, values: BatchFormValues): FormErrors<BatchFormValues> => {
  return keepFieldErrors({
    ...getFormErrorsFromApi(apiError, values),
    students: apiError.fieldErrors.studentIds,
  })
}
