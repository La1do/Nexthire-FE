import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, ChevronRight, Link2 } from 'lucide-react'

type JobDetailBreadcrumbProps = {
  title: string
  categoryName?: string
}

export function JobDetailBreadcrumb({ title, categoryName }: JobDetailBreadcrumbProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <nav aria-label="Breadcrumb" className="job-breadcrumb">
      <div className="job-breadcrumb__container">
        <button
          className="job-breadcrumb__copy-btn"
          onClick={handleCopyLink}
          title={copied ? 'Đã sao chép liên kết!' : 'Sao chép liên kết tin tuyển dụng'}
          type="button"
        >
          {copied ? <Check size={14} className="job-breadcrumb__copy-check" /> : <Link2 size={14} />}
        </button>

        <ol className="job-breadcrumb__list">
          <li className="job-breadcrumb__item">
            <Link to="/" className="job-breadcrumb__link">
              Trang chủ
            </Link>
            <ChevronRight size={13} className="job-breadcrumb__separator" />
          </li>
          <li className="job-breadcrumb__item">
            <Link to="/search" className="job-breadcrumb__link">
              Việc làm
            </Link>
            <ChevronRight size={13} className="job-breadcrumb__separator" />
          </li>
          {categoryName ? (
            <li className="job-breadcrumb__item">
              <Link
                to={`/search?category=${encodeURIComponent(categoryName)}`}
                className="job-breadcrumb__link"
              >
                Việc làm {categoryName}
              </Link>
              <ChevronRight size={13} className="job-breadcrumb__separator" />
            </li>
          ) : null}
          <li className="job-breadcrumb__item job-breadcrumb__item--active" aria-current="page">
            <span className="job-breadcrumb__current">
              Tuyển {title}
            </span>
          </li>
        </ol>
      </div>
    </nav>
  )
}
