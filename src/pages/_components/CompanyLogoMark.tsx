import { useEffect, useState } from 'react'

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

  useEffect(() => {
    setFailed(false)
  }, [src])

  const classes = ['company-logo-mark', `company-logo-mark-${tone}`, className].filter(Boolean).join(' ')
  const trimmedSrc = typeof src === 'string' ? src.trim() : ''
  const safeSrc = trimmedSrc && !isBrokenDemoCdnUrl(trimmedSrc) ? trimmedSrc : ''
  const showImage = Boolean(safeSrc) && !failed

  return (
    <span className={classes}>
      {showImage ? (
        <img
          alt={alt}
          decoding="async"
          loading="lazy"
          onError={() => setFailed(true)}
          src={safeSrc}
        />
      ) : (
        <span>{fallbackText}</span>
      )}
    </span>
  )
}
