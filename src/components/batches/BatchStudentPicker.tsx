import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { AlertCircle } from "lucide-react"
import type { BatchStudent } from "@/api/interfaces/batch"
import type { StudentListParams } from "@/api/interfaces/student"
import { EmptyState } from "@/components/EmptyState"
import { FormCheckboxGroup } from "@/components/FormCheckboxGroup"
import { FormFieldError } from "@/components/FormFieldError"
import { SearchInput } from "@/components/SearchInput"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { STUDENT_PICKER_LIMIT } from "@/constants/batches"
import { SEARCH_DEBOUNCE_MS } from "@/constants/table"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import type { BatchStudentPickerProps } from "@/interfaces/batches"
import type { SelectOption } from "@/interfaces/form"
import { cn } from "@/lib/utils"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchStudentOptions,
  selectHasLoadedStudentOptions,
  selectIsStudentOptionsLoading,
  selectStudentOptions,
  selectStudentOptionsError,
  selectStudentOptionsTotal,
} from "@/store/studentSlice"
import { formatFullName } from "@/utils/format"

const SKELETON_ITEMS = [0, 1, 2]

const toStudentOption = (student: BatchStudent): SelectOption => ({
  value: student.id,
  label: `${formatFullName(student.firstName, student.lastName)} (${student.studentCode})`,
})

// Checkbox lists for assigning students to a batch: the assigned students (untick to remove) and the
// other students (tick to add), with a search box. Students come from the Students module
// (GET /students via fetchStudentOptions), searched on the server, at most STUDENT_PICKER_LIMIT at a time.
export const BatchStudentPicker = ({ selectedStudents, onSelectedStudentsChange, error }: BatchStudentPickerProps) => {
  const dispatch = useAppDispatch()
  const studentOptions = useAppSelector(selectStudentOptions)
  const studentOptionsTotal = useAppSelector(selectStudentOptionsTotal)
  const hasLoadedOptions = useAppSelector(selectHasLoadedStudentOptions)
  const isOptionsLoading = useAppSelector(selectIsStudentOptionsLoading)
  const optionsError = useAppSelector(selectStudentOptionsError)
  const [searchText, setSearchText] = useState("")
  const debouncedSearchText = useDebouncedValue(searchText.trim(), SEARCH_DEBOUNCE_MS)

  const optionsParams = useMemo(
    (): StudentListParams => ({ page: 1, limit: STUDENT_PICKER_LIMIT, search: debouncedSearchText || undefined }),
    [debouncedSearchText]
  )

  useEffect(() => {
    const request = dispatch(fetchStudentOptions(optionsParams))
    return () => request.abort()
  }, [dispatch, optionsParams])

  const reloadOptions = useCallback((): void => {
    dispatch(fetchStudentOptions(optionsParams))
  }, [dispatch, optionsParams])

  const selectedStudentIds = selectedStudents.map((student) => student.id)
  const availableStudents = studentOptions.filter((student) => !selectedStudentIds.includes(student.id))

  // Unticking an assigned student removes it.
  const handleAssignedChange = (studentIds: string[]): void => {
    onSelectedStudentsChange(selectedStudents.filter((student) => studentIds.includes(student.id)))
  }

  // Ticking an available student adds it (the group has nothing ticked, so the ids are the new ones).
  const handleAvailableChange = (studentIds: string[]): void => {
    const addedStudents = availableStudents
      .filter((student) => studentIds.includes(student.id))
      .map((student) => ({
        id: student.id,
        studentCode: student.studentCode,
        firstName: student.firstName,
        lastName: student.lastName,
      }))
    onSelectedStudentsChange([...selectedStudents, ...addedStudents])
  }

  const renderAvailableStudents = (): ReactNode => {
    if (optionsError) {
      return (
        <EmptyState
          icon={AlertCircle}
          title={optionsError}
          action={
            <Button variant="outline" size="lg" onClick={reloadOptions}>
              Try again
            </Button>
          }
        />
      )
    }

    if (!hasLoadedOptions) {
      return (
        <div className="flex flex-col gap-2" role="status" aria-label="Loading students">
          {SKELETON_ITEMS.map((item) => (
            <Skeleton key={item} className="h-10 w-full" />
          ))}
        </div>
      )
    }

    if (studentOptions.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          {debouncedSearchText
            ? "No students match your search."
            : "No students found. Add students on the Students page first."}
        </p>
      )
    }

    if (availableStudents.length === 0) {
      return <p className="text-sm text-muted-foreground">All students shown are already assigned.</p>
    }

    return (
      <FormCheckboxGroup
        id="availableStudents"
        label="Available students"
        options={availableStudents.map(toStudentOption)}
        selectedValues={[]}
        onSelectedValuesChange={handleAvailableChange}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {selectedStudents.length > 0 ? (
        <FormCheckboxGroup
          id="assignedStudents"
          label={`Assigned students (${selectedStudents.length})`}
          options={selectedStudents.map(toStudentOption)}
          selectedValues={selectedStudentIds}
          onSelectedValuesChange={handleAssignedChange}
        />
      ) : (
        <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">No students assigned yet.</p>
      )}
      <FormFieldError id="students-error" error={error} />

      <SearchInput
        id="batch-student-search"
        label="Find students"
        placeholder="Search by Student ID or Name"
        value={searchText}
        onValueChange={setSearchText}
      />

      <div
        className={cn("flex flex-col gap-2 transition-opacity", isOptionsLoading && hasLoadedOptions && "opacity-60")}
        aria-busy={isOptionsLoading}
      >
        {renderAvailableStudents()}
        {!optionsError && studentOptionsTotal > studentOptions.length && (
          <p className="text-xs text-muted-foreground">
            Showing {studentOptions.length} of {studentOptionsTotal} students. Search to find the others.
          </p>
        )}
      </div>
    </div>
  )
}
