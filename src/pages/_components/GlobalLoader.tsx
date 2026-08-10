import type { CSSProperties } from 'react'
import { useGlobalLoader } from '../../context'
import { useTranslations } from '../../i18n'

const cvParticles = [
  { delay: '0ms', x: '-4.9rem', y: '-3.7rem' },
  { delay: '420ms', x: '4.5rem', y: '-3.2rem' },
  { delay: '840ms', x: '-5.1rem', y: '2.2rem' },
  { delay: '1260ms', x: '4.9rem', y: '2.8rem' },
  { delay: '1680ms', x: '0.2rem', y: '-5.2rem' },
] as const

const briefcaseParticles = [
  { delay: '260ms', x: '-5.2rem', y: '4.2rem' },
  { delay: '940ms', x: '5.4rem', y: '3.8rem' },
  { delay: '1560ms', x: '0.3rem', y: '-5.7rem' },
] as const

function CvIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 32 38">
      <path d="M7 2.5h12.2L26 9.4v26.1H7z" />
      <path d="M19 2.5v7h7" />
      <path d="M11 17h10M11 22h8M11 27h11" />
    </svg>
  )
}

function BriefcaseIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 38 34">
      <path d="M4.5 10.5h29v19h-29z" />
      <path d="M13.5 10.5V7.2c0-1.5 1.2-2.7 2.7-2.7h5.6c1.5 0 2.7 1.2 2.7 2.7v3.3" />
      <path d="M4.5 17.5h29M17 18.5h4" />
    </svg>
  )
}

function particleStyle(particle: { delay: string; x: string; y: string }) {
  return {
    '--global-loader-delay': particle.delay,
    '--global-loader-x': particle.x,
    '--global-loader-y': particle.y,
  } as CSSProperties
}

function OrbitLoader({ brandName }: { brandName: string }) {
  return (
    <div aria-hidden="true" className="global-loader-orbit">
      <span className="global-loader-orbit__ring global-loader-orbit__ring--outer" />
      <span className="global-loader-orbit__ring global-loader-orbit__ring--inner" />

      {cvParticles.map((particle) => (
        <span
          className="global-loader-orbit__particle global-loader-orbit__particle--cv"
          key={`cv-${particle.delay}`}
          style={particleStyle(particle)}
        >
          <CvIcon />
        </span>
      ))}

      {briefcaseParticles.map((particle) => (
        <span
          className="global-loader-orbit__particle global-loader-orbit__particle--briefcase"
          key={`briefcase-${particle.delay}`}
          style={particleStyle(particle)}
        >
          <BriefcaseIcon />
        </span>
      ))}

      <span className="global-loader-orbit__brand">
        <img alt="" src="/brand/nexhire-icon.png" />
        <span>{brandName}</span>
      </span>
    </div>
  )
}

export function GlobalLoader() {
  const { common } = useTranslations()
  const { isVisible, label, mode } = useGlobalLoader()
  const loaderLabel = label ?? common.loader.defaultLabel

  if (!isVisible) {
    return null
  }

  if (mode === 'bar') {
    return (
      <section
        aria-busy="true"
        aria-label={common.loader.regionLabel}
        aria-live="polite"
        className="global-loader-bar"
        role="status"
      >
        <span className="global-loader-bar__label">{loaderLabel}</span>
        <span className="global-loader-bar__track">
          <span />
        </span>
      </section>
    )
  }

  return (
    <section
      aria-busy="true"
      aria-label={common.loader.regionLabel}
      aria-live="polite"
      className="global-loader-overlay"
      role="status"
    >
      <div className="global-loader-overlay__card">
        <OrbitLoader brandName={common.brandName} />
        <p>{loaderLabel}</p>
      </div>
    </section>
  )
}
