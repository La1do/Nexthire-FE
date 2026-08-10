import type { HomeTranslations } from '../../../i18n/types'

type PhotoPromoBannerProps = {
  content: HomeTranslations['promoBanners'][number] | undefined
}

export function PhotoPromoBanner({ content }: PhotoPromoBannerProps) {
  if (!content) {
    return null
  }

  return (
    <section
      aria-label={content.title}
      className="home-section home-photo-promo-section"
      data-home-reveal
    >
      <a
        aria-label={content.imageAlt}
        className="home-photo-promo"
        href={content.href}
      >
        <img
          alt=""
          aria-hidden="true"
          className="home-photo-promo-image"
          decoding="async"
          height={content.image.height}
          loading="lazy"
          src={content.image.src}
          width={content.image.width}
        />
        <span aria-hidden="true" className="home-photo-promo-overlay" />
        <span className="home-photo-promo-copy">
          <span className="home-photo-promo-eyebrow">{content.viewAll}</span>
          <span className="home-photo-promo-title">{content.title}</span>
          <span className="home-photo-promo-cta">
            <span>{content.viewAll}</span>
            <span aria-hidden="true">→</span>
          </span>
        </span>
      </a>
    </section>
  )
}