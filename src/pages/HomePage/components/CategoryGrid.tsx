import type { HomeTranslations } from '../../../i18n/types'
import { SectionHeading } from './SectionHeading'

type CategoryGridProps = {
  content: HomeTranslations['categories']
}

type CategoryIconProps = {
  icon: HomeTranslations['categories']['items'][number]['icon']
}

function CategoryIcon({ icon }: CategoryIconProps) {
  if (icon === 'code') {
    return (
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
        <path d="m8 9-4 3 4 3" />
        <path d="m16 9 4 3-4 3" />
        <path d="m14 5-4 14" />
      </svg>
    )
  }

  if (icon === 'design') {
    return (
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 6h16v12H4z" />
        <path d="M8 10h8" />
        <path d="M8 14h5" />
      </svg>
    )
  }

  if (icon === 'data') {
    return (
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
        <ellipse cx="12" cy="6" rx="7" ry="3" />
        <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
        <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
      </svg>
    )
  }

  if (icon === 'marketing') {
    return (
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 13V7l12-3v16L4 17v-4Z" />
        <path d="M18 9h2" />
        <path d="M18 15h2" />
      </svg>
    )
  }

  if (icon === 'support') {
    return (
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" />
        <path d="M9 10a3 3 0 1 1 5 2.2c-.8.5-1.2 1-1.2 1.8" />
        <path d="M12 17h.01" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 7h16v12H4z" />
      <path d="M9 7V5h6v2" />
    </svg>
  )
}

export function CategoryGrid({ content }: CategoryGridProps) {
  return (
    <section className="home-section home-reveal">
      <div className="home-category-heading">
        <SectionHeading eyebrow={content.eyebrow} title={content.title} />
        <div className="home-category-actions">
          <button aria-label={content.previous} type="button">
            <span aria-hidden="true">←</span>
          </button>
          <button aria-label={content.next} type="button">
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div className="home-category-grid">
        {content.items.map((item) => (
          <article className="home-category-card home-hover-card" key={item.title}>
            <span className="home-category-icon">
              <CategoryIcon icon={item.icon} />
            </span>
            <span>
              <strong>{item.title}</strong>
              <small>{item.count}</small>
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}
