type LoadingProps = {
  label?: string
}

export function Loading({ label = 'Dang tai' }: LoadingProps) {
  return (
    <div className="inline-flex items-center gap-3 text-sm font-medium text-[#5f6673]" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#cfd4c7] border-t-[#116a5b]" />
      {label}
    </div>
  )
}
