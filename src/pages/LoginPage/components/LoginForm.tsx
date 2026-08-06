import { useState } from 'react'
import { MailCheck } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Checkbox, Input, PasswordInput } from '../../_components'
import { useFormState } from '../../../hooks/useFormState'
import { useAuth, useGlobalLoader, useToast } from '../../../context'
import { useLocale } from '../../../i18n'
import { getApiErrorMessage } from '../../../i18n/apiErrors'
import { authService } from '../../../services/auth.service'
import type { CommonTranslations, LoginTranslations, RegisterTranslations } from '../../../i18n/types'
import type { AuthApiRole } from '../../../lib/auth/authRole'
import type { LoginFormValues } from '../types'
import { VerificationCodeForm } from '../../ForgotPasswordPage/components/VerificationCodeForm'
import { GoogleLoginButton } from './GoogleLoginButton'
import { validateLoginForm } from '../utils/loginValidation'

type LoginFormProps = {
  apiErrors: CommonTranslations['apiErrors']
  authFeedback: CommonTranslations['authFeedback']
  authGuard: CommonTranslations['authGuard']
  backToLoginLabel: string
  role: AuthApiRole
  roleLabels: CommonTranslations['authUser']
  translations: LoginTranslations
  verificationTranslations: RegisterTranslations['verification']['verify']
  verificationValidation: Pick<RegisterTranslations['validation'], 'codeRequired'>
  verifyEmailLabel: string
}

