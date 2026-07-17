import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslations } from '../../i18n'
import { AuthPageShell } from '../_components'
import { BackToLogin } from './components/BackToLogin'
import { EmailSentIllustration } from './components/EmailSentIllustration'
import { EmailSentState } from './components/EmailSentState'
import { ForgotPasswordForm } from './components/ForgotPasswordForm'
import { ResetPasswordForm } from './components/ResetPasswordForm'
import { ResetSuccessState } from './components/ResetSuccessState'
import { SuccessMark } from './components/SuccessMark'
import { VerificationCodeForm } from './components/VerificationCodeForm'
import type { ForgotPasswordStep } from './types'

const centeredSteps: ReadonlyArray<ForgotPasswordStep> = ['sent', 'verify', 'success']
const stepsWithFooter: ReadonlyArray<ForgotPasswordStep> = ['request', 'sent', 'verify']

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

export function ForgotPasswordPage() {
  const { common, pages } = useTranslations()
  const forgotPassword = pages.forgotPassword
  const [step, setStep] = useState<ForgotPasswordStep>('request')
  const [email, setEmail] = useState('')
  const stepCopy = forgotPassword.steps[step]
  const isCentered = centeredSteps.includes(step)
  const footer = stepsWithFooter.includes(step) ? <BackToLogin label={forgotPassword.backToLogin} /> : undefined

  const handleRequestSent = (nextEmail: string) => {
    setEmail(nextEmail)
    setStep('sent')
  }

  const visualByStep: Partial<Record<ForgotPasswordStep, ReactNode>> = {
    sent: <EmailSentIllustration />,
    success: <SuccessMark />,
  }

  const subtitle =
    step === 'sent' && email ? renderTemplateWithEmail(forgotPassword.steps.sent.subtitle, email) : stepCopy.subtitle

  return (
    <AuthPageShell
      align={isCentered ? 'center' : 'start'}
      brandName={common.brandName}
      footer={footer}
      subtitle={subtitle}
      title={stepCopy.title}
      visual={visualByStep[step]}
    >
      <div className="auth-step-motion" key={step}>
        {step === 'request' ? <ForgotPasswordForm onSent={handleRequestSent} translations={forgotPassword} /> : null}
        {step === 'sent' ? <EmailSentState onContinue={() => setStep('verify')} translations={forgotPassword} /> : null}
        {step === 'verify' ? <VerificationCodeForm onVerified={() => setStep('reset')} translations={forgotPassword} /> : null}
        {step === 'reset' ? <ResetPasswordForm onSaved={() => setStep('success')} translations={forgotPassword} /> : null}
        {step === 'success' ? <ResetSuccessState /> : null}
      </div>
    </AuthPageShell>
  )
}

export default ForgotPasswordPage
