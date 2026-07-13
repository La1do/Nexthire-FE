import type { ComponentPropsWithoutRef } from 'react'

type ButtonVariant = 'ghost' | 'primary' | 'secondary'

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  ghost: 'text-[var(--color-brand-solid)] hover:bg-[var(--color-brand-soft)]',
  primary: 'brand-gradient brand-action-shadow text-[var(--color-text-inverse)] hover:brightness-105',
  secondary:
    'border border-[var(--color-border-default)] bg-[var(--color-surface-card)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)]',
}

export function Button({ className = '', type = 'button', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center rounded-lg px-5 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-solid)] disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${className}`}
      type={type}
      {...props}
    />
  )
}
