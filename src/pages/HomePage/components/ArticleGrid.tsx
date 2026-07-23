import type { HomeTranslations } from '../../../i18n/types'
import { SectionHeading } from './SectionHeading'

type ArticleGridProps = {
  content: HomeTranslations['articles']
}

const articleMedia = [
  { height: 933, src: '/images/career-interview.jpg', width: 1400 },
  { height: 933, src: '/images/career-cv.jpg', width: 1400 },
  { height: 933, src: '/images/career-growth.jpg', width: 1400 },
] as const

export function ArticleGrid({ content }: ArticleGridProps) {
  return (
    <section className="home-section home-article-section" data-home-reveal id="career-guides">
      <SectionHeading action={content.readMore} actionHref="/career-guide" title={content.title} />
      <div className="home-article-grid">
        {content.items.map((article, index) => {
          const media = articleMedia[index]

          return (
            <article className="home-article-card" key={article.title}>
              <div className="home-article-media">
                <img
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  height={media.height}
                  loading="lazy"
                  src={media.src}
                  width={media.width}
                />
                <div className="home-article-meta">
                  <span className="home-article-number">0{index + 1}</span>
                  <span className="home-article-category">{article.category}</span>
                </div>
              </div>
              <div className="home-article-copy">
                <h3>{article.title}</h3>
                <p>{article.description}</p>
                <a href={`/career-guide#guide-${index + 1}`}>
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
