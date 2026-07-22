import type { HomeTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components/CompanyLogoMark'
import { createCompanyDetailHrefById } from '../../_utils/jobRoutes'
import type { FeaturedCompanyView } from '../types'
import { HomeSectionState } from './HomeSectionState'
import { SectionHeading } from './SectionHeading'

type EmployerStripProps = {
  content: HomeTranslations['employers']
  states: HomeTranslations['states']
  companies: ReadonlyArray<FeaturedCompanyView>
  loading: boolean
  error: unknown
}

export function EmployerStrip({ content, states, companies, loading, error }: EmployerStripProps) {
  const isEmpty = !companies.length
  const showPlaceholder = loading || Boolean(error) || isEmpty

  return (
    <section className="home-section home-employer-section" data-home-reveal>
      <SectionHeading action={content.viewAll} actionHref="/companies" title={content.title} />
      {showPlaceholder ? (
        <HomeSectionState error={error} isEmpty={isEmpty} loading={loading} states={states} />
      ) : (
        <div className="home-employer-strip">
          {companies.map((item) => (
            <a className="home-employer-card" href={createCompanyDetailHrefById(item.companyId)} key={item.companyId}>
              <CompanyLogoMark
                alt={item.logo.alt}
                fallbackText={item.logo.fallbackText}
                src={item.logo.src}
                tone={item.logo.tone}
              />
              <span>
                <strong>{item.name}</strong>
                <small>{item.openRoles}</small>
              </span>
              <span aria-hidden="true" className="home-employer-arrow">↗</span>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
