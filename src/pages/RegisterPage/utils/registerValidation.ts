import type { FormErrors } from '../../../hooks/useFormState'
import type { RegisterFormValues, RegisterValidationMessages } from '../types'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const minimumFullNameLength = 2
const minimumPhoneLength = 8
const minimumPasswordLength = 8

export function validateRegisterForm(
  values: RegisterFormValues,
  messages: RegisterValidationMessages,
): FormErrors<RegisterFormValues> {
  const errors: FormErrors<RegisterFormValues> = {}
  const email = values.email.trim()
  const fullName = values.fullName.trim()
  const phone = values.phone.trim()

  if (!fullName) {
    errors.fullName = messages.fullNameRequired
  } else if (fullName.length < minimumFullNameLength) {
    errors.fullName = messages.fullNameMinLength
  }

  if (!phone) {
    errors.phone = messages.phoneRequired
  } else if (phone.length < minimumPhoneLength) {
    errors.phone = messages.phoneMinLength
  }

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
