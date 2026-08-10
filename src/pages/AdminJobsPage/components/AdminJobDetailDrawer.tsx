import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import {
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleAlert,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileText,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import type { AdminJobsTranslations } from '../../../i18n/types'
import type { AdminJobRow } from '../types'
import { isAdminJobRevision } from '../types'
import {
  formatAdminJobDate,
  formatAdminJobSalary,
  getTranslatedValue,
} from '../utils/jobDetailFormatters'
import { AdminJobStatusBadge } from './AdminJobStatusBadge'

type Props = {
  content: AdminJobsTranslations
  item: AdminJobRow | null
  onClose: () => void
}

type InfoItemProps = {
  icon: ReactNode
  label: string
  value: React.ReactNode
}

type TimelineItem = {
  label: string
  value: string
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="admin-job-drawer__info-item">
      <span aria-hidden="true" className="admin-job-drawer__info-icon">
        {icon}
      </span>
      <div>
        <span>{label}</span>
        <strong title={typeof value === 'string' ? value : undefined}>{value}</strong>
      </div>
    </div>
  )
}

function TextSection({
  title,
  value,
  emptyLabel,
}: {
  title: string
  value: string | null | undefined
  emptyLabel: string
}) {
  const normalizedValue = value?.trim()

  return (
    <section className="admin-job-drawer__content-section">
      <h3>{title}</h3>
      <p className={normalizedValue ? undefined : 'is-empty'}>
        {normalizedValue || emptyLabel}
      </p>
    </section>
  )
}

function getRuleLabel(rule: string, labels: Record<string, string>) {
  return labels[rule] ?? rule.replaceAll('_', ' ')
}

function getReasonLabel(reason: string, labels: Record<string, string>) {
  return labels[reason] ?? reason
}

