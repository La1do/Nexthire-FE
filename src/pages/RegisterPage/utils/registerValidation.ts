import type { FormErrors } from '../../../hooks/useFormState'
import type { RegisterFormValues, RegisterValidationMessages } from '../types'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const minimumPasswordLength = 8

export function validateRegisterForm(
  values: RegisterFormValues,
  messages: RegisterValidationMessages,
): FormErrors<RegisterFormValues> {
  const errors: FormErrors<RegisterFormValues> = {}
  const email = values.email.trim()

  if (!email) {
    errors.email = messages.emailRequired
  } else if (!emailPattern.test(email)) {
    errors.email = messages.emailInvalid
  }

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
