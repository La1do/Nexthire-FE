import { useTranslations } from '../../i18n'
import { articleHeroMedia } from './articleMedia'
import './career-guide.css'

export function CareerGuidePage() {
  const { pages } = useTranslations()
  const content = pages.comingSoon
  const pageContent = content.pages.careerGuide
  const articles = pages.home.articles

  return (
    <article className="career-guide-page">
      <header className="career-guide-intro">
        <div className="career-guide-intro-copy">
          <p className="career-guide-status">
            <span aria-hidden="true" />
            {content.badge}
          </p>
          <h1>{pageContent.title}</h1>
          <p className="career-guide-lede">{pageContent.description}</p>
        </div>
        <a className="career-guide-back" href={pageContent.backHref}>
          <span>{content.backAction}</span>
          <span aria-hidden="true">←</span>
        </a>
      </header>

      <section aria-label={articles.title} className="career-guide-index">
        {articles.items.map((article, index) => {
          const media = articleHeroMedia[index]
          const href = `/career-guide/${article.slug}`

          return (
            <article className="career-guide-entry" key={article.slug}>
              <span className="career-guide-number">0{index + 1}</span>
              <a aria-label={article.title} className="career-guide-figure-link" href={href}>
                <figure className="career-guide-figure">
                  <img
                    alt=""
                    aria-hidden="true"
                    decoding="async"
                    height={media.height}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    src={media.src}
                    width={media.width}
                  />
                </figure>
              </a>
              <div className="career-guide-entry-copy">
                <p className="career-guide-category">{article.category}</p>
                <h2>
                  <a href={href}>{article.title}</a>
                </h2>
                <p className="career-guide-byline">
                  <span className="career-guide-byline-author">{article.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.authorRole}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{article.readingTime}</span>
                </p>
                <p className="career-guide-standfirst">{article.description}</p>
                <a className="career-guide-readmore" href={href}>
                  <span>{articles.readMore}</span>
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          )
        })}
      </section>

      <footer className="career-guide-close">
        <p>{content.description}</p>
        <a href={pageContent.backHref}>
          <span>{pageContent.backLabel}</span>
          <span aria-hidden="true">→</span>
        </a>
      </footer>
    </article>
  )
}

export default CareerGuidePage
