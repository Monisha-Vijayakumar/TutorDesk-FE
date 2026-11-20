import blacklist from "validator/es/lib/blacklist"
import type {
  CreateStudentPayload,
  Student,
  StudentDetailsPayload,
  UpdateStudentPayload,
} from "@/api/interfaces/student"
import { PAISE_PER_RUPEE } from "@/constants/fees"
import { PHONE_SEPARATORS } from "@/constants/validation"
import type { StudentFormValues } from "@/interfaces/students"
import { getTodayIsoDate } from "@/utils/date"

export const getEmptyStudentFormValues = (): StudentFormValues => {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    parentName: "",
    parentPhone: "",
    grade: "",
    subjects: [],
    monthlyFee: "",
    joinDate: getTodayIsoDate(),
    password: "",
  }
}

// Pre-fills the edit form. The password is never sent back by the API, so it stays empty.
export const getStudentFormValues = (student: Student): StudentFormValues => {
  return {
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email ?? "",
    phone: student.phone,
    parentName: student.parentName,
    parentPhone: student.parentPhone,
    grade: student.grade,
    subjects: student.subjects,
    monthlyFee: String(student.monthlyFee / PAISE_PER_RUPEE),
    joinDate: student.joinDate,
    password: "",
  }
}

// Expects values that have already been through sanitizeFormValues and validation.
const buildStudentDetailsPayload = (values: StudentFormValues): StudentDetailsPayload => {
  const parentPhone = blacklist(values.parentPhone, PHONE_SEPARATORS)

  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email.toLowerCase() || null,
    // The phone number is optional: when it's left empty, the parent's phone is used for the student too.
    phone: blacklist(values.phone, PHONE_SEPARATORS) || parentPhone,
    parentName: values.parentName,
    parentPhone,
    grade: values.grade,
    subjects: values.subjects,
    // Validated as a whole number of rupees, so this stays an integer.
    monthlyFee: Number(values.monthlyFee) * PAISE_PER_RUPEE,
    joinDate: values.joinDate,
  }
}

export const buildCreateStudentPayload = (values: StudentFormValues): CreateStudentPayload => {
  return { ...buildStudentDetailsPayload(values), password: values.password }
}

export const buildUpdateStudentPayload = (values: StudentFormValues): UpdateStudentPayload => {
  return buildStudentDetailsPayload(values)
}
