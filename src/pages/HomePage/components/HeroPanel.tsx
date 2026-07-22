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
  return (
    <section className="home-hero">
      <div className="home-hero-copy">
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

      <aside aria-label={content.spotlight.title} className="home-hero-board">
        <div className="home-hero-board-header">
          <p>{content.spotlight.title}</p>
          <span>{content.spotlight.subtitle}</span>
        </div>
        {spotlight.length ? (
          <div className="home-spotlight-list">
            {spotlight.map((company) => (
              <a className="home-spotlight-card" href={createCompanyDetailHrefById(company.companyId)} key={company.companyId}>
                <CompanyLogoMark
                  alt={company.logo.alt}
                  fallbackText={company.logo.fallbackText}
                  src={company.logo.src}
                  tone={company.logo.tone}
                />
                <span>
                  <strong>{company.name}</strong>
                  <small>{company.openRoles}</small>
                </span>
                <span aria-hidden="true" className="home-spotlight-arrow">↗</span>
              </a>
            ))}
          </div>
        ) : null}
      </aside>

      <div className="home-hero-search">
        <JobSearchBar content={content} />
      </div>
    </section>
  )
}
