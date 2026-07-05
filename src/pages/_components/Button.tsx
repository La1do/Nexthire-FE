import type { ComponentPropsWithoutRef } from 'react'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#116a5b] text-white hover:bg-[#0d5449]',
  secondary: 'border border-[#cfd4c7] bg-white text-[#20242c] hover:bg-[#eef2e7]',
}

export function Button({ className = '', type = 'button', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 items-center justify-center rounded-md px-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#116a5b] ${variantClasses[variant]} ${className}`}
      type={type}
      {...props}
    />
  )
}
