import { useState } from "react"
import { toast } from "sonner"
import { getApiError, hasApiErrorStatus } from "@/api/apiErrorHandler"
import { HTTP_STATUS } from "@/api/httpStatus"
import { SUCCESS_MESSAGES } from "@/api/successMessages"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import type { DeleteStudentDialogProps } from "@/interfaces/students"
import { useAppDispatch } from "@/store/hooks"
import { deleteStudent } from "@/store/studentSlice"
import { formatFullName } from "@/utils/format"

// Confirms before deleting. Deleting is how a student who has discontinued is removed: the BE
// soft-deletes (record and payment/attendance history stay in the DB), and the student
// disappears from the list and can no longer log in.
export const DeleteStudentDialog = ({ student, onClose, onDeleted }: DeleteStudentDialogProps) => {
  const dispatch = useAppDispatch()
  const [isDeleting, setIsDeleting] = useState(false)

  const studentLabel = student
    ? `${formatFullName(student.firstName, student.lastName)} (${student.studentCode})`
    : "this student"

  const handleConfirm = async (): Promise<void> => {
    if (!student) {
      return
    }

    setIsDeleting(true)
    const result = await dispatch(deleteStudent(student.id))
    setIsDeleting(false)

    if (deleteStudent.fulfilled.match(result)) {
      toast.success(SUCCESS_MESSAGES.STUDENT_DELETED)
      onDeleted()
      return
    }

    const apiError = result.payload ?? getApiError(result.error)
    toast.error(apiError.message)
    // Already deleted elsewhere: the end result is the same, so close and reload the list.
    if (hasApiErrorStatus(apiError, HTTP_STATUS.NOT_FOUND)) {
      onDeleted()
    }
  }

  const handleOpenChange = (isOpen: boolean): void => {
    if (!isOpen && !isDeleting) {
      onClose()
    }
  }

  return (
    <ConfirmDialog
      isOpen={student !== null}
      title="Delete Student?"
      description={`Are you sure you want to delete ${studentLabel}? This action cannot be undone.`}
      confirmLabel="Delete"
      pendingLabel="Deleting…"
      isPending={isDeleting}
      onConfirm={handleConfirm}
      onOpenChange={handleOpenChange}
    />
  )
}
