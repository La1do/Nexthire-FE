import { ChevronRight, Clock, MapPin, Medal } from 'lucide-react'
import type { JobDetailTranslations } from '../../../i18n/types'
import type { JobDetailView } from '../types'
import { ApplyJobButton } from './ApplyJobButton'
import { SaveJobButton } from './SaveJobButton'

type JobDetailHeroProps = {
  content: JobDetailTranslations['sidebar']
  job: JobDetailView
}

export function JobDetailHero({ content, job }: JobDetailHeroProps) {
  return (
    <section className="job-detail-hero-card">
      <h1 className="job-detail-hero-card__title">{job.title}</h1>

      <div className="job-detail-hero-card__salary-row">
        <span className="job-detail-hero-card__salary">{job.salary}</span>
        <span className="job-detail-hero-card__divider">|</span>
        <a href="#salary-market" className="job-detail-hero-card__salary-link">
          Tra cứu lương thị trường việc làm <ChevronRight size={14} />
        </a>
      </div>

      <div className="job-detail-hero-card__stats">
        <div className="job-detail-hero-card__stat-item">
          <div className="job-detail-hero-card__stat-icon">
            <MapPin size={18} />
          </div>
          <div className="job-detail-hero-card__stat-text">
            <span className="job-detail-hero-card__stat-label">Địa điểm</span>
            <strong className="job-detail-hero-card__stat-value">{job.location}</strong>
          </div>
        </div>

        <div className="job-detail-hero-card__stat-item">
          <div className="job-detail-hero-card__stat-icon">
            <Medal size={18} />
          </div>
          <div className="job-detail-hero-card__stat-text">
            <span className="job-detail-hero-card__stat-label">Kinh nghiệm</span>
            <strong className="job-detail-hero-card__stat-value">
              {job.experienceLevelLabel || '3 năm'}
            </strong>
          </div>
        </div>

        <div className="job-detail-hero-card__stat-item">
          <div className="job-detail-hero-card__stat-icon">
            <Clock size={18} />
          </div>
          <div className="job-detail-hero-card__stat-text">
            <span className="job-detail-hero-card__stat-label">Hạn ứng tuyển</span>
            <strong className="job-detail-hero-card__stat-value">{job.deadline || '30/11/2026'}</strong>
          </div>
        </div>
      </div>

      <div className="job-detail-hero-card__actions">
        <div className="job-detail-hero-card__action-primary">
          <ApplyJobButton content={content} job={job} />
        </div>
        <div className="job-detail-hero-card__action-secondary">
          <SaveJobButton content={content} jobId={job.id} />
        </div>
      </div>
    </section>
  )
}
