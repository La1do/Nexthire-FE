import type { HomeTranslations } from '../../../i18n/types'
import { SectionHeading } from './SectionHeading'

type PromoBannerProps = {
  content: HomeTranslations['promoBanners'][number] | undefined
}

export function PromoBanner({ content }: PromoBannerProps) {
  if (!content) {
    return null
  }

  return (
    <section
      aria-label={content.title}
      className="home-section home-promo-banner-section"
      data-home-reveal
    >
      <SectionHeading action={content.viewAll} actionHref={content.href} title={content.title} />
      <a
        aria-label={content.title}
        className="home-promo-banner"
        href={content.href}
      >
        <img
          alt={content.imageAlt}
          className="home-promo-banner-image"
          decoding="async"
          height={content.image.height}
          loading="lazy"
          src={content.image.src}
          width={content.image.width}
        />
      </a>
    </section>
  )
}