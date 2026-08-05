import type { CompanyDetailTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components'
import type { CompanyFollowControl } from '../hooks/useCompanyFollow'
import type { CompanyDetailViewModel } from '../utils/companyDetailMappers'

type CompanyHeroProps = {
  company: CompanyDetailViewModel
  content: CompanyDetailTranslations
  followControl: CompanyFollowControl
}

export function CompanyHero({ company, content, followControl }: CompanyHeroProps) {
  const heroClassName = company.heroImageUrl
    ? 'company-detail-hero company-detail-motion'
    : 'company-detail-hero company-detail-hero-without-media company-detail-motion'
  const heroImage = company.heroImageUrl ? (
    <img alt="" src={company.heroImageUrl} />
  ) : null
  const heroMedia = company.heroImageUrl ? (
    company.website ? (
      <a
        aria-label={content.hero.websiteLabel}
        className="company-detail-hero-media"
        href={company.website}
        rel="noreferrer"
        target="_blank"
      >
        {heroImage}
      </a>
    ) : (
      <div className="company-detail-hero-media">{heroImage}</div>
    )
  ) : (
    <div className="company-detail-hero-media company-detail-hero-media-fallback" aria-hidden="true" />
  )

  return (
    <section className={heroClassName}>
      {heroMedia}

      <div className="company-detail-hero-copy">
        <div className="company-detail-brand-row">
          <CompanyLogoMark
            alt={company.logo.alt}
            className="company-detail-hero-logo"
            fallbackText={company.logo.fallbackText}
            src={company.logo.src}
            tone={company.logo.tone}
          />
          <div>
            <div className="company-detail-company-line">
              <span>{company.industry}</span>
              {company.isVerified ? <small>{content.verifiedLabel}</small> : null}
            </div>
            <h1>{company.name}</h1>
          </div>
        </div>

        <p>{company.description}</p>

        <div className="company-detail-hero-actions">
          <a href="#company-open-jobs">
            {company.openJobs.length} {content.hero.openJobs}
          </a>
          {followControl.canRender ? (
            <button
              aria-pressed={followControl.isFollowed}
              className="company-detail-follow-button"
              data-follow-state={
                followControl.isBusy ? 'loading' : followControl.isFollowed ? 'followed' : 'default'
              }
              disabled={followControl.isBusy}
              onClick={followControl.onToggle}
              title={followControl.title}
              type="button"
            >
              {followControl.label}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
