import type { ReactNode } from 'react'
import './applications-state-panel.css'

type ApplicationsStatePanelProps = {
  action?: ReactNode
  description?: string
  role?: 'alert' | 'status'
  title: string
}

/** Shared loading / empty / error panel for both tiers of the applications page. */
export function ApplicationsStatePanel({ action, description, role = 'status', title }: ApplicationsStatePanelProps) {
  return (
    <section className="recruiter-applications-empty recruiter-applications-state" role={role}>
      <p className="recruiter-applications-empty__title">{title}</p>
      {description ? <p className="recruiter-applications-empty__description">{description}</p> : null}
      {action ? <div className="recruiter-applications-state__action">{action}</div> : null}
    </section>
  )
}
