import { useId } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

type InputProps = Omit<ComponentPropsWithoutRef<'input'>, 'className'> & {
  error?: string
  label: string
  className?: string
}

export function Input({ className = '', error, id, label, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`

  return (
    <label className="grid gap-2" htmlFor={inputId}>
      <span className="text-base font-medium text-[var(--color-text-secondary)]">{label}</span>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className={`form-control h-12 rounded-lg bg-[var(--color-surface-card)] px-4 text-base ${className}`}
        id={inputId}
        {...props}
      />
      {error ? (
        <span className="text-sm font-medium text-[var(--color-text-danger)]" id={errorId}>
          {error}
        </span>
      ) : null}
    </label>
  )
}
