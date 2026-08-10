import { useTranslations } from '../../i18n'
import type { InfoPageKey } from '../../i18n/types'
import './info-page.css'

type InfoPageProps = {
  pageKey: InfoPageKey
}

export function InfoPage({ pageKey }: InfoPageProps) {
  const { pages } = useTranslations()
  const content = pages.infoPages.pages[pageKey]

  return (
    <article className="info-page">
      <header className="info-page-hero">
        <span className="info-page-badge">{content.badge}</span>
        <p className="info-page-eyebrow">{content.hero.eyebrow}</p>
        <h1 className="info-page-title">{content.hero.title}</h1>
        <p className="info-page-lede">{content.hero.description}</p>
      </header>

      <p className="info-page-intro">{content.intro}</p>

      <section className="info-page-sections" aria-label={content.hero.title}>
        {content.sections.map((section) => (
          <article className="info-page-section" key={section.title}>
            <h2 className="info-page-section-title">{section.title}</h2>
            <p className="info-page-section-description">{section.description}</p>
            {section.bullets && section.bullets.length > 0 ? (
              <ul className="info-page-section-bullets">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </section>

      <aside className="info-page-cta" aria-label={content.cta.title}>
        <h2 className="info-page-cta-title">{content.cta.title}</h2>
        <p className="info-page-cta-description">{content.cta.description}</p>
        <div className="info-page-cta-actions">
          <a className="info-page-cta-primary" href={content.cta.primaryHref}>
            <span>{content.cta.primaryLabel}</span>
            <span aria-hidden="true">→</span>
          </a>
          {content.cta.secondaryLabel && content.cta.secondaryHref ? (
            <a className="info-page-cta-secondary" href={content.cta.secondaryHref}>
              <span>{content.cta.secondaryLabel}</span>
            </a>
          ) : null}
        </div>
      </aside>
    </article>
  )
}

export default InfoPage
