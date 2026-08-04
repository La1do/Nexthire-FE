import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslations } from '../../i18n'
import { articleHeroMedia, articleInlineMedia } from '../CareerGuidePage/articleMedia'
import '../CareerGuidePage/career-guide.css'
import './career-guide-detail.css'

export function CareerGuideDetailPage() {
  const { pages } = useTranslations()
  const content = pages.comingSoon
  const pageContent = content.pages.careerGuide
  const articles = pages.home.articles
  const { slug = '' } = useParams()

  const index = articles.items.findIndex((item) => item.slug === slug)
  const article = index >= 0 ? articles.items[index] : undefined

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  if (!article) {
    return (
      <article className="career-guide-page career-guide-detail-page">
        <section className="career-guide-detail-not-found">
          <span>404</span>
          <h1>{pageContent.title}</h1>
          <p>{pageContent.description}</p>
          <a className="career-guide-back" href="/career-guide">
            <span aria-hidden="true">←</span>
            <span>{content.backAction}</span>
          </a>
        </section>
      </article>
    )
  }

  const media = articleHeroMedia[index]
  const inlineMedia = articleInlineMedia[index]
  let inlineImageRendered = false

  return (
    <article className="career-guide-page career-guide-detail-page">
      <a className="career-guide-back" href="/career-guide">
        <span aria-hidden="true">←</span>
        <span>{articles.title}</span>
      </a>

      <header className="career-guide-detail-header">
        <p className="career-guide-category">{article.category}</p>
        <h1>{article.title}</h1>
        <p className="career-guide-standfirst">{article.description}</p>
        <p className="career-guide-byline">
          <span className="career-guide-byline-author">{article.author}</span>
          <span aria-hidden="true">·</span>
          <span>{article.authorRole}</span>
          <span aria-hidden="true">·</span>
          <span>{article.date}</span>
          <span aria-hidden="true">·</span>
          <span>{article.readingTime}</span>
        </p>
      </header>

      <figure className="career-guide-detail-figure">
        <img alt="" aria-hidden="true" decoding="async" height={media.height} loading="eager" src={media.src} width={media.width} />
      </figure>

      <div className="career-guide-body career-guide-detail-body">
        {article.content.map((block, blockIndex) => {
          if (block.type === 'paragraph') {
            return <p key={blockIndex}>{block.text}</p>
          }

          if (block.type === 'heading') {
            const shouldRenderInlineImage = !inlineImageRendered
            inlineImageRendered = true

            return (
              <div key={blockIndex}>
                <h3>{block.text}</h3>
                {shouldRenderInlineImage && (
                  <figure className="career-guide-inline-figure">
                    <img
                      alt=""
                      aria-hidden="true"
                      decoding="async"
                      height={inlineMedia.height}
                      loading="lazy"
                      src={inlineMedia.src}
                      width={inlineMedia.width}
                    />
                  </figure>
                )}
              </div>
            )
          }

          if (block.type === 'quote') {
            return (
              <blockquote className="career-guide-quote" key={blockIndex}>
                <p>{block.text}</p>
                <cite>{block.attribution}</cite>
              </blockquote>
            )
          }

          return (
            <ul className="career-guide-list" key={blockIndex}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          )
        })}
      </div>

      <footer className="career-guide-close">
        <p>{content.description}</p>
        <a href="/career-guide">
          <span>{pageContent.backLabel}</span>
          <span aria-hidden="true">→</span>
        </a>
      </footer>
    </article>
  )
}

export default CareerGuideDetailPage