export function AdminJobDetailDrawer({ content, item, onClose }: Props) {
  const drawerRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!item) return

    triggerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    drawerRef.current?.focus()

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !drawerRef.current) return

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (!first || !last) {
        event.preventDefault()
        return
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', close)

    return () => {
      window.removeEventListener('keydown', close)
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [item, onClose])

  if (!item) return null

  const detail = content.detail
  const riskKey = item.moderation.riskLevel ?? 'NONE'
  const riskScore =
    item.moderation.riskScore == null
      ? null
      : Math.min(100, Math.max(0, item.moderation.riskScore))
  const employmentType = getTranslatedValue(
    item.employmentType,
    detail.employmentTypes,
    detail.noData,
  )
  const workingType = getTranslatedValue(
    item.workingType,
    detail.workingTypes,
    detail.noData,
  )
  const experienceLevel = getTranslatedValue(
    item.experienceLevel,
    detail.experienceLevels,
    detail.noData,
  )
  const moderationDecision = getTranslatedValue(
    item.moderation.decision,
    detail.decisions,
    detail.notAssessed,
  )

  const timeline: TimelineItem[] = [
    {
      label: detail.createdAt,
      value: formatAdminJobDate(item.createdAt, detail.noData),
    },
    {
      label: detail.updatedAt,
      value: formatAdminJobDate(item.updatedAt, detail.noData),
    },
    ...(item.reviewedAt
      ? [
          {
            label: detail.reviewedAt,
            value: formatAdminJobDate(item.reviewedAt, detail.noData),
          },
        ]
      : []),
    ...(item.publishedAt
      ? [
          {
            label: detail.publishedAt,
            value: formatAdminJobDate(item.publishedAt, detail.noData),
          },
        ]
      : []),
    ...(item.unpublishedAt
      ? [
          {
            label: detail.unpublishedAt,
            value: formatAdminJobDate(item.unpublishedAt, detail.noData),
          },
        ]
      : []),
    ...(item.closedAt
      ? [
          {
            label: detail.closedAt,
            value: formatAdminJobDate(item.closedAt, detail.noData),
          },
        ]
      : []),
  ]

  return (
    <div
      className="admin-job-drawer-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
    >
      <aside
        aria-label={detail.title}
        aria-modal="true"
        className="admin-job-drawer"
        ref={drawerRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="admin-job-drawer__hero">
          <div className="admin-job-drawer__company-avatar" aria-hidden="true">
            {item.companyLogoUrl ? (
              <img alt="" src={item.companyLogoUrl} />
            ) : (
              <BriefcaseBusiness />
            )}
          </div>

          <div className="admin-job-drawer__hero-content">
            <span>{detail.title}</span>
            <h2>{item.title}</h2>
            <div className="admin-job-drawer__meta">
              <span>
                <Building2 />
                {item.companyName ?? detail.noData}
              </span>
              <span>
                <MapPin />
                {item.location ?? detail.noData}
              </span>
              <span>
                <Clock3 />
                {formatAdminJobDate(item.updatedAt, detail.noData)}
              </span>
            </div>
            <div className="admin-job-drawer__badges">
              <AdminJobStatusBadge labels={content.statuses} status={item.status} />
              {item.experienceLevel ? (
                <span className="admin-job-drawer__neutral-badge">{experienceLevel}</span>
              ) : null}
              {item.workingType ? (
                <span className="admin-job-drawer__neutral-badge">{workingType}</span>
              ) : null}
            </div>
          </div>

          <button aria-label={detail.close} onClick={onClose} type="button">
            <X />
          </button>
        </header>

        <div className="admin-job-drawer__body">
          {isAdminJobRevision(item) ? (
            <section className="admin-job-drawer__revision">
              <span aria-hidden="true">
                <ClipboardList />
              </span>
              <div>
                <h3>{detail.changeSummary}</h3>
                <p>{item.changeSummary?.trim() || detail.noData}</p>
              </div>
            </section>
          ) : null}

          <section className="admin-job-drawer__group">
            <header>
              <Sparkles />
              <h3>{detail.overview}</h3>
            </header>
            <div className="admin-job-drawer__overview-grid">
              <InfoItem
                icon={<BriefcaseBusiness />}
                label={detail.employmentType}
                value={employmentType}
              />
              <InfoItem icon={<MapPin />} label={detail.workingType} value={workingType} />
              <InfoItem icon={<Users />} label={detail.experienceLevel} value={experienceLevel} />
              <InfoItem
                icon={<MapPin />}
                label={detail.location}
                value={item.location?.trim() || detail.notSet}
              />
              <InfoItem
                icon={<CircleDollarSign />}
                label={detail.salary}
                value={formatAdminJobSalary(item, detail)}
              />
              <InfoItem
                icon={<Users />}
                label={detail.openings}
                value={item.numberOfOpenings ?? detail.notSet}
              />
              <InfoItem
                icon={<CalendarDays />}
                label={detail.deadline}
                value={formatAdminJobDate(item.deadline, detail.notSet)}
              />
              <InfoItem
                icon={<Users />}
                label={detail.applications}
                value={item.applicationCount}
              />
            </div>
          </section>

          <section className="admin-job-drawer__group admin-job-drawer__job-content">
            <header>
              <FileText />
              <h3>{detail.jobContent}</h3>
            </header>
            <TextSection
              emptyLabel={detail.noData}
              title={detail.description}
              value={item.description}
            />
            <TextSection
              emptyLabel={detail.noData}
              title={detail.requirements}
              value={item.requirements}
            />
            <TextSection
              emptyLabel={detail.noData}
              title={detail.benefits}
              value={item.benefits}
            />
            <section className="admin-job-drawer__content-section">
              <h3>{detail.skills}</h3>
              {item.skills.length ? (
                <div className="admin-job-drawer__skills">
                  {item.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="is-empty">{detail.noData}</p>
              )}
            </section>
          </section>

          <section className="admin-job-drawer__group">
            <header>
              <Clock3 />
              <h3>{detail.lifecycle}</h3>
            </header>
            <ol className="admin-job-drawer__timeline">
              {timeline.map(({ label, value }, index) => (
                <li className="is-complete" key={`${label}-${index}`}>
                  <span aria-hidden="true" />
                  <div>
                    <strong>{label}</strong>
                    <p>{value}</p>
                  </div>
                  {index < timeline.length - 1 ? <i aria-hidden="true" /> : null}
                </li>
              ))}
            </ol>
          </section>

          {item.reviewReason || item.unpublishReason ? (
            <section className="admin-job-drawer__group">
              <header>
                <CircleAlert />
                <h3>{detail.reviewReason}</h3>
              </header>
              {item.reviewReason ? (
                <TextSection
                  emptyLabel={detail.noData}
                  title={detail.reviewReason}
                  value={item.reviewReason}
                />
              ) : null}
              {item.unpublishReason ? (
                <TextSection
                  emptyLabel={detail.noData}
                  title={detail.unpublishReason}
                  value={item.unpublishReason}
                />
              ) : null}
            </section>
          ) : null}

          <section
            className={`admin-job-moderation admin-job-moderation--${riskKey.toLowerCase()}`}
          >
            <header>
              <ShieldCheck />
              <div>
                <h3>{detail.moderation}</h3>
                <p>{content.columns.risk}</p>
              </div>
            </header>
            <div className="admin-job-moderation__score">
              <strong>
                {riskScore == null ? '--' : riskScore}
                <small>/100</small>
              </strong>
              <div>
                <span>{content.risks[riskKey]}</span>
                <div
                  aria-label={`${content.columns.risk}: ${
                    riskScore == null ? detail.notAssessed : `${riskScore}/100`
                  }`}
                  className={`admin-job-moderation__meter${
                    riskScore == null ? ' is-empty' : ''
                  }`}
                >
                  <i style={{ width: `${riskScore ?? 0}%` }} />
                </div>
              </div>
            </div>
            <div className="admin-job-moderation__decision">
              <span>{detail.moderationDecision}</span>
              <strong>{moderationDecision}</strong>
            </div>
            <div className="admin-job-moderation__details">
              <div>
                <h4>
                  <CircleAlert />
                  {detail.reasons}
                </h4>
                {item.moderation.reasons.length ? (
                  <ul>
                    {item.moderation.reasons.map((reason) => (
                      <li key={reason}>{getReasonLabel(reason, detail.reasonLabels)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="is-empty">{detail.noData}</p>
                )}
              </div>
              <div>
                <h4>
                  <ClipboardList />
                  {detail.rules}
                </h4>
                {item.moderation.matchedRules.length ? (
                  <div className="admin-job-drawer__rules">
                    {item.moderation.matchedRules.map((rule) => (
                      <span key={rule}>{getRuleLabel(rule, detail.ruleLabels)}</span>
                    ))}
                  </div>
                ) : (
                  <p className="is-empty">{detail.noData}</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  )
}
