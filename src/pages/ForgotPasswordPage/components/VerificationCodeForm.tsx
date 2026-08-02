import { useRef, useState } from 'react'
import type { ChangeEvent, ClipboardEvent, FormEvent, KeyboardEvent } from 'react'
import { Button } from '../../_components'
import type { ForgotPasswordTranslations } from '../../../i18n/types'

type VerificationCodeFormProps = {
  isSubmitting?: boolean
  onVerified: (code: string) => Promise<void> | void
  submitError?: string
  translations: ForgotPasswordTranslations
}

const digitCount = 6
const emptyDigits = Array.from({ length: digitCount }, () => '')

export function VerificationCodeForm({
  isSubmitting = false,
  onVerified,
  submitError,
  translations,
}: VerificationCodeFormProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const [digits, setDigits] = useState(emptyDigits)
  const [error, setError] = useState('')
  const code = digits.join('')

  const updateDigits = (nextDigits: string[]) => {
    setDigits(nextDigits)
    if (error) {
      setError('')
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    if (code.length !== digitCount) {
      setError(translations.validation.codeRequired)
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

      {error || submitError ? (
        <p className="text-center text-sm font-medium text-[var(--color-text-danger)]">{error || submitError}</p>
      ) : null}

      <p className="text-center text-base text-[var(--color-text-muted)]">
        {translations.form.resendPrefix} <strong className="text-[var(--color-text-secondary)]">{translations.form.resendTime}</strong>
      </p>

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {translations.form.verifySubmit}
      </Button>
    </form>
  )
}
