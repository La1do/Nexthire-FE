import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslations } from '../../i18n'
import { useAuth } from '../../context'
import { getApiErrorMessage } from '../../i18n/apiErrors'
import { authService } from '../../services/auth.service'
import { AuthPageShell } from '../_components'
import { EmailSentIllustration } from '../ForgotPasswordPage/components/EmailSentIllustration'
import { EmailSentState } from '../ForgotPasswordPage/components/EmailSentState'
import { VerificationCodeForm } from '../ForgotPasswordPage/components/VerificationCodeForm'
import { RegisterForm } from './components/RegisterForm'
import type { ReactNode } from 'react'
import type { RegisterTranslations } from '../../i18n/types'
import type { AuthApiRole, PublicAuthApiRole } from '../../lib/auth/authRole'
import type { PendingRegistration } from './components/RegisterForm'

type RegisterStep = 'form' | 'sent' | 'verify'
type RegisterRole = PublicAuthApiRole

const centeredSteps: ReadonlyArray<RegisterStep> = ['sent', 'verify']

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
  const register = pages.register
  const forgotPassword = pages.forgotPassword
  const roleContent = role === 'RECRUITER' ? register.recruiter : register.candidate
  const switchHref = role === 'RECRUITER' ? '/register' : '/recruiter/register'
  const loginHref = role === 'RECRUITER' ? '/recruiter/login' : '/login'
  const [step, setStep] = useState<RegisterStep>('form')
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null)
  const [verifyError, setVerifyError] = useState<string | undefined>()
  const [isVerifying, setVerifying] = useState(false)
  const isCentered = centeredSteps.includes(step)
  const visualByStep: Partial<Record<RegisterStep, ReactNode>> = {
    sent: <EmailSentIllustration />,
  }
  const title = step === 'form' ? roleContent.title : register.verification[step].title
  const subtitle =
    step === 'sent' && pendingRegistration
      ? renderTemplateWithEmail(register.verification.sent.subtitle, pendingRegistration.email)
      : step === 'form'
        ? roleContent.subtitle
        : register.verification[step].subtitle

  const handleRegistered = (registration: PendingRegistration) => {
    setPendingRegistration(registration)
    setVerifyError(undefined)
    setStep('sent')
  }

  const handleVerifyEmail = async (token: string) => {
    if (!pendingRegistration) {
      return
    }

    setVerifyError(undefined)
    setVerifying(true)

    try {
      await authService.verifyEmail({
        email: pendingRegistration.email,
        token,
      })

      const auth = await authService.login({
        email: pendingRegistration.email,
        password: pendingRegistration.password,
        role: pendingRegistration.role,
      })

      login(auth, 'session')
      navigate(getRegisterRedirect(pendingRegistration.role))
    } catch (error) {
      setVerifyError(getApiErrorMessage(error, common.apiErrors))
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
      visual={visualByStep[step]}
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
        {step === 'sent' ? (
          <EmailSentState
            buttonLabel={register.verification.sentSubmit}
            onContinue={() => setStep('verify')}
            translations={forgotPassword}
          />
        ) : null}
        {step === 'verify' ? (
          <VerificationCodeForm
            isSubmitting={isVerifying}
            onVerified={handleVerifyEmail}
            submitError={verifyError}
            translations={forgotPassword}
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