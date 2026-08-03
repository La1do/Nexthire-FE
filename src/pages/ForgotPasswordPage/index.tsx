import { useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslations } from '../../i18n'
import { useToast } from '../../context'
import { getApiErrorMessage } from '../../i18n/apiErrors'
import { authService } from '../../services/auth.service'
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
import type { ResetPasswordFormValues } from './types'

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
  const toast = useToast()
  const forgotPassword = pages.forgotPassword
  const [step, setStep] = useState<ForgotPasswordStep>('request')
  const [email, setEmail] = useState('')
  const stepCopy = forgotPassword.steps[step]
  const isCentered = centeredSteps.includes(step)
  const footer = stepsWithFooter.includes(step) ? <BackToLogin label={forgotPassword.backToLogin} /> : undefined
  const [resetToken, setResetToken] = useState('')
  const [resendCooldownSeconds, setResendCooldownSeconds] = useState(0)
  const [requestError, setRequestError] = useState<string | undefined>()
  const [verifyError, setVerifyError] = useState<string | undefined>()
  const [resetError, setResetError] = useState<string | undefined>()
  const [isRequestingReset, setRequestingReset] = useState(false)
  const [isResendingReset, setResendingReset] = useState(false)
  const [isSavingPassword, setSavingPassword] = useState(false)

  const requestPasswordReset = async (nextEmail: string) => {
    const normalizedEmail = nextEmail.trim()
    const response = await authService.forgotPassword({ email: normalizedEmail })

    setEmail(normalizedEmail)
    setResetToken('')
    setResendCooldownSeconds(response.resendCooldownSeconds)
    return response
  }

  const handleRequestSent = async (nextEmail: string) => {
    setRequestingReset(true)
    setRequestError(undefined)

    try {
      await requestPasswordReset(nextEmail)
      setStep('sent')
      toast.success(common.authFeedback.passwordResetEmailSent)
    } catch (error) {
      const message = getApiErrorMessage(error, common.apiErrors)
      setRequestError(message)
      toast.error(message)
    } finally {
      setRequestingReset(false)
    }
  }

  const handleResendCode = async () => {
    if (!email || isResendingReset) {
      return
    }

    setResendingReset(true)
    setVerifyError(undefined)

    try {
      await requestPasswordReset(email)
      toast.success(common.authFeedback.passwordResetEmailSent)
    } catch (error) {
      const message = getApiErrorMessage(error, common.apiErrors)
      setVerifyError(message)
      toast.error(message)
    } finally {
      setResendingReset(false)
    }
  }

  const handleCodeVerified = (code: string) => {
    setResetToken(code)
    setVerifyError(undefined)
    setStep('reset')
  }

  const handlePasswordSaved = async (values: ResetPasswordFormValues) => {
    if (!email || !resetToken) {
      setResetError(forgotPassword.validation.codeRequired)
      setStep('verify')
      return
    }

    setSavingPassword(true)
    setResetError(undefined)

    try {
      await authService.resetPassword({
        email,
        newPassword: values.password,
        token: resetToken,
      })
      setStep('success')
      toast.success(common.authFeedback.passwordResetSuccess)
    } catch (error) {
      const message = getApiErrorMessage(error, common.apiErrors)
      setResetError(message)
      toast.error(message)
    } finally {
      setSavingPassword(false)
    }
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
        {step === 'request' ? (
          <ForgotPasswordForm
            isSubmitting={isRequestingReset}
            onSent={handleRequestSent}
            submitError={requestError}
            translations={forgotPassword}
          />
        ) : null}
        {step === 'sent' ? <EmailSentState onContinue={() => setStep('verify')} translations={forgotPassword} /> : null}
        {step === 'verify' ? (
          <VerificationCodeForm
            cooldownSeconds={resendCooldownSeconds}
            isResending={isResendingReset}
            onResend={handleResendCode}
            onVerified={handleCodeVerified}
            submitError={verifyError}
            submitLabel={forgotPassword.form.codeContinueSubmit}
            translations={forgotPassword}
          />
        ) : null}
        {step === 'reset' ? (
          <ResetPasswordForm
            isSubmitting={isSavingPassword}
            onSaved={handlePasswordSaved}
            submitError={resetError}
            translations={forgotPassword}
          />
        ) : null}
        {step === 'success' ? <ResetSuccessState /> : null}
      </div>
    </AuthPageShell>
  )
}

export default ForgotPasswordPage
