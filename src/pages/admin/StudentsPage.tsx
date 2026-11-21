import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertCircle, SearchX, UserPlus, Users } from "lucide-react"
import type { Student } from "@/api/interfaces/student"
import { EmptyState } from "@/components/EmptyState"
import { PageHeader } from "@/components/PageHeader"
import { PaymentSearchFilters } from "@/components/PaymentSearchFilters"
import { DeleteStudentDialog } from "@/components/students/DeleteStudentDialog"
import { StudentFormSheet } from "@/components/students/StudentFormSheet"
import { StudentMobileCard } from "@/components/students/StudentMobileCard"
import { getStudentTableColumns } from "@/components/students/studentTableColumns"
import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { ADMIN_PAGE_TITLES } from "@/constants/navigation"
import { usePaymentSearchFilters } from "@/hooks/usePaymentSearchFilters"
import type { StudentFormSheetState } from "@/interfaces/students"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchStudents,
  selectHasLoadedStudentList,
  selectIsStudentListLoading,
  selectStudentListError,
  selectStudents,
  selectStudentTotal,
} from "@/store/studentSlice"

const CLOSED_FORM_SHEET: StudentFormSheetState = { isOpen: false, student: null }

const getStudentRowId = (student: Student): string => student.id

export const StudentsPage = () => {
  const dispatch = useAppDispatch()
  const {
    filters,
    pagination,
    setPagination,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    dateRangeError,
    searchParams,
  } = usePaymentSearchFilters()
  const students = useAppSelector(selectStudents)
  const totalStudents = useAppSelector(selectStudentTotal)
  const hasLoadedList = useAppSelector(selectHasLoadedStudentList)
  const isListLoading = useAppSelector(selectIsStudentListLoading)
  const listError = useAppSelector(selectStudentListError)

  const [formSheet, setFormSheet] = useState<StudentFormSheetState>(CLOSED_FORM_SHEET)
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)

  // Load the list whenever the search, filters or page change. The previous request is aborted,
  // so a slow older response can't replace newer results.
  useEffect(() => {
    const request = dispatch(fetchStudents(searchParams))
    return () => request.abort()
  }, [dispatch, searchParams])

  const reloadStudents = useCallback((): void => {
    dispatch(fetchStudents(searchParams))
  }, [dispatch, searchParams])

  const columns = useMemo(
    () =>
      getStudentTableColumns({
        onEdit: (student) => setFormSheet({ isOpen: true, student }),
        onDelete: setStudentToDelete,
      }),
    []
  )

  const openAddStudentForm = (): void => {
    setFormSheet({ isOpen: true, student: null })
  }

  const handleFormSheetOpenChange = (isOpen: boolean): void => {
    setFormSheet((previousState) => ({ ...previousState, isOpen }))
  }

  // New students are listed first, so show page 1 where the new record appears
  // (changing the page reloads the list; on page 1 already, reload it here).
  const handleStudentCreated = (): void => {
    if (pagination.pageIndex === 0) {
      reloadStudents()
      return
    }
    setPagination((previousPagination) => ({ ...previousPagination, pageIndex: 0 }))
  }

  // Deleting the only row on a later page would leave an empty page; go back one instead.
  const handleStudentDeleted = (): void => {
    setStudentToDelete(null)
    if (students.length === 1 && pagination.pageIndex > 0) {
      setPagination((previousPagination) => ({ ...previousPagination, pageIndex: previousPagination.pageIndex - 1 }))
      return
    }
    reloadStudents()
  }

  const addStudentButton = (
    <Button size="lg" className="w-full sm:w-auto" onClick={openAddStudentForm}>
      <UserPlus />
      Add Student
    </Button>
  )

  const emptyState = hasActiveFilters ? (
    <EmptyState
      icon={SearchX}
      title="No students match your search or filters."
      action={
        <Button variant="outline" size="lg" onClick={resetFilters}>
          Clear filters
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={Users}
      title="No students found."
      description="Add your first student to start tracking batches and fees."
      action={addStudentButton}
    />
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={ADMIN_PAGE_TITLES.STUDENTS}
        description="Manage student profiles, enrollment details, and payment information."
        action={addStudentButton}
      />

      <PaymentSearchFilters
        filters={filters}
        dateRangeError={dateRangeError}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={updateFilter}
        onReset={resetFilters}
      />

      {listError ? (
        <EmptyState
          icon={AlertCircle}
          title={listError}
          action={
            <Button variant="outline" size="lg" onClick={reloadStudents}>
              Try again
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={columns}
          data={students}
          rowCount={totalStudents}
          pagination={pagination}
          onPaginationChange={setPagination}
          getRowId={getStudentRowId}
          renderMobileCard={(student) => (
            <StudentMobileCard
              student={student}
              onEdit={(selectedStudent) => setFormSheet({ isOpen: true, student: selectedStudent })}
              onDelete={setStudentToDelete}
            />
          )}
          isLoading={!hasLoadedList}
          isFetching={isListLoading}
          emptyState={emptyState}
        />
      )}

      <StudentFormSheet
        isOpen={formSheet.isOpen}
        student={formSheet.student}
        onOpenChange={handleFormSheetOpenChange}
        onStudentCreated={handleStudentCreated}
        onStudentsChanged={reloadStudents}
      />

      <DeleteStudentDialog
        student={studentToDelete}
        onClose={() => setStudentToDelete(null)}
        onDeleted={handleStudentDeleted}
      />
    </div>
  )
}
