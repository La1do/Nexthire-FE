export type RegisterRole = 'candidate' | 'employer'

export type RegisterFormValues = {
  confirmPassword: string
  email: string
  password: string
  role: RegisterRole
}

export type RegisterValidationMessages = {
  confirmPasswordRequired: string
  emailRequired: string
  emailInvalid: string
  passwordRequired: string
  passwordMinLength: string
  passwordMismatch: string
}
