import { useEffect } from 'react'
import { Button } from '../Button'

type ConfirmModalProps = {
  cancelLabel: string
  confirmLabel: string
  description: string
  isOpen: boolean
  isPending?: boolean
  onCancel: () => void
  onConfirm: () => void
  title: string
}

export function ConfirmModal({
  cancelLabel,
  confirmLabel,
  description,
  isOpen,
  isPending = false,
  onCancel,
  onConfirm,
  title,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isPending) onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isPending, onCancel])

  if (!isOpen) return null

  return (
    <div
      aria-labelledby="confirm-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
    >
      <div className="w-full max-w-md rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-card)] p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]" id="confirm-modal-title">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">{description}</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button disabled={isPending} onClick={onCancel} variant="secondary">
            {cancelLabel}
          </Button>
          <Button disabled={isPending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
