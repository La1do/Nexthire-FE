import type { FormErrors } from '../../../hooks/useFormState'
import type { LoginFormValues, LoginValidationMessages } from '../types'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLoginForm(
  values: LoginFormValues,
  messages: LoginValidationMessages,
): FormErrors<LoginFormValues> {
  const errors: FormErrors<LoginFormValues> = {}
  const email = values.email.trim()

  if (!email) {
    errors.email = messages.emailRequired
  } else if (!emailPattern.test(email)) {
    errors.email = messages.emailInvalid
  }

  if (!values.password) {
    errors.password = messages.passwordRequired
  }

  return errors
}
