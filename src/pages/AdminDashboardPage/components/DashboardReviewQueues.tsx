import { Link } from 'react-router-dom'

type DashboardQueue = {
  count: number
  href: string
  label: string
}

type DashboardReviewQueuesProps = {
  actionLabel: string
  description: string
  queues: DashboardQueue[]
  title: string
}

export function DashboardReviewQueues({
  actionLabel,
  description,
  queues,
  title,
}: DashboardReviewQueuesProps) {
  return (
    <section className="admin-dashboard-panel admin-dashboard-queues">
      <header className="admin-dashboard-panel__header admin-dashboard-queues__header">
        <h2>{title}</h2>
        <p>{description}</p>
      </header>
      <div className="admin-dashboard-queues__grid">
        {queues.map((queue) => (
          <Link className="admin-dashboard-queue" key={queue.href} to={queue.href}>
            <span className="admin-dashboard-queue__summary">
              <span className="admin-dashboard-queue__count">{queue.count}</span>
              <span className="admin-dashboard-queue__label">{queue.label}</span>
            </span>
            <span className="admin-dashboard-queue__action">
              {actionLabel}
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
