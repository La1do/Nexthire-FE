import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslations } from '../../i18n'
import { useAuth, useGlobalLoader, useToast } from '../../context'
import { getApiErrorMessage } from '../../i18n/apiErrors'
import { authService } from '../../services/auth.service'
import { AuthPageShell } from '../_components'
import { VerificationCodeForm } from '../ForgotPasswordPage/components/VerificationCodeForm'
import { RegisterForm } from './components/RegisterForm'
import type { AuthApiRole, PublicAuthApiRole } from '../../lib/auth/authRole'
import type { PendingRegistration } from './components/RegisterForm'

type RegisterStep = 'form' | 'verify'
type RegisterRole = PublicAuthApiRole

const centeredSteps: ReadonlyArray<RegisterStep> = ['verify']

function getRegisterRedirect(role: AuthApiRole) {
  if (role === 'CANDIDATE') return '/home'
  if (role === 'RECRUITER') return '/recruiter'
  return '/admin/users'
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

type RegisterPageProps = {
  role: RegisterRole
}

export function RegisterPage({ role }: RegisterPageProps) {
  const { common, pages } = useTranslations()
  const navigate = useNavigate()
  const { login } = useAuth()
  const { track: trackGlobalLoader } = useGlobalLoader()
  const toast = useToast()
  const register = pages.register
  const roleContent = role === 'RECRUITER' ? register.recruiter : register.candidate
  const switchHref = role === 'RECRUITER' ? '/register' : '/recruiter/register'
  const loginHref = role === 'RECRUITER' ? '/recruiter/login' : '/login'
  const [step, setStep] = useState<RegisterStep>('form')
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null)
  const [verifyError, setVerifyError] = useState<string | undefined>()
  const [isVerifying, setVerifying] = useState(false)
  const [isResendingVerification, setResendingVerification] = useState(false)
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0)
  const isCentered = centeredSteps.includes(step)
  const title = step === 'form' ? roleContent.title : register.verification.verify.title
  const subtitle =
    step === 'form'
      ? roleContent.subtitle
      : pendingRegistration
        ? renderTemplateWithEmail(register.verification.verify.subtitle, pendingRegistration.email)
        : register.verification.verify.subtitle

  const handleRegistered = (registration: PendingRegistration) => {
    setPendingRegistration(registration)
    setVerifyError(undefined)
    setResendCooldownSeconds(0)
    setStep('verify')
    toast.success(common.authFeedback.registerSuccess)
  }

  const handleResendVerification = async () => {
    if (!pendingRegistration) {
      return
    }

    setResendingVerification(true)
    try {
      const result = await authService.resendVerificationEmail({
        email: pendingRegistration.email,
      })
      setResendCooldownSeconds(result.resendCooldownSeconds)
      toast.success(register.verification.verify.resendSuccessMessage)
    } catch (error) {
      const message = getApiErrorMessage(error, common.apiErrors)
      toast.error(message)
    } finally {
      setResendingVerification(false)
    }
  }

  const handleVerifyEmail = async (token: string) => {
    if (!pendingRegistration) {
      return
    }

    setVerifyError(undefined)
    setVerifying(true)

    try {
      const auth = await trackGlobalLoader(
        (async () => {
          await authService.verifyEmail({
            email: pendingRegistration.email,
            token,
          })

          return authService.login({
            email: pendingRegistration.email,
            password: pendingRegistration.password,
            role: pendingRegistration.role,
          })
        })(),
        {
          label: common.loader.verifyEmailLabel,
          mode: 'overlay',
        },
      )

      login(auth, 'session')
      toast.success(common.authFeedback.emailVerifiedSuccess)
      navigate(getRegisterRedirect(pendingRegistration.role))
    } catch (error) {
      const message = getApiErrorMessage(error, common.apiErrors)
      setVerifyError(message)
      toast.error(message)
    } finally {
      setVerifying(false)
    }
  }

  return (
    <AuthPageShell
      align={isCentered ? 'center' : 'start'}
      brandName={common.brandName}
      footer={
        <>
          <p>
            <span>{roleContent.loginPrompt}</span>{' '}
            <a className="font-bold text-[var(--color-brand-solid)] transition hover:opacity-80" href={loginHref}>
              {roleContent.loginAction}
            </a>
          </p>
          <p className="mt-2">
            <span>{roleContent.switchPrompt}</span>{' '}
            <a className="font-bold text-[var(--color-brand-solid)] transition hover:opacity-80" href={switchHref}>
              {roleContent.switchAction}
            </a>
          </p>
        </>
      }
      subtitle={subtitle}
      title={title}
    >
      <div className="auth-step-motion" key={step}>
        {step === 'form' ? (
          <RegisterForm
            apiErrors={common.apiErrors}
            onRegistered={handleRegistered}
            role={role}
            translations={{ form: roleContent.form, validation: register.validation }}
          />
        ) : null}
        {step === 'verify' ? (
          <VerificationCodeForm
            cooldownSeconds={resendCooldownSeconds}
            isResending={isResendingVerification}
            isSubmitting={isVerifying}
            onResend={handleResendVerification}
            onVerified={handleVerifyEmail}
            submitError={verifyError}
            translations={{ form: register.verification.verify, validation: register.validation }}
          />
        ) : null}
      </div>
    </AuthPageShell>
  )
}

export function CandidateRegisterPage() {
  return <RegisterPage role="CANDIDATE" />
}

export function RecruiterRegisterPage() {
  return <RegisterPage role="RECRUITER" />
}

export default CandidateRegisterPage