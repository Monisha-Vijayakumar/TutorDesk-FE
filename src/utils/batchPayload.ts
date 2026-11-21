import type { Batch, BatchPayload } from "@/api/interfaces/batch"
import type { BatchFormValues } from "@/interfaces/batches"

export const getEmptyBatchFormValues = (): BatchFormValues => {
  return {
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    students: [],
  }
}

// Pre-fills the edit form, with the assigned students already selected.
export const getBatchFormValues = (batch: Batch): BatchFormValues => {
  return {
    name: batch.name,
    description: batch.description ?? "",
    startTime: batch.startTime ?? "",
    endTime: batch.endTime ?? "",
    students: batch.students,
  }
}

// Expects values that have already been through sanitizeFormValues and validation. Used for add and
// edit: every field is sent, and an emptied optional field is sent as null so the BE clears it.
export const buildBatchPayload = (values: BatchFormValues): BatchPayload => {
  return {
    name: values.name,
    description: values.description || null,
    startTime: values.startTime || null,
    endTime: values.endTime || null,
    studentIds: [...new Set(values.students.map((student) => student.id))],
  }
}
