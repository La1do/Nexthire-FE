import { Info } from 'lucide-react'
import type { JobDetailTranslations } from '../../../i18n/types'
import type { JobDetailLocationTime, JobDetailView } from '../types'
import { ApplyJobButton } from './ApplyJobButton'
import { SaveJobButton } from './SaveJobButton'

type JobDetailLocationTimeCardProps = {
  content: JobDetailTranslations['sidebar']
  job: JobDetailView
  data?: JobDetailLocationTime
}

export function JobDetailLocationTimeCard({ content, job, data }: JobDetailLocationTimeCardProps) {
  const location = data?.workLocation || job.location
  const hours =
    data?.workHours && data.workHours.length > 0
      ? data.workHours
      : ['Thứ 2 - Thứ 6 (từ 08:30 đến 17:30)']
  const applyNote =
    data?.applyNote || 'Ứng viên nộp hồ sơ trực tuyến bằng cách bấm Ứng tuyển ngay dưới đây.'

  return (
    <section className="job-detail-card job-detail-location-time">
      <header className="job-detail-card__header">
        <h2 className="job-detail-card__title">Địa điểm và thời gian</h2>
      </header>

      <div className="job-detail-location-time__body">
        <div className="job-detail-location-time__group">
          <h3 className="job-detail-location-time__subheading">Địa điểm làm việc</h3>
          <ul className="job-detail-bullet-list">
            <li className="job-detail-bullet-item">
              <span className="job-detail-bullet-dot">•</span>
              <span className="job-detail-bullet-text">
                {location.includes(':') ? (
                  <>
                    <strong>{location.split(':')[0]}:</strong>
                    {location.substring(location.indexOf(':') + 1)}
                  </>
                ) : (
                  <strong>{location}</strong>
                )}
              </span>
            </li>
          </ul>
        </div>

        <div className="job-detail-location-time__group">
          <h3 className="job-detail-location-time__subheading">Thời gian làm việc</h3>
          <ul className="job-detail-bullet-list">
            {hours.map((item, index) => (
              <li key={index} className="job-detail-bullet-item">
                <span className="job-detail-bullet-dot">•</span>
                <span className="job-detail-bullet-text">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="job-detail-location-time__group">
          <h3 className="job-detail-location-time__subheading">Cách thức ứng tuyển</h3>
          <ul className="job-detail-bullet-list">
            <li className="job-detail-bullet-item">
              <span className="job-detail-bullet-dot">•</span>
              <span className="job-detail-bullet-text">{applyNote}</span>
            </li>
          </ul>
        </div>

        <div className="job-detail-location-time__actions-row">
          <div className="job-detail-location-time__action-btn">
            <ApplyJobButton content={content} job={job} />
          </div>
          <div className="job-detail-location-time__action-btn">
            <SaveJobButton content={content} jobId={job.id} />
          </div>
        </div>

        <div className="job-detail-location-time__deadline">
          Hạn ứng tuyển: <strong>{job.deadline || 'Chưa xác định'}</strong>
        </div>

        <div className="job-detail-scam-notice">
          <Info size={18} className="job-detail-scam-notice__icon" />
          <div className="job-detail-scam-notice__content">
            <p className="job-detail-scam-notice__text">
              <strong>Báo cáo tin tuyển dụng:</strong> Nếu bạn thấy rằng tin tuyển dụng này không đúng hoặc có dấu hiệu lừa đảo,{' '}
              <a href="#report-job" className="job-detail-scam-notice__link">
                hãy phản ánh với chúng tôi.
              </a>
            </p>
            <p className="job-detail-scam-notice__subtext">
              Xem thêm:{' '}
              <a href="#safe-job" className="job-detail-scam-notice__link">
                Tìm việc an toàn cùng NexHire
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
