import type { AuthFormRole } from '../../lib/auth/authRole'

export type LoginFormValues = {
  email: string
  password: string
  rememberMe: boolean
  role: AuthFormRole
}

export type LoginValidationMessages = {
  emailRequired: string
  emailInvalid: string
  passwordRequired: string
}
