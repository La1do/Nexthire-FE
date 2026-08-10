import { useState } from 'react'

type CompanyLogoMarkProps = {
  alt: string
  className?: string
  fallbackText: string
  src: string
  tone: 'blue' | 'coral' | 'green' | 'violet'
}

function isBrokenDemoCdnUrl(src: string) {
  try {
    const url = new URL(src, window.location.origin)
    return url.hostname === 'cdn.nexhire.vn' && url.pathname.startsWith('/demo/')
  } catch {
    return false
  }
}

export function CompanyLogoMark({ alt, className = '', fallbackText, src, tone }: CompanyLogoMarkProps) {
  const [failed, setFailed] = useState(false)
  const classes = ['company-logo-mark', `company-logo-mark-${tone}`, className].filter(Boolean).join(' ')
  const safeSrc = isBrokenDemoCdnUrl(src) ? '' : src
  const showImage = Boolean(safeSrc) && !failed

  return (
    <span className={classes}>
      {showImage ? (
        <img alt={alt} onError={() => setFailed(true)} src={safeSrc} />
      ) : (
        <span>{fallbackText}</span>
      )}
    </span>
  )
}
