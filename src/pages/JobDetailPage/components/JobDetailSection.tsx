import { HeartHandshake, Lightbulb, Sliders } from 'lucide-react'
import type { JobDetailHighlightBox, JobDetailSectionView } from '../types'
import { parseJobContent } from '../utils/jobContentParser'

type JobDetailSectionProps = {
  section: JobDetailSectionView
  candidateHighlights?: JobDetailHighlightBox[]
  supplementalBenefits?: string[]
  candidateNote?: string
}

export function JobDetailSection({
  section,
  candidateHighlights,
  supplementalBenefits,
  candidateNote,
}: JobDetailSectionProps) {
  const blocks = parseJobContent(section.body)
  const isRequirements =
    section.key === 'requirements' ||
    section.title.toLowerCase().includes('yêu cầu') ||
    section.title.toLowerCase().includes('requirement')
  const isBenefits =
    section.key === 'benefits' ||
    section.title.toLowerCase().includes('quyền lợi') ||
    section.title.toLowerCase().includes('đãi ngộ') ||
    section.title.toLowerCase().includes('benefit')

  const hasHighlights = Boolean(candidateHighlights && candidateHighlights.length > 0)
  const hasSupplementalBenefits = Boolean(supplementalBenefits && supplementalBenefits.length > 0)

  return (
    <section className="job-detail-card job-detail-section-card">
      <header className="job-detail-card__header">
        <h2 className="job-detail-card__title">{section.title}</h2>
      </header>

      <div className="job-detail-card__content">
        {blocks.map((block, index) => {
          if (block.type === 'lead') {
            return (
              <p key={index} className="job-detail-section-card__lead">
                {block.text}
              </p>
            )
          }

          if (block.type === 'subheading') {
            return (
              <h3 key={index} className="job-detail-section-card__subheading">
                {block.text}
              </h3>
            )
          }

          if (block.type === 'list') {
            return (
              <ul key={index} className="job-detail-bullet-list">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="job-detail-bullet-item">
                    <span className="job-detail-bullet-dot">•</span>
                    <span className="job-detail-bullet-text">{item}</span>
                  </li>
                ))}
              </ul>
            )
          }

          return (
            <p key={index} className="job-detail-section-card__paragraph">
              {block.text}
            </p>
          )
        })}

        {isRequirements && (candidateNote || hasHighlights) && (
          <div className="job-detail-requirements-extras">
            {candidateNote && (
              <p className="job-detail-requirements-note">{candidateNote}</p>
            )}

            {hasHighlights && candidateHighlights && (
              <div className="job-detail-highlight-boxes">
                {candidateHighlights.map((box, idx) => (
                  <div key={idx} className="job-detail-highlight-box">
                    <div className="job-detail-highlight-box__icon-wrap">
                      {box.iconType === 'knowledge' ? (
                        <Lightbulb size={18} className="job-detail-highlight-box__icon" />
                      ) : (
                        <Sliders size={18} className="job-detail-highlight-box__icon" />
                      )}
                    </div>
                    <div className="job-detail-highlight-box__content">
                      <span className="job-detail-highlight-box__label">{box.label}</span>
                      <strong className="job-detail-highlight-box__value">{box.value}</strong>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isBenefits && hasSupplementalBenefits && supplementalBenefits && (
          <div className="job-detail-benefits-supplemental">
            <h4 className="job-detail-supplemental-heading">QUYỀN LỢI BỔ SUNG</h4>
            <div className="job-detail-highlight-box">
              <div className="job-detail-highlight-box__icon-wrap">
                <HeartHandshake size={18} className="job-detail-highlight-box__icon" />
              </div>
              <div className="job-detail-highlight-box__content">
                <span className="job-detail-highlight-box__label">Phúc lợi</span>
                <strong className="job-detail-highlight-box__value">
                  {supplementalBenefits.join(', ')}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
