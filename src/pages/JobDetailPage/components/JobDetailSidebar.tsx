import { Link } from 'react-router-dom'
import {
  Award,
  Briefcase,
  ExternalLink,
  GraduationCap,
  IdCard,
  MapPin,
  Users,
} from 'lucide-react'
import type { JobDetailTranslations } from '../../../i18n/types'
import type { JobDetailView } from '../types'
import { createCompanyDetailHrefById } from '../../_utils/jobRoutes'

type JobDetailSidebarProps = {
  content: JobDetailTranslations['sidebar']
  job: JobDetailView
}

function ItoLogoGraphic() {
  return (
    <div className="job-detail-company-card__custom-logo">
      <div className="job-detail-company-card__logo-squares">
        <span className="job-detail-logo-sq" />
        <span className="job-detail-logo-sq" />
        <span className="job-detail-logo-sq" />
      </div>
      <span className="job-detail-company-card__logo-brand">i.t.o</span>
    </div>
  )
}

export function JobDetailSidebar({ job }: JobDetailSidebarProps) {
  const companyHref = createCompanyDetailHrefById(job.companyId)

  const company = job.companyInfo || {
    id: job.companyId,
    name: job.company,
    logoUrl: job.logo.src,
    scale: null,
    address: job.location,
    industry: null,
  }

  const isIto =
    !company.logoUrl &&
    (company.name.toLowerCase().includes('i.t.o') || company.name.toLowerCase().includes('ito'))

  const generalInfoItems = [
    {
      icon: Award,
      label: 'Cấp bậc',
      value: job.levelLabel || 'Nhân viên',
    },
    {
      icon: GraduationCap,
      label: 'Học vấn',
      value: job.educationLabel || 'Đại Học trở lên',
    },
    {
      icon: Users,
      label: 'Số lượng tuyển',
      value: `${job.openings ?? 1} người`,
    },
    {
      icon: Briefcase,
      label: 'Hình thức làm việc',
      value: job.workMode || 'Toàn thời gian',
    },
    {
      icon: IdCard,
      label: 'Loại hình làm việc',
      value: job.employmentTypeLabel || 'Toàn thời gian',
    },
  ]

  // Dynamic tags from the current job's skills and category
  const relatedCategories = [
    ...(job.categoryName ? [job.categoryName] : []),
    ...(job.tags || []),
  ].filter(Boolean)

  const locationBase = job.location || 'Toàn quốc'
  const relatedLocations = [
    locationBase,
    `Việc làm tại ${locationBase}`,
    `Việc làm ${job.title} tại ${locationBase}`,
  ]

  return (
    <aside className="job-detail-sidebar">
      {/* 1. Company Profile Card */}
      <div className="job-detail-card job-detail-company-card">
        <div className="job-detail-company-card__header">
          <div className="job-detail-company-card__logo-wrap">
            {isIto ? (
              <ItoLogoGraphic />
            ) : company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="job-detail-company-card__logo"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'
                  }
                }}
              />
            ) : null}
            <div
              className="job-detail-company-card__logo-fallback"
              style={{ display: isIto || company.logoUrl ? 'none' : 'flex' }}
            >
              {job.logo.fallbackText || 'NH'}
            </div>
          </div>
          <h3 className="job-detail-company-card__name">
            <Link to={companyHref}>{company.name}</Link>
          </h3>
        </div>

        <div className="job-detail-company-card__info-list">
          {company.scale && (
            <div className="job-detail-company-card__info-item">
              <Users size={16} className="job-detail-company-card__info-icon" />
              <span className="job-detail-company-card__info-label">Quy mô:</span>
              <span className="job-detail-company-card__info-value">{company.scale}</span>
            </div>
          )}

          {company.address && (
            <div className="job-detail-company-card__info-item">
              <MapPin size={16} className="job-detail-company-card__info-icon" />
              <span className="job-detail-company-card__info-label">Địa điểm:</span>
              <span className="job-detail-company-card__info-value">{company.address}</span>
            </div>
          )}

          {company.industry && (
            <div className="job-detail-company-card__info-item">
              <Briefcase size={16} className="job-detail-company-card__info-icon" />
              <span className="job-detail-company-card__info-label">Ngành nghề:</span>
              <span className="job-detail-company-card__info-value">{company.industry}</span>
            </div>
          )}
        </div>

        <Link to={companyHref} className="job-detail-company-card__btn-view">
          <span>Xem trang công ty</span>
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* 2. General Information Card */}
      <div className="job-detail-card job-detail-general-info-card">
        <h3 className="job-detail-general-info-card__title">Thông tin chung</h3>

        <div className="job-detail-general-info-card__list">
          {generalInfoItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <div key={idx} className="job-detail-general-info-card__item">
                <div className="job-detail-general-info-card__icon-wrap">
                  <Icon size={18} strokeWidth={1.8} />
                </div>
                <div className="job-detail-general-info-card__details">
                  <span className="job-detail-general-info-card__label">{item.label}</span>
                  <strong className="job-detail-general-info-card__value">{item.value}</strong>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. Related Tags & Categories Card */}
      <div className="job-detail-card job-detail-tags-card">
        {relatedCategories.length > 0 && (
          <div className="job-detail-tags-card__section">
            <h4 className="job-detail-tags-card__heading">DANH MỤC NGHỀ LIÊN QUAN</h4>
            <div className="job-detail-tags-card__pills">
              {relatedCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  to={`/search?keyword=${encodeURIComponent(cat)}`}
                  className="job-detail-tag-pill"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="job-detail-tags-card__section">
          <h4 className="job-detail-tags-card__heading">TÌM VIỆC THEO ĐỊA ĐIỂM</h4>
          <div className="job-detail-tags-card__pills">
            {relatedLocations.map((loc, idx) => (
              <Link
                key={idx}
                to={`/search?location=${encodeURIComponent(locationBase)}`}
                className="job-detail-tag-pill"
              >
                {loc}
              </Link>
            ))}
          </div>
          <Link
            to={`/search?location=${encodeURIComponent(locationBase)}`}
            className="job-detail-tags-card__more-btn"
          >
            Xem thêm việc làm tại {locationBase}
          </Link>
        </div>
      </div>
    </aside>
  )
}
