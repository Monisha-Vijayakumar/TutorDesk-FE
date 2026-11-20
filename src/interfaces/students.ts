import type { Student } from "@/api/interfaces/student"

// API shapes (Student, payloads, list params, StudentService) live in @/api/interfaces/student.

export interface StudentFormValues {
  firstName: string
  lastName: string
  email: string
  phone: string
  parentName: string
  parentPhone: string
  grade: string
  subjects: string[]
  monthlyFee: string // whole rupees as typed
  joinDate: string // "YYYY-MM-DD"
  password: string // add form only
}

// Redux state of the Students list (studentSlice): the page of students currently shown.
export interface StudentState {
  students: Student[]
  total: number // matching students across all pages
  hasLoadedList: boolean // false until the first list arrives (skeleton until then)
  isListLoading: boolean
  listError: string | null // message of the last failed list request
  // The latest list request; responses of older ones (filters changed meanwhile) are ignored.
  listRequestId: string | null
}

// Search/filter types shared with the Fees page live in @/interfaces/filters.

export interface StudentActionHandlers {
  onEdit: (student: Student) => void
  onDelete: (student: Student) => void
}

export interface StudentMobileCardProps extends StudentActionHandlers {
  student: Student
}

// Add form when student is null, edit form otherwise.
export interface StudentFormSheetState {
  isOpen: boolean
  student: Student | null
}

export interface StudentFormSheetProps {
  isOpen: boolean
  student: Student | null
  onOpenChange: (isOpen: boolean) => void
  onStudentCreated: () => void
  // An edit was saved, or the student turned out to be deleted: the list needs reloading.
  onStudentsChanged: () => void
}

export interface StudentFormProps {
  student: Student | null
  onSaved: () => void
  onCancel: () => void
  onStudentNotFound: () => void // the student was deleted elsewhere while the form was open
}

export interface DeleteStudentDialogProps {
  student: Student | null
  onClose: () => void
  onDeleted: () => void // also called when the student was already deleted elsewhere
}
