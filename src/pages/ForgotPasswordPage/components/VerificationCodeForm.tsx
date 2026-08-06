import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from 'react'
import { Button } from '../../_components'

export type VerificationFormTranslations = {
  form: {
    codeDigitLabel: string
    resendPrefix: string
    resendAction: string
    resendingAction: string
    verifySubmit: string
  }
  validation: {
    codeRequired: string
  }
}

type VerificationCodeFormProps = {
  cooldownSeconds?: number
  isResending?: boolean
  isSubmitting?: boolean
  onResend?: () => Promise<void> | void
  onVerified: (code: string) => Promise<void> | void
  submitError?: string
  submitLabel?: string
  translations: VerificationFormTranslations
}

const digitCount = 6
const emptyDigits = Array.from({ length: digitCount }, () => '')
const defaultCooldownSeconds = 60

function normalizeCooldownSeconds(value: number | undefined) {
  return Number.isFinite(value) && value !== undefined ? Math.max(0, Math.floor(value)) : 0
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function VerificationCodeForm({
  cooldownSeconds,
  isResending = false,
  isSubmitting = false,
  onResend,
  onVerified,
  submitError,
  submitLabel,
  translations,
}: VerificationCodeFormProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const hasResendAction = Boolean(onResend)
  const [digits, setDigits] = useState(emptyDigits)
  const [hasCodeError, setCodeError] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    normalizeCooldownSeconds(cooldownSeconds ?? (hasResendAction ? defaultCooldownSeconds : 0)),
  )
  const code = digits.join('')
  const canResend = hasResendAction && secondsRemaining <= 0 && !isResending && !isSubmitting
  const validationError = hasCodeError ? translations.validation.codeRequired : ''

  useEffect(() => {
    setSecondsRemaining(normalizeCooldownSeconds(cooldownSeconds ?? (hasResendAction ? defaultCooldownSeconds : 0)))
  }, [cooldownSeconds, hasResendAction])

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return
    }

    const timerId = window.setInterval(() => {
      setSecondsRemaining((currentSeconds) => Math.max(currentSeconds - 1, 0))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [secondsRemaining])

  const updateDigits = (nextDigits: string[]) => {
    setDigits(nextDigits)
    if (hasCodeError) {
      setCodeError(false)
    }
  }

  const applyCode = (rawValue: string, startIndex = 0) => {
    const nextCode = rawValue.replace(/\D/g, '').slice(0, digitCount - startIndex)

    if (!nextCode) {
      return
    }

    const nextDigits = [...digits]

    nextCode.split('').forEach((digit, digitIndex) => {
      nextDigits[startIndex + digitIndex] = digit
    })

    updateDigits(nextDigits)
    inputRefs.current[Math.min(startIndex + nextCode.length, digitCount - 1)]?.focus()
  }

  const handleDigitChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value

    if (value.length > 1) {
      applyCode(value, index)
      return
    }

    const nextDigit = value.replace(/\D/g, '')
    const nextDigits = digits.map((digit, digitIndex) => (digitIndex === index ? nextDigit : digit))

    updateDigits(nextDigits)

    if (nextDigit) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleDigitKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index]) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    applyCode(event.clipboardData.getData('text'))
  }

  const handleResend = async () => {
    if (!canResend || !onResend) {
      return
    }

    await onResend()
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    if (code.length !== digitCount) {
      setCodeError(true)
      inputRefs.current[digits.findIndex((digit) => !digit)]?.focus()
      return
    }

    await onVerified(code)
  }

  return (
    <form className="grid gap-6" noValidate onSubmit={handleSubmit}>
      <div className="otp-grid">
        {digits.map((digit, index) => (
          <input
            aria-label={`${translations.form.codeDigitLabel} ${index + 1}`}
            className="otp-input"
            disabled={isSubmitting}
            inputMode="numeric"
            key={index}
            maxLength={1}
            onChange={(event) => handleDigitChange(index, event)}
            onKeyDown={(event) => handleDigitKeyDown(index, event)}
            onPaste={handlePaste}
            pattern="[0-9]*"
            ref={(element) => {
              inputRefs.current[index] = element
            }}
            type="text"
            value={digit}
          />
        ))}
      </div>

      {validationError || submitError ? (
        <p className="text-center text-sm font-medium text-[var(--color-text-danger)]">{validationError || submitError}</p>
      ) : null}

      {onResend ? (
        <div className="text-center text-base text-[var(--color-text-muted)]">
          {secondsRemaining > 0 ? (
            <p>
              {translations.form.resendPrefix}{' '}
              <strong className="text-[var(--color-text-secondary)]">{formatCountdown(secondsRemaining)}</strong>
            </p>
          ) : (
            <button
              className="font-semibold text-[var(--color-brand-solid)] transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!canResend}
              onClick={() => void handleResend()}
              type="button"
            >
              {isResending ? translations.form.resendingAction : translations.form.resendAction}
            </button>
          )}
        </div>
      ) : null}

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {submitLabel ?? translations.form.verifySubmit}
      </Button>
    </form>
  )
}
