import type { AuthFormRole } from '../../lib/auth/authRole'

export type RegisterRole = AuthFormRole

export type RegisterFormValues = {
  confirmPassword: string
  email: string
  fullName: string
  password: string
  phone: string
  role: RegisterRole
}

export type RegisterValidationMessages = {
  confirmPasswordRequired: string
  emailRequired: string
  emailInvalid: string
  fullNameRequired: string
  fullNameMinLength: string
  phoneRequired: string
  phoneMinLength: string
  passwordRequired: string
  passwordMinLength: string
  passwordMismatch: string
}
