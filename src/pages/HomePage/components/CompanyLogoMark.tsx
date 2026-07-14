type CompanyLogoMarkProps = {
  alt: string
  className?: string
  fallbackText: string
  src: string
  tone: 'blue' | 'coral' | 'green' | 'violet'
}

export function CompanyLogoMark({ alt, className = '', fallbackText, src, tone }: CompanyLogoMarkProps) {
  const classes = ['company-logo-mark', `company-logo-mark-${tone}`, className].filter(Boolean).join(' ')

  return (
    <span className={classes}>
      {src ? <img alt={alt} src={src} /> : <span>{fallbackText}</span>}
    </span>
  )
}
