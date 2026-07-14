import type { HomeTranslations } from '../../../i18n/types'

type ArticleGridProps = {
  content: HomeTranslations['articles']
}

export function ArticleGrid({ content }: ArticleGridProps) {
  return (
    <section className="home-section home-reveal">
      <h2 className="home-simple-title">{content.title}</h2>
      <div className="home-article-grid">
        {content.items.map((article) => (
          <article className="home-article-card home-hover-card" key={article.title}>
            <div className={`home-article-media home-article-media-${article.tone}`}>
              <span>{article.category}</span>
            </div>
            <h3>{article.title}</h3>
            <p>{article.description}</p>
            <a href="/">
              {content.readMore}
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
