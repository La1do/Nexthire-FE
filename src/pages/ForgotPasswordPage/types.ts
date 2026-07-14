export type ForgotPasswordStep = 'request' | 'sent' | 'verify' | 'reset' | 'success'

export type ForgotPasswordRequestValues = {
  email: string
}

export type ResetPasswordFormValues = {
  confirmPassword: string
  password: string
}

export type ForgotPasswordRequestValidationMessages = {
  emailRequired: string
  emailInvalid: string
}

export type ResetPasswordValidationMessages = {
  confirmPasswordRequired: string
  passwordRequired: string
  passwordMinLength: string
  passwordMismatch: string
}
