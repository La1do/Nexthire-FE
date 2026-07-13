import { useId } from 'react'
import type { ReactNode } from 'react'
import { BrandMark } from './BrandMark'

type AuthPageShellProps = {
  brandName: string
  children: ReactNode
  footer: ReactNode
  subtitle: string
  title: string
}

export function AuthPageShell({ brandName, children, footer, subtitle, title }: AuthPageShellProps) {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="auth-card-shadow w-full max-w-[33rem] rounded-[20px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] px-6 py-9 sm:px-12 sm:py-12"
    >
      <BrandMark label={brandName} />

      <div className="mt-10">
        <h1 className="text-3xl font-bold leading-tight text-[var(--color-text-primary)]" id={titleId}>
          {title}
        </h1>
        <p className="mt-3 text-base text-[var(--color-text-muted)]">{subtitle}</p>
      </div>

      <div className="mt-9">{children}</div>

      <div className="mt-6 border-t border-[var(--color-border-subtle)] pt-6 text-center text-base text-[var(--color-text-muted)]">
        {footer}
      </div>
    </section>
  )
}
