import { Link, useSearchParams } from 'react-router-dom'
import { useCompanyPlan } from '../../hooks/useCompanyPlan'
import { useTranslations } from '../../i18n'
import { usePermission } from '../../lib/auth/usePermission'
import type { UsePermissionResult } from '../../lib/auth/usePermission'
import { ErrorState, Loading, PlanLock } from '../_components'
import { CompanyVerificationContent } from '../_components/company-verification/CompanyVerificationContent'
import { COMPANY_TAB_PARAM, COMPANY_TABS, getCompanyPanelId, getCompanyTabId, isCompanyTabId } from './companyTabs'
import type { CompanyPermission } from './companyTabs'
import { CompanyAuditLogTab } from './components/CompanyAuditLogTab'
import { CompanyBillingTab } from './components/CompanyBillingTab'
import { CompanyMembersTab } from './components/CompanyMembersTab'
import { CompanyProfileTab } from './components/CompanyProfileTab'
import { CompanyTabList } from './components/CompanyTabList'
import type { CompanyTabItem } from './components/CompanyTabList'
import type { CompanyTabId } from './types'
import './recruiter-company.css'

type CompanyAccessMap = Record<CompanyPermission, UsePermissionResult>

function isTabVisible(access: UsePermissionResult | null) {
  // Blocked by role → hidden. Blocked by plan → shown with a lock.
  return access === null || access.allowed || access.reason === 'plan'
}

export function RecruiterCompanyPage() {
  const { common, pages } = useTranslations()
  const content = pages.recruiterCompany
  const [searchParams, setSearchParams] = useSearchParams()
  const nextPath = searchParams.get('next')
  const planQuery = useCompanyPlan()

  const companyEdit = usePermission('company.edit')
  const access: CompanyAccessMap = {
    'audit.view': usePermission('audit.view'),
    'billing.manage': usePermission('billing.manage'),
    'company.edit': companyEdit,
    'company.legal': usePermission('company.legal'),
    'members.manage': usePermission('members.manage'),
  }
  const accessResults = Object.values(access)
  const isAccessLoading = accessResults.some((result) => result.isLoading)
  const isAccessError = accessResults.some((result) => result.isError)

  const tabs = COMPANY_TABS.map((tab) => ({ ...tab, access: tab.permission ? access[tab.permission] : null }))
    .filter((tab) => isTabVisible(tab.access))
  const tabItems: CompanyTabItem[] = tabs.map((tab) => ({
    id: tab.id,
    isPlanLocked: tab.access !== null && !tab.access.allowed,
    label: content.tabs[tab.id],
  }))

  const requestedTab = searchParams.get(COMPANY_TAB_PARAM)
  const activeTab: CompanyTabId =
    isCompanyTabId(requestedTab) && tabs.some((tab) => tab.id === requestedTab) ? requestedTab : 'profile'

  function selectTab(id: CompanyTabId) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.set(COMPANY_TAB_PARAM, id)
        return next
      },
      { replace: true },
    )
  }

  function renderPanel(id: CompanyTabId) {
    switch (id) {
      case 'profile':
        return <CompanyProfileTab canEdit={companyEdit.allowed} />
      case 'legal':
        return (
          <PlanLock access={access['company.legal']}>
            <CompanyVerificationContent showNextBanner={false} />
          </PlanLock>
        )
      case 'members':
        return <CompanyMembersTab access={access['members.manage']} />
      case 'billing':
        return (
          <PlanLock access={access['billing.manage']}>
            <CompanyBillingTab />
          </PlanLock>
        )
      case 'audit':
        return (
          <PlanLock
            access={access['audit.view']}
            description={content.audit.description}
            title={content.audit.title}
          >
            <CompanyAuditLogTab />
          </PlanLock>
        )
    }
  }

  return (
    <div className="recruiter-company-page">
      {nextPath ? (
        <aside className="recruiter-company-next-banner" role="status">
          <h2>{content.nextBanner.title}</h2>
          <p>{content.nextBanner.description}</p>
          <Link className="recruiter-company-next-banner__action" to={nextPath}>
            {content.nextBanner.action}
          </Link>
        </aside>
      ) : null}

      <header className="recruiter-company-hero">
        <div className="recruiter-company-hero__copy">
          <span>{content.management.kicker}</span>
          <h1>{content.management.title}</h1>
          <p>{content.management.subtitle}</p>
        </div>
      </header>

      {isAccessLoading ? (
        <section className="recruiter-company-state">
          <Loading label={content.management.loading} />
        </section>
      ) : isAccessError ? (
        // Unknown plan: never show a lock or an upgrade button here.
        <section className="recruiter-company-state">
          <ErrorState
            actionLabel={content.states.retry}
            description={content.management.errorDescription}
            onRetry={() => void planQuery.refetch()}
            title={content.management.errorTitle}
          />
        </section>
      ) : (
        <>
          <CompanyTabList
            activeId={activeTab}
            label={content.management.tabsLabel}
            lockedLabel={common.planLock.badge}
            onSelect={selectTab}
            tabs={tabItems}
          />
          <div
            aria-labelledby={getCompanyTabId(activeTab)}
            className="recruiter-company-tabpanel"
            id={getCompanyPanelId(activeTab)}
            role="tabpanel"
            tabIndex={0}
          >
            {renderPanel(activeTab)}
          </div>
        </>
      )}
    </div>
  )
}
