import { useMemo, useState } from 'react'
import { getTranslations } from '../../i18n'
import { CompanyDocumentsCard } from './components/CompanyDocumentsCard'
import { CompanyOverviewCard } from './components/CompanyOverviewCard'
import { CompanyQuickStats } from './components/CompanyQuickStats'
import { CompanyReviewPanel } from './components/CompanyReviewPanel'
import { adminCompaniesFixture } from '../AdminCompaniesPage/utils/adminCompaniesData'
import type { CompanyReviewStatus } from '../AdminCompaniesPage/types'

function getCompanyIdFromLocation() {
  if (typeof window === 'undefined') {
    return ''
  }

  const [, companyId = ''] = window.location.pathname.match(/^\/admin\/companies\/([^/]+)\/?$/) ?? []
  return companyId
}

export function AdminCompanyDetailPage() {
  const { pages } = getTranslations()
  const content = pages.adminCompanies
  const companyId = getCompanyIdFromLocation()

  const fixtureCompany = useMemo(
    () => adminCompaniesFixture.find((company) => company.id === companyId),
    [companyId],
  )

  const [status, setStatus] = useState<CompanyReviewStatus | null>(() => fixtureCompany?.status ?? null)

  if (!fixtureCompany || !status) {
    return (
      <div className="admin-company-detail-page">
        <section className="admin-company-panel admin-company-not-found">
          <p className="admin-company-not-found__eyebrow">{content.detail.notFoundEyebrow}</p>
          <h2>{content.detail.notFoundTitle}</h2>
          <p>{content.detail.notFoundDescription}</p>
          <a className="admin-company-action admin-company-action--ghost" href="/admin/companies">
            {content.detail.backToList}
          </a>
        </section>
      </div>
    )
  }

  const company = { ...fixtureCompany, status }

  return (
    <div className="admin-company-detail-page">
      <a className="admin-company-detail-back" href="/admin/companies">
        {content.detail.backToList}
      </a>

      <div className="admin-company-detail-grid">
        <div className="admin-company-detail-main">
          <CompanyOverviewCard
            company={company}
            content={content.detail}
            statusesLabel={content.statuses}
          />

          <section className="admin-company-panel" aria-labelledby="company-description-title">
            <header className="admin-company-panel__header">
              <h2 id="company-description-title">{content.detail.descriptionTitle}</h2>
            </header>
            <p className="admin-company-description">{company.description}</p>
          </section>

          <CompanyDocumentsCard company={company} content={content.detail} />
        </div>

        <div className="admin-company-detail-aside">
          <CompanyReviewPanel
            company={company}
            content={content.detail}
            onStatusChange={setStatus}
            statusesLabel={content.statuses}
          />
          <CompanyQuickStats company={company} content={content.detail} />
        </div>
      </div>
    </div>
  )
}

export default AdminCompanyDetailPage
