import { useEffect } from 'react'
import { useTranslations } from '../../i18n'
import './career-guide.css'

const articleMedia = [
  { height: 933, src: '/images/career-interview.jpg', width: 1400 },
  { height: 933, src: '/images/career-cv.jpg', width: 1400 },
  { height: 933, src: '/images/career-growth.jpg', width: 1400 },
] as const

export function CareerGuidePage() {
  const { pages } = useTranslations()
  const content = pages.comingSoon
  const pageContent = content.pages.careerGuide
  const articles = pages.home.articles

  useEffect(() => {
    const targetId = window.location.hash.slice(1)
    if (!targetId) return

    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ block: 'start' })
    })
  }, [])

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
          const media = articleMedia[index]

          return (
            <article className="career-guide-entry" id={`guide-${index + 1}`} key={article.title}>
              <span className="career-guide-number">0{index + 1}</span>
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
              <div className="career-guide-entry-copy">
                <p className="career-guide-category">{article.category}</p>
                <h2>{article.title}</h2>
                <p>{article.description}</p>
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
