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
  const marqueeCompanies = [...companies, ...companies]

  return (
    <section className="home-section home-employer-section" data-home-reveal>
      <SectionHeading action={content.viewAll} actionHref="/companies" title={content.title} />
      {showPlaceholder ? (
        <HomeSectionState error={error} isEmpty={isEmpty} loading={loading} states={states} />
      ) : (
        <div className="home-employer-marquee">
          <div className="home-employer-strip">
            {marqueeCompanies.map((item, index) => {
              const isCopy = index >= companies.length

              return (
                <a
                  aria-hidden={isCopy || undefined}
                  className={`home-employer-card${isCopy ? ' is-copy' : ''}`}
                  href={createCompanyDetailHrefById(item.companyId)}
                  key={`${item.companyId}-${isCopy ? 'copy' : 'source'}`}
                  tabIndex={isCopy ? -1 : undefined}
                >
                  <CompanyLogoMark
                    alt={isCopy ? '' : item.logo.alt}
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
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
