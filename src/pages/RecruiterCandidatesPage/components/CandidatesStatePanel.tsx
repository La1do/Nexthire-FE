import type { ReactNode } from 'react'

type CandidatesStatePanelProps = {
  action?: ReactNode
  description?: string
  role?: 'alert' | 'status'
  title: string
}

/** Loading / empty / error panel of the candidates page. */
export function CandidatesStatePanel({ action, description, role = 'status', title }: CandidatesStatePanelProps) {
  return (
    <section className="recruiter-candidates-empty" role={role}>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action ? <div>{action}</div> : null}
    </section>
  )
}
