import type { HomeTranslations } from '../../../i18n/types'
import { SectionHeading } from './SectionHeading'

type ArticleGridProps = {
  content: HomeTranslations['articles']
}

export function ArticleGrid({ content }: ArticleGridProps) {
  return (
    <section className="home-section home-article-section" data-home-reveal>
      <SectionHeading action={content.readMore} actionHref="/career-guide" title={content.title} />
      <div className="home-article-grid">
        {content.items.map((article, index) => (
          <article className="home-article-card" key={article.title}>
            <div className={`home-article-media home-article-media-${article.tone}`}>
              <span className="home-article-number">0{index + 1}</span>
              <span className="home-article-category">{article.category}</span>
            </div>
            <div className="home-article-copy">
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <a href="/career-guide">
                <span>{content.readMore}</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
