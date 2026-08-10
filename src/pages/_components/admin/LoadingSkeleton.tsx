type LoadingSkeletonProps = {
  ariaLabel: string
  lines?: number
}

export function LoadingSkeleton({ ariaLabel, lines = 4 }: LoadingSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-label={ariaLabel}
      className="animate-pulse space-y-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface-card)] p-5"
      role="status"
    >
      {Array.from({ length: lines }, (_, index) => (
        <div
          className={`h-4 rounded bg-[var(--color-surface-muted)] ${
            index === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
          key={index}
        />
      ))}
    </div>
  )
}
