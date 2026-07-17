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
import type { AuthApiRole } from '../../lib/auth/authRole'
import type { PendingRegistration } from './components/RegisterForm'

type RegisterStep = 'form' | 'sent' | 'verify'

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

export function RegisterPage() {
  const { common, pages } = useTranslations()
  const navigate = useNavigate()
  const { login } = useAuth()
  const register = pages.register
  const forgotPassword = pages.forgotPassword
  const [step, setStep] = useState<RegisterStep>('form')
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null)
  const [verifyError, setVerifyError] = useState<string | undefined>()
  const [isVerifying, setVerifying] = useState(false)
  const isCentered = centeredSteps.includes(step)
  const visualByStep: Partial<Record<RegisterStep, ReactNode>> = {
    sent: <EmailSentIllustration />,
  }
  const title = step === 'form' ? register.title : register.verification[step].title
  const subtitle =
    step === 'sent' && pendingRegistration
      ? renderTemplateWithEmail(register.verification.sent.subtitle, pendingRegistration.email)
      : step === 'form'
        ? register.subtitle
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
          <span>{register.footer.prompt}</span>{' '}
          <a className="font-bold text-[var(--color-brand-solid)] transition hover:opacity-80" href="/login">
            {register.footer.action}
          </a>
        </>
      }
      subtitle={subtitle}
      title={title}
      visual={visualByStep[step]}
    >
      <div className="auth-step-motion" key={step}>
        {step === 'form' ? (
          <RegisterForm apiErrors={common.apiErrors} onRegistered={handleRegistered} translations={register} />
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

export default RegisterPage
