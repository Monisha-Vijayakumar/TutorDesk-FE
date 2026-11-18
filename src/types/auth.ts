export type Role = "admin" | "student"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  centerName?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupPayload {
  name: string
  email: string
  password: string
  centerName: string
  branch?: string
  city: string
  state: string
}
