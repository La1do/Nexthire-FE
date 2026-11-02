import { useParams } from 'react-router-dom'
import { useSavedJobsHydrate } from '../../hooks/useSavedJobsHydrate'
import { useTranslations } from '../../i18n'
import { EmptyState, Loading } from '../_components'
import { JobDetailBreadcrumb } from './components/JobDetailBreadcrumb'
import { JobDetailHero } from './components/JobDetailHero'
import { JobDetailLocationTimeCard } from './components/JobDetailLocationTimeCard'
import { JobDetailOverview } from './components/JobDetailOverview'
import { JobDetailSection } from './components/JobDetailSection'
import { JobDetailSidebar } from './components/JobDetailSidebar'
import { JobDetailTrustBanner } from './components/JobDetailTrustBanner'
import { RelatedJobs } from './components/RelatedJobs'
import { useJobDetail } from './hooks/useJobDetail'
import './job-detail.css'

export function JobDetailPage() {
  const { pages } = useTranslations()
  const content = pages.jobDetail
  const { id = '' } = useParams()
  useSavedJobsHydrate(id ? [id] : [])
  const { job, sections, related, loading, error, notFound } = useJobDetail(id)

  if (loading) {
    return (
      <div className="job-detail-page-wrapper">
        <div className="job-detail-state">
          <Loading label={content.states.loading} />
        </div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="job-detail-page-wrapper">
        <section className="job-detail-not-found">
          <span>404</span>
          <h1>{content.notFound?.title || 'Không tìm thấy việc làm'}</h1>
          <p>{content.notFound?.description || 'Việc làm này không tồn tại hoặc đã hết hạn.'}</p>
          <a href="/search">{content.notFound?.action || 'Tìm việc khác'}</a>
        </section>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="job-detail-page-wrapper">
        <div className="job-detail-state">
          <EmptyState
            description={content.states.errorDescription}
            title={content.states.errorTitle}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="job-detail-page-wrapper">
      <div className="job-detail-container">
        {/* Top Breadcrumb */}
        <JobDetailBreadcrumb
          categoryName={job.categoryName}
          title={job.title}
        />

        {/* Hero Card */}
        <JobDetailHero content={content.sidebar} job={job} />

        {/* Trust Guarantee Banner */}
        <JobDetailTrustBanner />

        {/* Main 2-Column Content */}
        <div className="job-detail-layout">
          <div className="job-detail-content">
            {/* Overview / Tổng quan */}
            <JobDetailOverview data={job.overview} />

            {/* Content Sections: Mô tả công việc, Yêu cầu ứng viên, Quyền lợi ứng viên */}
            {sections.map((section) => (
              <JobDetailSection
                candidateHighlights={job.candidateHighlights}
                key={section.title}
                section={section}
                supplementalBenefits={job.supplementalBenefits}
              />
            ))}

            {/* Địa điểm và thời gian */}
            <JobDetailLocationTimeCard
              content={content.sidebar}
              data={job.locationTime}
              job={job}
            />

            {/* Việc làm liên quan */}
            <RelatedJobs content={content.related} jobs={related} />
          </div>

          {/* Right Sidebar */}
          <JobDetailSidebar content={content.sidebar} job={job} />
        </div>
      </div>
    </div>
  )
}

export default JobDetailPage
