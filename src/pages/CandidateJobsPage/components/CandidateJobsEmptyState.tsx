type CandidateJobsEmptyStateProps = {
  actionHref?: string
  actionLabel: string
  description: string
  onAction?: () => void
  title: string
}

export function CandidateJobsEmptyState({
  actionHref,
  actionLabel,
  description,
  onAction,
  title,
}: CandidateJobsEmptyStateProps) {
  return (
    <section className="candidate-jobs-empty">
      <span aria-hidden="true">0</span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actionHref ? (
        <a href={actionHref}>{actionLabel}</a>
      ) : (
        <button onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </section>
  )
}
