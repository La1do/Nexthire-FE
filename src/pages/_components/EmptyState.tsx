type EmptyStateProps = {
  title: string
  description: string
}

export function EmptyState({ description, title }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-[#cfd4c7] bg-white p-6 text-center">
      <h2 className="text-base font-semibold text-[#20242c]">{title}</h2>
      <p className="mt-2 text-sm text-[#5f6673]">{description}</p>
    </div>
  )
}
