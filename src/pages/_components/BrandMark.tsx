type BrandMarkProps = {
  compact?: boolean
  label: string
  variant?: 'full' | 'inline'
}

export function BrandMark({ compact = false, label, variant = 'inline' }: BrandMarkProps) {
  if (variant === 'full') {
    return (
      <span className="brand-mark brand-mark--full">
        <img alt={label} className="brand-mark__logo" src="/brand/nexhire-logo.png" />
      </span>
    )
  }

  return (
    <span className={`brand-mark brand-mark--inline${compact ? ' brand-mark--compact' : ''}`}>
      <img alt="" aria-hidden="true" className="brand-mark__icon" src="/brand/nexhire-icon.png" />
      <span className="brand-mark__label">{label}</span>
    </span>
  )
}
