import { useState } from 'react'
import { useLocale, useTranslations } from '../../../i18n'
import type { RecruiterCompanyTranslations } from '../../../i18n/types'
import type { AuditLog, AuditLogAction } from '../../../types/auditLog.types'
import { ErrorState, Loading, SegmentedControl } from '../../_components'
import { useCompanyAuditLogs } from '../useCompanyWorkspaceQueries'
import { fillTemplate, formatCompanyDateTime } from '../utils'
import './company-audit.css'

type AuditFilter = 'all' | 'jobs' | 'roles' | 'members' | 'plan'

const AUDIT_FILTERS: ReadonlyArray<AuditFilter> = ['all', 'jobs', 'roles', 'members', 'plan']

const ACTION_GROUP: Record<AuditLogAction, Exclude<AuditFilter, 'all'>> = {
  JD_APPROVED: 'jobs',
  JD_ASSIGNED: 'jobs',
  JD_PUBLISHED_BY_MANAGER: 'jobs',
  JD_RETURNED: 'jobs',
  JD_SUBMITTED: 'jobs',
  MEMBER_ADDED: 'members',
  MEMBER_REMOVED: 'members',
  MEMBER_ROLE_CHANGED: 'roles',
  PLAN_CHANGED: 'plan',
}

function isAuditFilter(value: string): value is AuditFilter {
  return AUDIT_FILTERS.some((filter) => filter === value)
}

function describeAuditLog(log: AuditLog, content: RecruiterCompanyTranslations) {
  const values: Record<string, string> = { actor: log.actorName, target: log.targetLabel }

  switch (log.action) {
    case 'MEMBER_ADDED':
      values.to = content.members.roles[log.metadata.role]
      break
    case 'MEMBER_ROLE_CHANGED':
      values.from = content.members.roles[log.metadata.fromRole]
      values.to = content.members.roles[log.metadata.toRole]
      break
    case 'PLAN_CHANGED':
      values.from = content.billing.plans[log.metadata.fromPlan].name
      values.to = content.billing.plans[log.metadata.toPlan].name
      break
    case 'JD_ASSIGNED':
      values.from = log.metadata.fromAssigneeName ?? content.audit.unassigned
      values.to = log.metadata.toAssigneeName ?? content.audit.unassigned
      break
    default:
      break
  }

  return fillTemplate(content.audit.events[log.action], values)
}

/** Company activity log. Rendered only when `audit.view` is allowed. */
export function CompanyAuditLogTab() {
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const content = pages.recruiterCompany
  const [filter, setFilter] = useState<AuditFilter>('all')
  const logsQuery = useCompanyAuditLogs(true)
  const logs = (logsQuery.data?.data ?? []).filter((log) => filter === 'all' || ACTION_GROUP[log.action] === filter)

  function renderList() {
    if (logsQuery.isLoading) return <Loading label={content.audit.loading} />

    if (logsQuery.isError) {
      return (
        <ErrorState
          actionLabel={content.states.retry}
          description={content.states.errorDescription}
          onRetry={() => void logsQuery.refetch()}
          title={content.audit.errorTitle}
        />
      )
    }

    if (logs.length === 0) return <p className="company-audit__empty">{content.audit.empty}</p>

    return (
      <ol className="company-audit__list">
        {logs.map((log) => (
          <li className="company-audit__item" key={log.id}>
            <time className="company-audit__time" dateTime={log.createdAt}>
              {formatCompanyDateTime(log.createdAt, locale)}
            </time>
            <p className="company-audit__message">
              {describeAuditLog(log, content)}
              {log.action === 'JD_PUBLISHED_BY_MANAGER' ? (
                <span className="company-audit__badge">{content.audit.directPublishBadge}</span>
              ) : null}
            </p>
            {log.action === 'JD_RETURNED' && log.metadata.returnReason ? (
              <p className="company-audit__reason">
                {fillTemplate(content.audit.returnReason, { reason: log.metadata.returnReason })}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    )
  }

  return (
    <section aria-labelledby="company-audit-title" className="recruiter-company-panel company-audit">
      <div className="recruiter-company-panel__header">
        <h2 id="company-audit-title">{content.audit.title}</h2>
        <p>{content.audit.description}</p>
      </div>
      <div className="company-audit__filters">
        <SegmentedControl
          label={content.audit.filterLabel}
          name="company-audit-filter"
          onChange={(value) => {
            if (isAuditFilter(value)) setFilter(value)
          }}
          options={AUDIT_FILTERS.map((item) => ({ label: content.audit.filters[item], value: item }))}
          value={filter}
        />
      </div>
      {renderList()}
    </section>
  )
}
