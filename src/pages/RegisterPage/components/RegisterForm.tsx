import { useState } from 'react'
import { Button, Input, PasswordInput } from '../../_components'
import { useFormState } from '../../../hooks/useFormState'
import { useGlobalLoader, useToast } from '../../../context'
import { getApiErrorMessage } from '../../../i18n/apiErrors'
import { authService } from '../../../services/auth.service'
import type { CommonTranslations, RegisterTranslations } from '../../../i18n/types'
import type { AuthApiRole } from '../../../lib/auth/authRole'
import type { RegisterFormValues } from '../types'
import { validateRegisterForm } from '../utils/registerValidation'

export type PendingRegistration = {
  email: string
  password: string
  role: AuthApiRole
}

type RegisterFormRoleCopy = {
  form: RegisterTranslations['candidate']['form']
  validation: RegisterTranslations['validation']
}

type RegisterFormProps = {
  apiErrors: CommonTranslations['apiErrors']
  onRegistered: (registration: PendingRegistration) => void
  role: AuthApiRole
  translations: RegisterFormRoleCopy
}

const initialValues: RegisterFormValues = {
  confirmPassword: '',
  email: '',
  fullName: '',
  password: '',
  phone: '',
}

export function RegisterForm({ apiErrors, onRegistered, role, translations }: RegisterFormProps) {
  const { form, validation } = translations
  const { track: trackGlobalLoader } = useGlobalLoader()
  const toast = useToast()
  const [isSubmitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()
  const { getFieldError, handleFieldChange, handleSubmit, setFieldTouched, values } = useFormState<RegisterFormValues>({
    initialValues,
    onSubmit: async (formValues) => {
      setSubmitError(undefined)
      setSubmitting(true)

      try {
        const email = formValues.email.trim()

        await trackGlobalLoader(
          authService.register({
            fullName: formValues.fullName.trim(),
            phone: formValues.phone.trim(),
            email,
            password: formValues.password,
            role,
          }),
          {
            label: form.submitLoading,
            mode: 'overlay',
          },
        )

        onRegistered({
          email,
          password: formValues.password,
          role,
        })
      } catch (error) {
        const message = getApiErrorMessage(error, apiErrors)
        setSubmitError(message)
        toast.error(message)
      } finally {
        setSubmitting(false)
      }
    },
    validate: (formValues) => validateRegisterForm(formValues, validation),
  })

  return (
    <form className="auth-form-grid grid" noValidate onSubmit={handleSubmit}>
      <Input
        autoComplete="name"
        disabled={isSubmitting}
        error={getFieldError('fullName')}
        label={form.fullNameLabel}
        onBlur={() => setFieldTouched('fullName')}
        onChange={handleFieldChange('fullName')}
        placeholder={form.fullNamePlaceholder}
        type="text"
        value={values.fullName}
      />

      <Input
        autoComplete="tel"
        disabled={isSubmitting}
        error={getFieldError('phone')}
        label={form.phoneLabel}
        onBlur={() => setFieldTouched('phone')}
        onChange={handleFieldChange('phone')}
        placeholder={form.phonePlaceholder}
        type="tel"
        value={values.phone}
      />

      <Input
        autoComplete="email"
        disabled={isSubmitting}
        error={getFieldError('email')}
        label={form.emailLabel}
        onBlur={() => setFieldTouched('email')}
        onChange={handleFieldChange('email')}
        placeholder={form.emailPlaceholder}
        type="email"
        value={values.email}
      />

      <PasswordInput
        autoComplete="new-password"
        disabled={isSubmitting}
        error={getFieldError('password')}
        hidePasswordLabel={form.hidePassword}
        label={form.passwordLabel}
        onBlur={() => setFieldTouched('password')}
        onChange={handleFieldChange('password')}
        placeholder={form.passwordPlaceholder}
        showPasswordLabel={form.showPassword}
        value={values.password}
      />

      <PasswordInput
        autoComplete="new-password"
        disabled={isSubmitting}
        error={getFieldError('confirmPassword')}
        hidePasswordLabel={form.hidePassword}
        label={form.confirmPasswordLabel}
        onBlur={() => setFieldTouched('confirmPassword')}
        onChange={handleFieldChange('confirmPassword')}
        placeholder={form.confirmPasswordPlaceholder}
        showPasswordLabel={form.showPassword}
        value={values.confirmPassword}
      />

      {submitError ? (
        <p className="rounded-lg border border-[rgba(220,38,38,0.24)] bg-[rgba(220,38,38,0.08)] px-3 py-2 text-sm font-medium text-[var(--color-text-danger)]" role="alert">
          {submitError}
        </p>
      ) : null}

      <Button className="mt-1 w-full" disabled={isSubmitting} type="submit">
        {isSubmitting ? form.submitLoading : form.submit}
      </Button>
    </form>
  )
}
