import { useState } from 'react'

type CompanyLogoMarkProps = {
  alt: string
  className?: string
  fallbackText: string
  src: string
  tone: 'blue' | 'coral' | 'green' | 'violet'
}

export function CompanyLogoMark({ alt, className = '', fallbackText, src, tone }: CompanyLogoMarkProps) {
  const [failed, setFailed] = useState(false)
  const classes = ['company-logo-mark', `company-logo-mark-${tone}`, className].filter(Boolean).join(' ')
  const showImage = Boolean(src) && !failed

  return (
    <span className={classes}>
      {showImage ? (
        <img alt={alt} onError={() => setFailed(true)} src={src} />
      ) : (
        <span>{fallbackText}</span>
      )}
    </span>
  )
}
