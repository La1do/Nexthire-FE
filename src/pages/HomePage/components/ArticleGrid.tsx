import type { HomeTranslations } from '../../../i18n/types'
import { articleHeroMedia } from '../../CareerGuidePage/articleMedia'
import { SectionHeading } from './SectionHeading'

type ArticleGridProps = {
  content: HomeTranslations['articles']
}

export function ArticleGrid({ content }: ArticleGridProps) {
  return (
    <section className="home-section home-article-section" data-home-reveal id="career-guides">
      <SectionHeading action={content.readMore} actionHref="/career-guide" title={content.title} />
      <div className="home-article-grid">
        {content.items.map((article, index) => {
          const media = articleHeroMedia[index]
          const href = `/career-guide/${article.slug}`

          return (
            <article className="home-article-card" key={article.slug}>
              <a aria-label={article.title} className="home-article-media" href={href}>
                <img alt="" aria-hidden="true" decoding="async" height={media.height} loading="lazy" src={media.src} width={media.width} />
                <div className="home-article-meta">
                  <span className="home-article-number">0{index + 1}</span>
                  <span className="home-article-category">{article.category}</span>
                </div>
              </a>
              <div className="home-article-copy">
                <h3>
                  <a href={href}>{article.title}</a>
                </h3>
                <p>{article.description}</p>
                <a href={href}>
                  <span>{content.readMore}</span>
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
