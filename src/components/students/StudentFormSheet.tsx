import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { StudentFormSheetProps } from "@/interfaces/students"
import { StudentForm } from "./StudentForm"

// Side panel with the add/edit student form. Full width on phones, a wide panel on larger screens.
// The panel's content unmounts when it closes, so each open starts with fresh form values.
export const StudentFormSheet = ({
  isOpen,
  student,
  onOpenChange,
  onStudentCreated,
  onStudentsChanged,
}: StudentFormSheetProps) => {
  const isNewStudent = student === null

  const closeSheet = (): void => onOpenChange(false)

  const handleSaved = (): void => {
    if (isNewStudent) {
      onStudentCreated()
    } else {
      onStudentsChanged()
    }
    closeSheet()
  }

  const handleStudentNotFound = (): void => {
    onStudentsChanged()
    closeSheet()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
        <SheetHeader className="border-b pr-12">
          <SheetTitle className="text-lg">{isNewStudent ? "Add Student" : "Edit Student"}</SheetTitle>
          <SheetDescription>
            {isNewStudent
              ? "Create a student account. The student logs in with the generated Student ID."
              : "Update the student's profile and enrollment details."}
          </SheetDescription>
        </SheetHeader>
        <StudentForm
          key={student?.id ?? "new"}
          student={student}
          onSaved={handleSaved}
          onCancel={closeSheet}
          onStudentNotFound={handleStudentNotFound}
        />
      </SheetContent>
    </Sheet>
  )
}
