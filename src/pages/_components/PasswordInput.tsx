import { useId, useState } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

type PasswordInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'className' | 'type'> & {
  error?: string
  hidePasswordLabel: string
  label: string
  reserveMessageSpace?: boolean
  showPasswordLabel: string
}

export function PasswordInput({
  error,
  hidePasswordLabel,
  id,
  label,
  reserveMessageSpace = false,
  showPasswordLabel,
  ...props
}: PasswordInputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  return (
    <div className="grid gap-2">
      <label className="text-base font-medium text-[var(--color-text-secondary)]" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className="form-control h-12 w-full rounded-lg bg-[var(--color-surface-card)] px-4 pr-12 text-base"
          id={inputId}
          type={isPasswordVisible ? 'text' : 'password'}
          {...props}
        />
        <button
          aria-label={isPasswordVisible ? hidePasswordLabel : showPasswordLabel}
          className="absolute right-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-md text-[var(--color-text-muted)] transition hover:text-[var(--color-text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-solid)]"
          onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
          type="button"
        >
          <svg aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {isPasswordVisible ? (
              <>
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="3" />
              </>
            ) : (
              <>
                <path d="m3 3 18 18" />
                <path d="M10.7 5.2A10.2 10.2 0 0 1 12 5c6 0 9.5 7 9.5 7a18.3 18.3 0 0 1-2.7 3.7" />
                <path d="M6.5 6.5A18.3 18.3 0 0 0 2.5 12s3.5 7 9.5 7a9.8 9.8 0 0 0 4.2-.9" />
                <path d="M9.9 9.9A3 3 0 0 0 14.1 14.1" />
              </>
            )}
          </svg>
        </button>
      </div>
      {error || reserveMessageSpace ? (
        <p aria-hidden={!error} className="min-h-[2lh] text-sm font-medium text-[var(--color-text-danger)]" id={error ? errorId : undefined} role={error ? 'alert' : undefined}>
          {error ?? ' '}
        </p>
      ) : null}
    </div>
  )
}
