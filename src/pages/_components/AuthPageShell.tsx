import { useId } from 'react'
import type { ReactNode } from 'react'
import { BrandMark } from './BrandMark'

type AuthPageShellProps = {
  align?: 'center' | 'start'
  brandName: string
  children: ReactNode
  footer?: ReactNode
  subtitle: ReactNode
  title: string
  visual?: ReactNode
}

export function AuthPageShell({ align = 'start', brandName, children, footer, subtitle, title, visual }: AuthPageShellProps) {
  const titleId = useId()
  const alignmentClass = align === 'center' ? 'text-center' : 'text-left'
  const visualAlignmentClass = align === 'center' ? 'justify-center' : 'justify-start'

  return (
    <section
      aria-labelledby={titleId}
      className="auth-card-motion auth-card-shadow w-full max-w-[33rem] rounded-[20px] border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] px-6 py-9 sm:px-12 sm:py-12"
    >
      <div className="auth-motion auth-motion-brand">
        <BrandMark label={brandName} />
      </div>

      {visual ? (
        <div className={`auth-motion auth-motion-visual mt-10 flex ${visualAlignmentClass}`}>
          {visual}
        </div>
      ) : null}

      <div className={`auth-motion auth-motion-heading ${visual ? 'mt-7' : 'mt-10'} ${alignmentClass}`}>
        <h1 className="text-3xl font-bold leading-tight text-[var(--color-text-primary)]" id={titleId}>
          {title}
        </h1>
        <p className="mt-3 text-base text-[var(--color-text-muted)]">{subtitle}</p>
      </div>

      <div className="auth-motion auth-motion-form mt-9">{children}</div>

      {footer ? (
        <div className="auth-motion auth-motion-footer mt-6 border-t border-[var(--color-border-subtle)] pt-6 text-center text-base text-[var(--color-text-muted)]">
          {footer}
        </div>
      ) : null}
    </section>
  )
}
