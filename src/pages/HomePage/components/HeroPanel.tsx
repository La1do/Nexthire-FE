import type { HomeTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components/CompanyLogoMark'
import { createCompanyDetailHref } from '../../_utils/jobRoutes'
import { JobSearchBar } from './JobSearchBar'

type HeroPanelProps = {
  content: HomeTranslations['hero']
}

export function HeroPanel({ content }: HeroPanelProps) {
  return (
    <section className="home-hero home-reveal">
      <div className="home-hero-copy">
        <p className="home-pill">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="home-hero-description">{content.description}</p>
        <JobSearchBar content={content} />

        <div className="home-hero-stats">
          {content.stats.map((stat) => (
            <span key={stat.label}>
              <strong>{stat.value}</strong>
              <small>{stat.label}</small>
            </span>
          ))}
        </div>
      </div>

      <div className="home-hero-board">
        <div className="home-hero-board-header">
          <p>{content.spotlight.title}</p>
          <span>{content.spotlight.subtitle}</span>
        </div>
        <div className="home-spotlight-list">
          {content.spotlight.items.map((company) => (
            <a className="home-spotlight-card" href={createCompanyDetailHref(company.name)} key={company.name}>
              <CompanyLogoMark
                alt={company.logoAlt}
                fallbackText={company.logoText}
                src={company.logoSrc}
                tone={company.tone}
              />
              <span>
                <strong>{company.name}</strong>
                <small>{company.openRoles}</small>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
