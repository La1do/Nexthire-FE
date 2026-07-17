import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Checkbox, Input, PasswordInput } from '../../_components'
import { useFormState } from '../../../hooks/useFormState'
import { useAuth } from '../../../context'
import { getApiErrorMessage } from '../../../i18n/apiErrors'
import { authService } from '../../../services/auth.service'
import type { CommonTranslations, LoginTranslations } from '../../../i18n/types'
import type { AuthApiRole } from '../../../lib/auth/authRole'
import type { LoginFormValues } from '../types'
import { validateLoginForm } from '../utils/loginValidation'

type LoginFormProps = {
  apiErrors: CommonTranslations['apiErrors']
  role: AuthApiRole
  translations: LoginTranslations
}

const initialValues: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
}

function getLoginRedirect(role: AuthApiRole) {
  if (role === 'CANDIDATE') return '/home'
  if (role === 'RECRUITER') return '/recruiter'
  return '/admin/users'
}

export function LoginForm({ apiErrors, role, translations }: LoginFormProps) {
  const { form, validation } = translations
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isSubmitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()
  const { getFieldError, handleCheckboxChange, handleFieldChange, handleSubmit, setFieldTouched, values } =
    useFormState<LoginFormValues>({
      initialValues,
      onSubmit: async (formValues) => {
        setSubmitError(undefined)
        setSubmitting(true)

        try {
          const auth = await authService.login({
            email: formValues.email.trim(),
            password: formValues.password,
            role,
          })

          login(auth, formValues.rememberMe ? 'local' : 'session')
          navigate(getLoginRedirect(role))
        } catch (error) {
          setSubmitError(getApiErrorMessage(error, apiErrors))
        } finally {
          setSubmitting(false)
        }
      },
      validate: (formValues) => validateLoginForm(formValues, validation),
    })

  return (
    <form className="auth-form-grid grid" noValidate onSubmit={handleSubmit}>
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
        autoComplete="current-password"
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          checked={values.rememberMe}
          disabled={isSubmitting}
          label={form.rememberMe}
          onChange={handleCheckboxChange('rememberMe')}
        />
        <a className="text-sm font-semibold text-[var(--color-brand-solid)] transition hover:opacity-80" href="/forgot-password">
          {form.forgotPassword}
        </a>
      </div>

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