type PendingEmailVerification = {
  email: string
  password: string
  rememberMe: boolean
  role: AuthApiRole
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

function getAuthApiRole(value: string | null): AuthApiRole | null {
  if (value === 'ADMIN' || value === 'CANDIDATE' || value === 'RECRUITER') {
    return value
  }

  return null
}

function getRoleLabel(
  role: AuthApiRole,
  labels: Pick<CommonTranslations['authUser'], 'adminRole' | 'candidateRole' | 'recruiterRole'>,
) {
  if (role === 'ADMIN') return labels.adminRole
  if (role === 'RECRUITER') return labels.recruiterRole

  return labels.candidateRole
}

function renderRoleTemplate(
  template: string,
  values: { currentRole?: string; requiredRole: string },
) {
  return template
    .replaceAll('{{currentRole}}', values.currentRole ?? values.requiredRole)
    .replaceAll('{{requiredRole}}', values.requiredRole)
}

function getRouteGuardNotice({
  authGuard,
  currentRole,
  reason,
  requiredRole,
}: {
  authGuard: CommonTranslations['authGuard']
  currentRole?: string
  reason: string | null
  requiredRole: string
}) {
  if (reason === 'role-mismatch') {
    return {
      title: authGuard.roleMismatchTitle,
      message: renderRoleTemplate(authGuard.roleMismatchMessage, { currentRole, requiredRole }),
    }
  }

  if (reason === 'role-switch') {
    return {
      title: authGuard.roleSwitchTitle,
      message: renderRoleTemplate(authGuard.roleSwitchMessage, { currentRole, requiredRole }),
    }
  }

  return {
    title: authGuard.authRequiredTitle,
    message: renderRoleTemplate(authGuard.authRequiredMessage, { requiredRole }),
  }
}

function renderTemplateWithEmail(template: string, email: string) {
  const [prefix, suffix = ''] = template.split('{{email}}')

  return (
    <>
      {prefix}
      <strong className="font-semibold text-[var(--color-text-secondary)]">{email}</strong>
      {suffix}
    </>
  )
}

export function LoginForm({
  apiErrors,
  authFeedback,
  authGuard,
  backToLoginLabel,
  role,
  roleLabels,
  translations,
  verificationTranslations,
  verificationValidation,
  verifyEmailLabel,
}: LoginFormProps) {
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
  const [pendingVerification, setPendingVerification] = useState<PendingEmailVerification | null>(null)
  const [verifyError, setVerifyError] = useState<string | undefined>()
  const [isVerifying, setVerifying] = useState(false)
  const [isResendingVerification, setResendingVerification] = useState(false)
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0)
  const isBusy = isSubmitting || isGoogleSubmitting
  const canUseGoogleLogin = role !== 'ADMIN'
  const loginRedirect = getSafeRedirect(searchParams.get('redirect')) ?? getDefaultLoginRedirect(role)
  const requiredRole = getAuthApiRole(searchParams.get('requiredRole')) ?? role
  const currentRole = getAuthApiRole(searchParams.get('currentRole'))
  const routeGuardReason = searchParams.get('reason')
  const routeGuardNotice = routeGuardReason
    ? getRouteGuardNotice({
      authGuard,
      currentRole: currentRole ? getRoleLabel(currentRole, roleLabels) : undefined,
      reason: routeGuardReason,
      requiredRole: getRoleLabel(requiredRole, roleLabels),
    })
    : null
  const buildPendingVerification = (formValues: LoginFormValues, email = formValues.email.trim()) => ({
    email,
    password: formValues.password,
    rememberMe: formValues.rememberMe,
    role,
  })

  const prepareVerificationRequest = async (email: string) => {
    try {
      await authService.createManualEmailVerification({ email })
    } catch {
      // The manual endpoint is disabled outside dev/test; resend still works when a verification row already exists.
    }
  }

  const resendVerificationCode = async (email: string, shouldPrepare = false) => {
    if (shouldPrepare) {
      await prepareVerificationRequest(email)
    }

    const result = await authService.resendVerificationEmail({ email })
    setResendCooldownSeconds(result.resendCooldownSeconds)
    toast.success(verificationTranslations.resendSuccessMessage)
  }

  const startEmailVerification = async (formValues: LoginFormValues, email = formValues.email.trim()) => {
    setPendingVerification(buildPendingVerification(formValues, email))
    setSubmitError(undefined)
    setVerifyError(undefined)
    setResendCooldownSeconds(0)
    setResendingVerification(true)

    try {
      await resendVerificationCode(email, true)
    } catch (error) {
      const message = getApiErrorMessage(error, apiErrors)
      setVerifyError(message)
      toast.error(message)
    } finally {
      setResendingVerification(false)
    }
  }

  const handleResendVerification = async () => {
    if (!pendingVerification) {
      return
    }

    setVerifyError(undefined)
    setResendingVerification(true)

    try {
      await resendVerificationCode(pendingVerification.email)
    } catch (error) {
      const message = getApiErrorMessage(error, apiErrors)
      setVerifyError(message)
      toast.error(message)
    } finally {
      setResendingVerification(false)
    }
  }

  const handleVerifyEmail = async (token: string) => {
    if (!pendingVerification) {
      return
    }

    setVerifyError(undefined)
    setVerifying(true)

    try {
      const auth = await trackGlobalLoader(
        (async () => {
          await authService.verifyEmail({
            email: pendingVerification.email,
            token,
          })

          return authService.login({
            email: pendingVerification.email,
            password: pendingVerification.password,
            role: pendingVerification.role,
          })
        })(),
        {
          label: verifyEmailLabel,
          mode: 'overlay',
        },
      )

      if (auth.user.emailVerified === false) {
        const message = apiErrors.byCode['AUTH.EMAIL_NOT_VERIFIED'] ?? apiErrors.default
        setVerifyError(message)
        toast.error(message)
        return
      }

      login(auth, pendingVerification.rememberMe ? 'local' : 'session')
      toast.success(authFeedback.emailVerifiedSuccess)
      navigate(loginRedirect, { replace: true })
    } catch (error) {
      const message = getApiErrorMessage(error, apiErrors)
      setVerifyError(message)
      toast.error(message)
    } finally {
      setVerifying(false)
    }
  }

  const handleBackToLogin = () => {
    setPendingVerification(null)
    setSubmitError(undefined)
    setVerifyError(undefined)
    setResendCooldownSeconds(0)
  }

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

          if (auth.user.emailVerified === false) {
            await startEmailVerification(formValues, auth.user.email)
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

  if (pendingVerification) {
    return (
      <div className="grid gap-6">
        <div className="grid gap-3 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-soft)] text-[var(--color-brand-solid)]">
            <MailCheck size={22} />
          </span>
          <div className="grid gap-2">
            <h2 className="text-lg font-extrabold text-[var(--color-text-primary)]">
              {verificationTranslations.title}
            </h2>
            <p className="text-sm font-medium leading-6 text-[var(--color-text-muted)]">
              {renderTemplateWithEmail(verificationTranslations.subtitle, pendingVerification.email)}
            </p>
          </div>
        </div>

        <VerificationCodeForm
          cooldownSeconds={resendCooldownSeconds}
          isResending={isResendingVerification}
          isSubmitting={isVerifying}
          onResend={handleResendVerification}
          onVerified={handleVerifyEmail}
          submitError={verifyError}
          translations={{
            form: verificationTranslations,
            validation: verificationValidation,
          }}
        />

        <button
          className="mx-auto text-sm font-bold text-[var(--color-brand-solid)] transition hover:opacity-80"
          disabled={isResendingVerification || isVerifying}
          onClick={handleBackToLogin}
          type="button"
        >
          {backToLoginLabel}
        </button>
      </div>
    )
  }

  return (
    <form className="auth-form-grid grid" noValidate onSubmit={handleSubmit}>
      {routeGuardNotice ? (
        <div
          className="rounded-xl border border-[rgba(242,85,85,0.22)] bg-[rgba(242,85,85,0.08)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]"
          role="status"
        >
          <strong className="block font-extrabold text-[var(--color-text-primary)]">
            {routeGuardNotice.title}
          </strong>
          <span>{routeGuardNotice.message}</span>
        </div>
      ) : null}

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
