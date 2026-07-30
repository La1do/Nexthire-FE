import { Button } from '../Button'

type ErrorStateProps = {
  actionLabel?: string
  description: string
  onRetry?: () => void
  title: string
}

export function ErrorState({ actionLabel, description, onRetry, title }: ErrorStateProps) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-card)] p-6 text-center"
      role="alert"
    >
      <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">{description}</p>
      {onRetry && actionLabel ? (
        <Button className="mt-4 min-h-10 px-4 text-sm" onClick={onRetry} variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
