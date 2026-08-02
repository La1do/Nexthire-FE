import type { HomeTranslations } from '../../../i18n/types'
import type { CategoryIconKind, CategoryView } from '../types'
import { HomeSectionState } from './HomeSectionState'
import { SectionHeading } from './SectionHeading'

type CategoryGridProps = {
  content: HomeTranslations['categories']
  states: HomeTranslations['states']
  categories: ReadonlyArray<CategoryView>
  loading: boolean
  error: unknown
}

type CategoryIconProps = {
  icon: CategoryIconKind
}

function CategoryIcon({ icon }: CategoryIconProps) {
  const iconProps = {
    'aria-hidden': true,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: '1.8',
    viewBox: '0 0 24 24',
  }

  if (icon === 'code') {
    return (
      <svg {...iconProps}>
        <path d="m8 9-4 3 4 3" />
        <path d="m16 9 4 3-4 3" />
        <path d="m14 5-4 14" />
      </svg>
    )
  }

  if (icon === 'design') {
    return (
      <svg {...iconProps}>
        <path d="m12 3 3 5.5-3 3-3-3L12 3Z" />
        <path d="m9 8.5-4.5 4.6a2.8 2.8 0 0 0 0 4l2.4 2.4a2.8 2.8 0 0 0 4 0l4.6-4.5" />
        <path d="m14.8 5.8 3.4-2 2 2-2 3.4" />
        <path d="M6.5 15.5h.01" />
      </svg>
    )
  }

  if (icon === 'data') {
    return (
      <svg {...iconProps}>
        <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
        <path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
        <path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
      </svg>
    )
  }

  if (icon === 'marketing') {
    return (
      <svg {...iconProps}>
        <path d="M4 10v4a2 2 0 0 0 2 2h2l8 4V4L8 8H6a2 2 0 0 0-2 2Z" />
        <path d="m8 16 1.5 4h3" />
        <path d="M19 9.5v5" />
      </svg>
    )
  }

  if (icon === 'support') {
    return (
      <svg {...iconProps}>
        <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
        <path d="M4 13a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2v-2Z" />
        <path d="M20 13a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2Z" />
        <path d="M17 17c0 2-1.8 3-4 3h-1" />
      </svg>
    )
  }

  if (icon === 'all') {
    return (
      <svg {...iconProps}>
        <rect height="6" rx="1" width="6" x="3" y="3" />
        <rect height="6" rx="1" width="6" x="15" y="3" />
        <rect height="6" rx="1" width="6" x="3" y="15" />
        <rect height="6" rx="1" width="6" x="15" y="15" />
      </svg>
    )
  }

  return (
    <svg {...iconProps}>
      <path d="M4 8.5h16v10.75a1.75 1.75 0 0 1-1.75 1.75H5.75A1.75 1.75 0 0 1 4 19.25V8.5Z" />
      <path d="M9 8.5V6.25C9 5.56 9.56 5 10.25 5h3.5c.69 0 1.25.56 1.25 1.25V8.5" />
      <path d="M4 13h16" />
      <path d="M10 13v1.5h4V13" />
    </svg>
  )
}

export function CategoryGrid({ content, states, categories, loading, error }: CategoryGridProps) {
  const isEmpty = !categories.length
  const showPlaceholder = loading || Boolean(error) || isEmpty

  return (
    <section className="home-section home-category-section" data-home-reveal>
      <SectionHeading title={content.title} />

      {showPlaceholder ? (
        <HomeSectionState error={error} isEmpty={isEmpty} loading={loading} states={states} />
      ) : (
        <div className="home-category-grid">
          {categories.map((item) => (
            <a className="home-category-card" data-icon={item.icon} href={`/search?categoryId=${item.id}`} key={item.id}>
              <span className="home-category-icon">
                <CategoryIcon icon={item.icon} />
              </span>
              <span>
                <strong>{item.title}</strong>
                <small>{item.count}</small>
              </span>
              <small className="home-category-arrow" aria-hidden="true">↗</small>
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
