import type { FormEvent } from 'react'
import type { HomeTranslations } from '../../../i18n/types'

type NewsletterPanelProps = {
  content: HomeTranslations['newsletter']
}

export function NewsletterPanel({ content }: NewsletterPanelProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <section className="home-newsletter home-reveal">
      <div>
        <p className="home-eyebrow">{content.eyebrow}</p>
        <h2>{content.title}</h2>
        <p>{content.description}</p>
        <div className="home-newsletter-chips">
          {content.chips.map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </div>
        <form className="home-newsletter-form" onSubmit={handleSubmit}>
          <label>
            <span>{content.emailLabel}</span>
            <input autoComplete="email" id="home-newsletter-email" name="email" placeholder={content.emailPlaceholder} type="email" />
          </label>
          <button type="submit">{content.submit}</button>
        </form>
      </div>
      <div className="home-newsletter-card" aria-hidden="true">
        <p>{content.mockTitle}</p>
        {content.mockLines.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </div>
    </section>
  )
}
