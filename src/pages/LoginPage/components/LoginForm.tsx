import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Checkbox, Input, PasswordInput } from '../../_components'
import { useFormState } from '../../../hooks/useFormState'
import { useAuth, useGlobalLoader, useToast } from '../../../context'
import { useLocale } from '../../../i18n'
import { getApiErrorMessage } from '../../../i18n/apiErrors'
import { authService } from '../../../services/auth.service'
import type { CommonTranslations, LoginTranslations } from '../../../i18n/types'
import type { AuthApiRole } from '../../../lib/auth/authRole'
import type { LoginFormValues } from '../types'
import { GoogleLoginButton } from './GoogleLoginButton'
import { validateLoginForm } from '../utils/loginValidation'

type LoginFormProps = {
  apiErrors: CommonTranslations['apiErrors']
  authFeedback: CommonTranslations['authFeedback']
  role: AuthApiRole
  translations: LoginTranslations
}

const initialValues: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
}

function getDefaultLoginRedirect(role: AuthApiRole) {
  if (role === 'CANDIDATE') return '/home'
  if (role === 'RECRUITER') return '/recruiter'
  return '/admin/dashboard'
}

function getSafeRedirect(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return null
  }

  return value
}

export function LoginForm({ apiErrors, authFeedback, role, translations }: LoginFormProps) {
  const { form, validation } = translations
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const { track: trackGlobalLoader } = useGlobalLoader()
  const toast = useToast()
  const { locale } = useLocale()
  const [isSubmitting, setSubmitting] = useState(false)
  const [isGoogleSubmitting, setGoogleSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | undefined>()
  const isBusy = isSubmitting || isGoogleSubmitting
  const canUseGoogleLogin = role !== 'ADMIN'
  const loginRedirect = getSafeRedirect(searchParams.get('redirect')) ?? getDefaultLoginRedirect(role)
  const { getFieldError, handleCheckboxChange, handleFieldChange, handleSubmit, setFieldTouched, values } =
    useFormState<LoginFormValues>({
      initialValues,
      onSubmit: async (formValues) => {
        setSubmitError(undefined)
        setSubmitting(true)

        try {
          const auth = await trackGlobalLoader(
            authService.login({
              email: formValues.email.trim(),
              password: formValues.password,
              role,
            }),
            {
              label: form.submitLoading,
              mode: 'overlay',
            },
          )

          if (!auth.user.emailVerified) {
            const message = apiErrors.byCode['AUTH.EMAIL_NOT_VERIFIED'] ?? apiErrors.default
            setSubmitError(message)
            toast.error(message)
            return
          }

          login(auth, formValues.rememberMe ? 'local' : 'session')
          toast.success(authFeedback.loginSuccess)
          navigate(loginRedirect, { replace: true })
        } catch (error) {
          const message = getApiErrorMessage(error, apiErrors)
          setSubmitError(message)
          toast.error(message)
        } finally {
          setSubmitting(false)
        }
      },
      validate: (formValues) => validateLoginForm(formValues, validation),
    })

  async function handleGoogleCredential(idToken: string) {
    if (role === 'ADMIN') {
      return
    }

    setSubmitError(undefined)
    setGoogleSubmitting(true)

    try {
      const auth = await trackGlobalLoader(
        authService.googleLogin({
          idToken,
          role,
        }),
        {
          label: form.googleLoading,
          mode: 'overlay',
        },
      )

      login(auth, values.rememberMe ? 'local' : 'session')
      toast.success(authFeedback.googleLoginSuccess)
      navigate(loginRedirect, { replace: true })
    } catch (error) {
      const message = getApiErrorMessage(error, apiErrors)
      setSubmitError(message)
      toast.error(message)
    } finally {
      setGoogleSubmitting(false)
    }
  }

  return (
    <form className="auth-form-grid grid" noValidate onSubmit={handleSubmit}>
      <Input
        autoComplete="email"
        disabled={isBusy}
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
        disabled={isBusy}
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
          disabled={isBusy}
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

      <Button className="mt-1 w-full" disabled={isBusy} type="submit">
        {isSubmitting ? form.submitLoading : form.submit}
      </Button>

      {canUseGoogleLogin ? (
        <>
          <div className="flex items-center gap-3 text-xs font-semibold uppercase text-[var(--color-text-muted)]">
            <span className="h-px flex-1 bg-[var(--color-border-subtle)]" />
            <span>{form.orDivider}</span>
            <span className="h-px flex-1 bg-[var(--color-border-subtle)]" />
          </div>

          <GoogleLoginButton
            disabled={isBusy}
            locale={locale}
            onCredential={handleGoogleCredential}
            onError={(message) => {
              setSubmitError(message)
              toast.error(message)
            }}
            translations={form}
          />
        </>
      ) : null}
    </form>
  )
}
