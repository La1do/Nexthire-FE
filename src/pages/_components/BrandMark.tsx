type BrandMarkProps = {
  label: string
}

export function BrandMark({ label }: BrandMarkProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <span className="brand-gradient grid size-11 place-items-center rounded-lg text-[var(--color-text-inverse)] shadow-sm">
        <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5 10.2 12 4l7 6.2V20a1 1 0 0 1-1 1h-4.2v-5.8H10.2V21H6a1 1 0 0 1-1-1v-9.8Z" />
        </svg>
      </span>
      <span className="text-2xl font-bold text-[var(--color-text-primary)]">{label}</span>
    </div>
  )
}
