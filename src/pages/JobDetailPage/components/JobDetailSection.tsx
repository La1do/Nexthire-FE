import type { JobDetailSectionView } from '../types'

type JobDetailSectionProps = {
  section: JobDetailSectionView
}

// The API returns free-form text; render each line as its own paragraph so
// multi-line descriptions/requirements keep their structure.
export function JobDetailSection({ section }: JobDetailSectionProps) {
  const paragraphs = section.body.split(/\n+/).filter((line) => line.trim())

  return (
    <section className="job-detail-section job-detail-motion">
      <h2>{section.title}</h2>

      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </section>
  )
}
