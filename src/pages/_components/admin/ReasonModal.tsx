import { useEffect, useId, useState } from 'react'
import { Button } from '../Button'

type ReasonModalProps = {
  cancelLabel: string
  confirmLabel: string
  description?: string
  inputLabel: string
  isOpen: boolean
  isPending?: boolean
  maxLength?: number
  onCancel: () => void
  onConfirm: (reason: string) => void
  placeholder?: string
  requiredMessage: string
  title: string
}

export function ReasonModal({
  cancelLabel,
  confirmLabel,
  description,
  inputLabel,
  isOpen,
  isPending = false,
  maxLength = 500,
  onCancel,
  onConfirm,
  placeholder,
  requiredMessage,
  title,
}: ReasonModalProps) {
  const inputId = useId()
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setReason('')
      setError('')
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isPending) onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isPending, onCancel])

  if (!isOpen) return null

  const submit = () => {
    const normalizedReason = reason.trim()
    if (!normalizedReason) {
      setError(requiredMessage)
      return
    }
    onConfirm(normalizedReason)
  }

  return (
    <div
      aria-labelledby="reason-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
    >
      <form
        className="w-full max-w-lg rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-card)] p-6 shadow-xl"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]" id="reason-modal-title">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">{description}</p>
        ) : null}
        <label
          className="mt-5 block text-sm font-semibold text-[var(--color-text-secondary)]"
          htmlFor={inputId}
        >
          {inputLabel}
        </label>
        <textarea
          aria-describedby={error ? `${inputId}-error` : undefined}
          aria-invalid={Boolean(error)}
          autoFocus
          className="mt-2 min-h-32 w-full resize-y rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-brand-solid)] focus:ring-2 focus:ring-[var(--color-brand-soft)]"
          disabled={isPending}
          id={inputId}
          maxLength={maxLength}
          onChange={(event) => {
            setReason(event.target.value)
            if (error) setError('')
          }}
          placeholder={placeholder}
          value={reason}
        />
        <div className="mt-1 flex items-start justify-between gap-3">
          <p className="text-sm text-[var(--color-text-danger)]" id={`${inputId}-error`}>
            {error}
          </p>
          <span className="shrink-0 text-xs text-[var(--color-text-muted)]">
            {reason.length}/{maxLength}
          </span>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isPending} onClick={onCancel} variant="secondary">
            {cancelLabel}
          </Button>
          <Button disabled={isPending} type="submit">
            {confirmLabel}
          </Button>
        </div>
      </form>
    </div>
  )
}
