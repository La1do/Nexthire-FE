import type { HomeTranslations } from '../../../i18n/types'
import { CompanyLogoMark } from './CompanyLogoMark'
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
          <article className="home-employer-card home-hover-card" key={item.name}>
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
          </article>
        ))}
      </div>
    </section>
  )
}
