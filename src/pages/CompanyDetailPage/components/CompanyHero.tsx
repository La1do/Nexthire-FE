import type { CompanyDetailTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components'
import type { CompanyDetailViewModel } from '../utils/companyDetailMappers'

type CompanyHeroProps = {
  company: CompanyDetailViewModel
  content: CompanyDetailTranslations
}

export function CompanyHero({ company, content }: CompanyHeroProps) {
  const heroClassName = company.heroImageUrl
    ? 'company-detail-hero company-detail-motion'
    : 'company-detail-hero company-detail-hero-without-media company-detail-motion'
  const heroImage = company.heroImageUrl ? (
    <img alt="" src={company.heroImageUrl} />
  ) : null

  return (
    <section className={heroClassName}>
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
          <button type="button">{content.hero.follow}</button>
        </div>
      </div>

      {company.heroImageUrl && company.website ? (
        <a
          aria-label={content.hero.websiteLabel}
          className="company-detail-hero-media"
          href={company.website}
          rel="noreferrer"
          target="_blank"
        >
          {heroImage}
        </a>
      ) : null}
      {company.heroImageUrl && !company.website ? (
        <div className="company-detail-hero-media">{heroImage}</div>
      ) : null}
    </section>
  )
}
