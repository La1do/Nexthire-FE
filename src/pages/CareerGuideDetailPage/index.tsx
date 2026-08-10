import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslations } from '../../i18n'
import { articleHeroMedia, articleInlineMedia } from '../CareerGuidePage/articleMedia'
import '../CareerGuidePage/career-guide.css'
import './career-guide-detail.css'

type GuideBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'quote'; text: string; attribution: string }
  | { type: 'list'; items: string[] }

type GuideSection = {
  heading?: string
  blocks: Array<Exclude<GuideBlock, { type: 'heading' }>>
}

const groupGuideBlocks = (blocks: GuideBlock[]): GuideSection[] => {
  const sections: GuideSection[] = []
  let current: GuideSection = { blocks: [] }

  for (const block of blocks) {
    if (block.type === 'heading') {
      if (current.blocks.length || current.heading) {
        sections.push(current)
      }
      current = { heading: block.text, blocks: [] }
      continue
    }

    current.blocks.push(block)
  }

  if (current.blocks.length || current.heading) {
    sections.push(current)
  }

  return sections
}

export function CareerGuideDetailPage() {
  const { pages } = useTranslations()
  const content = pages.comingSoon
  const pageContent = content.pages.careerGuide
  const articles = pages.home.articles
  const { slug = '' } = useParams()

  const index = articles.items.findIndex((item) => item.slug === slug)
  const article = index >= 0 ? articles.items[index] : undefined
  const sections = useMemo(
    () => (article ? groupGuideBlocks(article.content as GuideBlock[]) : []),
    [article],
  )

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
        </section>
      </article>
    )
  }

  const media = articleHeroMedia[index]
  const inlineMedia = articleInlineMedia[index]
  let inlineImageRendered = false

  return (
    <article className="career-guide-page career-guide-detail-page">
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
        {sections.map((section, sectionIndex) => {
          const shouldRenderInlineImage = Boolean(section.heading) && !inlineImageRendered
          if (shouldRenderInlineImage) {
            inlineImageRendered = true
          }

          return (
            <section
              className={`career-guide-detail-section ${
                section.heading ? '' : 'career-guide-detail-section--intro'
              }`}
              key={sectionIndex}
            >
              {section.heading && (
                <div className="career-guide-detail-section-head">
                  <h3>{section.heading}</h3>
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
              )}

              <div className="career-guide-detail-section-body">
                {section.blocks.map((block, blockIndex) => {
                  if (block.type === 'paragraph') {
                    return (
                      <p className="career-guide-detail-paragraph" key={blockIndex}>
                        {block.text}
                      </p>
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
            </section>
          )
        })}
      </div>
    </article>
  )
}

export default CareerGuideDetailPage
