import { useMemo, useState } from "react"
import type { FeeCollectionParams } from "@/api/interfaces/dashboard"
import { FEE_COLLECTION_PERIODS } from "@/constants/dashboard"
import type { FeeCollectionPeriod, FeeCollectionRangeValues, UseFeeCollectionRangeResult } from "@/interfaces/dashboard"
import { getDefaultCollectionRange, getPresetCollectionRange } from "@/utils/dashboard"
import { validateCollectionRange } from "@/utils/dashboardValidation"
import { hasValidationErrors } from "@/utils/validation"

// The fee collection period filter (Last 1 / 3 / 6 months or a custom range), turned into request
// params. Default: Last 1 month (this month). A custom range is only requested once it's valid.
export const useFeeCollectionRange = (): UseFeeCollectionRangeResult => {
  const [values, setValues] = useState<FeeCollectionRangeValues>(() => {
    const defaultRange = getDefaultCollectionRange()
    return { period: FEE_COLLECTION_PERIODS.LAST_1_MONTH, customFrom: defaultRange.from, customTo: defaultRange.to }
  })

  // Switching to Custom starts from the range that was showing, so the dates are filled in.
  const setPeriod = (period: FeeCollectionPeriod): void => {
    setValues((previousValues) => {
      if (period !== FEE_COLLECTION_PERIODS.CUSTOM || previousValues.period === FEE_COLLECTION_PERIODS.CUSTOM) {
        return { ...previousValues, period }
      }
      const shownRange = getPresetCollectionRange(previousValues.period)
      return { period, customFrom: shownRange.from, customTo: shownRange.to }
    })
  }

  const setCustomDate: UseFeeCollectionRangeResult["setCustomDate"] = (fieldName, value) => {
    setValues((previousValues) => ({ ...previousValues, [fieldName]: value }))
  }

  const errors = values.period === FEE_COLLECTION_PERIODS.CUSTOM ? validateCollectionRange(values) : {}
  const hasErrors = hasValidationErrors(errors)

  // Memoised: the chart loads in an effect keyed on this object.
  const params = useMemo((): FeeCollectionParams | null => {
    if (values.period !== FEE_COLLECTION_PERIODS.CUSTOM) {
      return getPresetCollectionRange(values.period)
    }
    return hasErrors ? null : { from: values.customFrom, to: values.customTo }
  }, [hasErrors, values.period, values.customFrom, values.customTo])

  return { values, setPeriod, setCustomDate, errors, params }
}
