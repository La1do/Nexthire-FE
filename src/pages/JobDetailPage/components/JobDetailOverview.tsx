import { Bell } from 'lucide-react'
import type { JobDetailOverviewData } from '../types'

type JobDetailOverviewProps = {
  data?: JobDetailOverviewData
}

export function JobDetailOverview({ data }: JobDetailOverviewProps) {
  if (!data) return null

  return (
    <section className="job-detail-card job-detail-overview">
      <header className="job-detail-card__header">
        <h2 className="job-detail-card__title">Tổng quan</h2>
        <button
          className="job-detail-overview__alert-btn"
          onClick={() => alert('Đã bật thông báo việc làm tương tự!')}
          type="button"
        >
          <Bell size={15} />
          <span>Gửi tôi việc làm tương tự</span>
        </button>
      </header>

      <div className="job-detail-overview__body">
        {data.requirements && data.requirements.length > 0 && (
          <div className="job-detail-overview__row">
            <span className="job-detail-overview__label">Yêu cầu:</span>
            <div className="job-detail-overview__tags">
              {data.requirements.map((item, idx) => (
                <span key={idx} className="job-detail-overview__tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.benefits && data.benefits.length > 0 && (
          <div className="job-detail-overview__row">
            <span className="job-detail-overview__label">Quyền lợi:</span>
            <div className="job-detail-overview__tags">
              {data.benefits.map((item, idx) => (
                <span key={idx} className="job-detail-overview__tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.benefitsRow2 && data.benefitsRow2.length > 0 && (
          <div className="job-detail-overview__row">
            <span className="job-detail-overview__label">Quyền lợi:</span>
            <div className="job-detail-overview__tags">
              {data.benefitsRow2.map((item, idx) => (
                <span key={idx} className="job-detail-overview__tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.specialties && data.specialties.length > 0 && (
          <div className="job-detail-overview__row">
            <span className="job-detail-overview__label">Chuyên môn:</span>
            <div className="job-detail-overview__tags">
              {data.specialties.map((item, idx) => (
                <span key={idx} className="job-detail-overview__tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
