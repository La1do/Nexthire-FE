import type { ReactNode } from 'react'
import './company-access-state.css'

type CompanyAccessStateProps = {
  /** Buttons / links rendered under the text. */
  actions?: ReactNode
  description?: string
  /** `page` fills the viewport (used outside the layout shell), `inline` sits in the content area. */
  size?: 'inline' | 'page'
  title: string
  tone?: 'loading' | 'error' | 'warning'
}

/** Neutral status panel for company RBAC states: checking access, access unknown (error + retry), suspended. */
export function CompanyAccessState({
  actions,
  description,
  size = 'inline',
  title,
  tone = 'loading',
}: CompanyAccessStateProps) {
  return (
    <section
      aria-busy={tone === 'loading' ? true : undefined}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      className={`route-guard-state company-access-state company-access-state--${size} company-access-state--${tone}`}
      role={tone === 'error' ? 'alert' : 'status'}
    >
      <div className="company-access-state__card">
        {tone === 'loading' ? <span aria-hidden="true" className="company-access-state__spinner" /> : null}
        <h2 className="company-access-state__title">{title}</h2>
        {description ? <p className="company-access-state__description">{description}</p> : null}
        {actions ? <div className="company-access-state__actions">{actions}</div> : null}
      </div>
    </section>
  )
}
