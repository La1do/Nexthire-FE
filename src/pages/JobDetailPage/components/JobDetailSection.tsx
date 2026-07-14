import type { JobDetailSectionData } from '../utils/jobDetailData'

type JobDetailSectionProps = {
  section: JobDetailSectionData
}

export function JobDetailSection({ section }: JobDetailSectionProps) {
  return (
    <section className="job-detail-section job-detail-motion">
      <h2>{section.title}</h2>

      {section.body ? <p>{section.body}</p> : null}

      {section.items ? (
        <ul className="job-detail-list">
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
