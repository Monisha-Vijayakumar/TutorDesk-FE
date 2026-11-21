import type { BatchTimeSlot } from "@/api/interfaces/batch"
import { ALL_BATCH_TIMES, BATCH_TIME_SLOT_SEPARATOR } from "@/constants/batches"
import type { SelectOption } from "@/interfaces/form"
import { formatTimeOfDay } from "@/utils/date"

// "09:00", "10:00" → "09:00 AM – 10:00 AM"; null when the batch has no time.
export const formatBatchTime = (startTime: string | null, endTime: string | null): string | null => {
  if (!startTime || !endTime) {
    return null
  }
  return `${formatTimeOfDay(startTime)} – ${formatTimeOfDay(endTime)}`
}

// A time slot as one Select value ("09:00-10:00") and back. "All Batch Times" gives null.
const getBatchTimeSlotValue = (timeSlot: BatchTimeSlot): string => {
  return `${timeSlot.startTime}${BATCH_TIME_SLOT_SEPARATOR}${timeSlot.endTime}`
}

export const parseBatchTimeSlotValue = (value: string): BatchTimeSlot | null => {
  if (value === ALL_BATCH_TIMES) {
    return null
  }
  const [startTime, endTime] = value.split(BATCH_TIME_SLOT_SEPARATOR)
  return { startTime, endTime }
}

// Filter options: "All Batch Times", then the times in use. The selected time stays in the list even
// if no batch uses it any more (e.g. after an edit), so the dropdown never shows an unknown value.
export const getBatchTimeSlotOptions = (timeSlots: BatchTimeSlot[], selectedValue: string): SelectOption[] => {
  const options = timeSlots.map((timeSlot) => ({
    value: getBatchTimeSlotValue(timeSlot),
    label: formatBatchTime(timeSlot.startTime, timeSlot.endTime) ?? "",
  }))

  const selectedTimeSlot = parseBatchTimeSlotValue(selectedValue)
  const isSelectedListed = options.some((option) => option.value === selectedValue)
  if (selectedTimeSlot && !isSelectedListed) {
    options.push({
      value: selectedValue,
      label: formatBatchTime(selectedTimeSlot.startTime, selectedTimeSlot.endTime) ?? "",
    })
  }

  return [{ value: ALL_BATCH_TIMES, label: "All Batch Times" }, ...options]
}
