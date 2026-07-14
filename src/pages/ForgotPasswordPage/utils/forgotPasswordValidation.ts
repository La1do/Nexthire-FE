import type { FormErrors } from '../../../hooks/useFormState'
import type {
  ForgotPasswordRequestValidationMessages,
  ForgotPasswordRequestValues,
  ResetPasswordFormValues,
  ResetPasswordValidationMessages,
} from '../types'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const minimumPasswordLength = 8

export function validateForgotPasswordRequest(
  values: ForgotPasswordRequestValues,
  messages: ForgotPasswordRequestValidationMessages,
): FormErrors<ForgotPasswordRequestValues> {
  const errors: FormErrors<ForgotPasswordRequestValues> = {}
  const email = values.email.trim()

  if (!email) {
    errors.email = messages.emailRequired
  } else if (!emailPattern.test(email)) {
    errors.email = messages.emailInvalid
  }

  return errors
}

export function validateResetPasswordForm(
  values: ResetPasswordFormValues,
  messages: ResetPasswordValidationMessages,
): FormErrors<ResetPasswordFormValues> {
  const errors: FormErrors<ResetPasswordFormValues> = {}

  if (!values.password) {
    errors.password = messages.passwordRequired
  } else if (values.password.length < minimumPasswordLength) {
    errors.password = messages.passwordMinLength
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = messages.confirmPasswordRequired
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = messages.passwordMismatch
  }

  return errors
}
