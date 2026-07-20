import type { JobDetailTranslations } from '../../../i18n/types'
import type { JobDetailView } from '../types'

type JobDetailSidebarProps = {
  content: JobDetailTranslations['sidebar']
  job: JobDetailView
}

export function JobDetailSidebar({ content, job }: JobDetailSidebarProps) {
  const overviewItems = [
    { label: content.salary, value: job.salary },
    { label: content.location, value: job.location },
    { label: content.workMode, value: job.workMode },
    { label: content.postedAt, value: job.postedAt },
    { label: content.deadline, value: job.deadline ?? content.noDeadline },
    job.openings != null ? { label: content.openings, value: String(job.openings) } : null,
  ].filter((item): item is { label: string; value: string } => item !== null)

  return (
    <aside className="job-detail-sidebar">
      <div className="job-detail-panel job-detail-motion">
        <h2>{content.title}</h2>

        <dl className="job-detail-overview-list">
          {overviewItems.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="job-detail-actions">
          <a href="/login">{content.apply}</a>
          <button type="button">{content.save}</button>
        </div>
      </div>
    </aside>
  )
}
