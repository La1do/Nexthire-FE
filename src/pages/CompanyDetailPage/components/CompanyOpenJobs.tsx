import type { CompanyDetailTranslations } from '../../../i18n/types'
import { JobCard } from '../../HomePage/components/JobCard'
import type { CompanyDetailViewModel } from '../utils/companyDetailMappers'

type CompanyOpenJobsProps = {
  company: CompanyDetailViewModel
  content: CompanyDetailTranslations['openJobs']
  title: string
}

export function CompanyOpenJobs({ company, content, title }: CompanyOpenJobsProps) {
  return (
    <section className="company-detail-panel company-detail-open-jobs company-detail-motion" id="company-open-jobs">
      <div className="company-detail-section-heading">
        <div>
          <h2>{title}</h2>
          <p>{content.description}</p>
        </div>
      </div>

      {company.openJobs.length ? (
        <div className="company-detail-job-grid">
          {company.openJobs.map((job) => (
            <JobCard
              job={job}
              key={job.id}
              saveLabel={content.saveLabel}
              variant="compact"
            />
          ))}
        </div>
      ) : (
        <div className="company-detail-empty">
          <strong>{content.emptyTitle}</strong>
          <p>{content.emptyDescription}</p>
        </div>
      )}
    </section>
  )
}
