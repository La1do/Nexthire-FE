import type { HomeTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components/CompanyLogoMark'
import { createCompanyDetailHrefById } from '../../_utils/jobRoutes'
import type { FeaturedCompanyView, HeroStatView } from '../types'
import { JobSearchBar } from './JobSearchBar'

type HeroPanelProps = {
  content: HomeTranslations['hero']
  stats: ReadonlyArray<HeroStatView>
  spotlight: ReadonlyArray<FeaturedCompanyView>
}

export function HeroPanel({ content, stats, spotlight }: HeroPanelProps) {
  const spotlightCount = String(spotlight.length).padStart(2, '0')

  return (
    <section className="home-hero">
      <img
        alt=""
        aria-hidden="true"
        className="home-hero-media"
        decoding="async"
        fetchPriority="high"
        height="1067"
        src="/images/home-career-team.jpg"
        width="1600"
      />
      <div className="home-hero-stage">
        <div className="home-hero-copy">
          <p className="home-hero-eyebrow">
            <span aria-hidden="true" />
            {content.eyebrow}
          </p>
          <h1>{content.title}</h1>
          <p className="home-hero-description">{content.description}</p>

          {stats.length ? (
            <div className="home-hero-stats">
              {stats.map((stat) => (
                <span key={stat.label}>
                  <strong>{stat.value}</strong>
                  <small>{stat.label}</small>
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="home-hero-search">
          <JobSearchBar content={content} />
        </div>

        {spotlight.length ? (
          <aside aria-label={content.spotlight.title} className="home-hero-board">
            <div className="home-hero-board-header">
              <span className="home-live-signal">
                <span aria-hidden="true" />
                {content.spotlight.title}
              </span>
              <span aria-hidden="true" className="home-board-index">
                01 / {spotlightCount}
              </span>
            </div>

            <div className="home-opportunity-grid">
              {spotlight.map((company, index) => (
                <a
                  className="home-opportunity-cell"
                  href={createCompanyDetailHrefById(company.companyId)}
                  key={company.companyId}
                >
                  <span aria-hidden="true" className="home-opportunity-number">0{index + 1}</span>
                  <CompanyLogoMark
                    alt={company.logo.alt}
                    fallbackText={company.logo.fallbackText}
                    src={company.logo.src}
                    tone={company.logo.tone}
                  />
                  <span className="home-opportunity-copy">
                    <strong>{company.name}</strong>
                    <small>{company.openRoles}</small>
                  </span>
                  <span aria-hidden="true" className="home-spotlight-arrow">↗</span>
                </a>
              ))}
            </div>

            <div className="home-hero-board-footer">
              <p>{content.spotlight.subtitle}</p>
              <span aria-hidden="true">→</span>
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  )
}
