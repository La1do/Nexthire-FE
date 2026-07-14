import type { FormEvent } from 'react'
import type { HomeTranslations } from '../../../i18n/types'

type HeroPanelProps = {
  content: HomeTranslations['hero']
}

export function HeroPanel({ content }: HeroPanelProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <section className="home-hero home-reveal">
      <div className="home-hero-copy">
        <p className="home-pill">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="home-hero-description">{content.description}</p>
        <form className="home-search" onSubmit={handleSubmit}>
          <label>
            <span>{content.keywordLabel}</span>
            <input placeholder={content.keywordPlaceholder} type="search" />
          </label>
          <label>
            <span>{content.locationLabel}</span>
            <input placeholder={content.locationPlaceholder} type="search" />
          </label>
          <button type="submit">{content.submit}</button>
        </form>
      </div>

      <div className="home-hero-board" aria-hidden="true">
        <div className="home-partner-grid">
          {content.partnerBadges.map((badge) => (
            <article className="home-partner-badge" key={`${badge.title}-${badge.subtitle}`}>
              <strong>{badge.title}</strong>
              <span>{badge.subtitle}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
