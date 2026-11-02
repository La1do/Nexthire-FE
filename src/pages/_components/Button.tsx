import type { ComponentPropsWithoutRef } from 'react'

export type ButtonVariant = 'ghost' | 'primary' | 'secondary' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  size?: ButtonSize
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  ghost: 'text-[var(--color-brand-solid)] hover:bg-[var(--color-brand-soft)]',
  primary: 'brand-gradient brand-action-shadow text-[var(--color-text-inverse)] hover:brightness-105',
  secondary:
    'border border-[var(--color-border-default)] bg-[var(--color-surface-card)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)]',
  destructive:
    'bg-[var(--color-status-danger-text,#ef4444)] text-white hover:brightness-110',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-8 px-3 text-sm rounded-md',
  md: 'min-h-12 px-5 text-base rounded-lg',
  lg: 'min-h-14 px-6 text-lg rounded-xl',
}

export function Button({
  className = '',
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button-motion inline-flex items-center justify-center font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand-solid)] disabled:cursor-not-allowed disabled:opacity-60 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      type={type}
      {...props}
    />
  )
}
