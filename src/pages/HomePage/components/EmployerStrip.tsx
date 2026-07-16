import type { HomeTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from '../../_components/CompanyLogoMark'
import { createCompanyDetailHref } from '../../_utils/jobRoutes'
import { SectionHeading } from './SectionHeading'

type EmployerStripProps = {
  content: HomeTranslations['employers']
}

export function EmployerStrip({ content }: EmployerStripProps) {
  return (
    <section className="home-section home-reveal">
      <SectionHeading action={content.viewAll} eyebrow={content.eyebrow} title={content.title} />
      <div className="home-employer-strip">
        {content.items.map((item) => (
          <a className="home-employer-card home-hover-card" href={createCompanyDetailHref(item.name)} key={item.name}>
            <CompanyLogoMark
              alt={item.logoAlt}
              fallbackText={item.logoText}
              src={item.logoSrc}
              tone={item.tone}
            />
            <span>
              <strong>{item.name}</strong>
              <small>{item.openRoles}</small>
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
