import type { CompanyDetailTranslations } from '../../../i18n/types'
import type { CompanyDetailViewModel } from '../utils/companyDetailData'

type CompanySnapshotProps = {
  company: CompanyDetailViewModel
  content: CompanyDetailTranslations['snapshot']
}

export function CompanySnapshot({ company, content }: CompanySnapshotProps) {
  const stats = [
    {
      label: content.openJobs,
      value: String(company.openJobs.length),
    },
    {
      label: content.size,
      value: company.size,
    },
    {
      label: content.responseTime,
      value: company.responseTime,
    },
    {
      label: content.location,
      value: company.location,
    },
  ]

  return (
    <section aria-label={content.openJobs} className="company-detail-snapshot">
      {stats.map((stat) => (
        <div className="company-detail-stat company-detail-motion" key={stat.label}>
          <span>{stat.label}</span>
          <strong>{stat.value}</strong>
        </div>
      ))}
    </section>
  )
}
