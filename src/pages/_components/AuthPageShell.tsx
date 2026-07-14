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
      className="auth-card auth-card-motion auth-card-shadow w-full"
    >
      <div className="auth-motion auth-motion-brand">
        <BrandMark label={brandName} />
      </div>

      {visual ? (
        <div className={`auth-motion auth-motion-visual mt-7 flex sm:mt-10 ${visualAlignmentClass}`}>
          {visual}
        </div>
      ) : null}

      <div className={`auth-motion auth-motion-heading ${visual ? 'mt-5 sm:mt-7' : 'mt-7 sm:mt-10'} ${alignmentClass}`}>
        <h1 className="auth-card-title font-bold leading-tight text-[var(--color-text-primary)]" id={titleId}>
          {title}
        </h1>
        <p className="mt-2 text-base text-[var(--color-text-muted)] sm:mt-3">{subtitle}</p>
      </div>

      <div className="auth-motion auth-motion-form auth-card-form">{children}</div>

      {footer ? (
        <div className="auth-motion auth-motion-footer auth-card-footer border-t border-[var(--color-border-subtle)] text-center text-base text-[var(--color-text-muted)]">
          {footer}
        </div>
      ) : null}
    </section>
  )
}
