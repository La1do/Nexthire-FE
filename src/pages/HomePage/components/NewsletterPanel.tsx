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
    <section className="home-newsletter" data-home-reveal>
      <div className="home-newsletter-copy">
        <h2>{content.title}</h2>
        <p>{content.description}</p>
        <form className="home-newsletter-form" onSubmit={handleSubmit}>
          <label>
            <span>{content.emailLabel}</span>
            <input
              aria-describedby="home-newsletter-email-helper"
              autoComplete="email"
              id="home-newsletter-email"
              name="email"
              placeholder={content.emailPlaceholder}
              required
              type="email"
            />
            <small id="home-newsletter-email-helper">{content.emailHelper}</small>
          </label>
          <button type="submit">{content.submit}</button>
        </form>
      </div>
      <div className="home-newsletter-index" aria-hidden="true">
        <p>{content.mockTitle}</p>
        <ul>
          {content.mockLines.map((line, index) => (
            <li key={line}>
              <span>0{index + 1}</span>
              <strong>{line}</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
