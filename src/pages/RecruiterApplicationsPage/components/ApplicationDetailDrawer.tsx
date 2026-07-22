import { useEffect, useRef } from 'react'
import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import { SelectField } from '../../_components'
import type { RecruiterApplicationItem, RecruiterApplicationStatus } from '../types'

type ApplicationDetailDrawerProps = {
  application: RecruiterApplicationItem
  onClose: () => void
  onEmail: (application: RecruiterApplicationItem) => void
  onOpenResume: (application: RecruiterApplicationItem) => void
  onStatusChange: (applicationId: string, status: RecruiterApplicationStatus) => void
  statusLabels: RecruiterApplicationsTranslations['statusLabels']
  translations: RecruiterApplicationsTranslations['drawer']
}

const statusOrder: ReadonlyArray<RecruiterApplicationStatus> = [
  'new',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected',
]

function ExternalLinkIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M14 3h7v7" />
      <path d="M10 14 21 3" />
      <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return `${first}${last}`.toUpperCase() || '?'
}

export function ApplicationDetailDrawer({
  application,
  onClose,
  onEmail,
  onOpenResume,
  onStatusChange,
  statusLabels,
  translations,
}: ApplicationDetailDrawerProps) {
  const drawerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    firstFocusable?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleStatusChange(value: string) {
    onStatusChange(application.id, value as RecruiterApplicationStatus)
  }

  return (
    <div className="recruiter-application-detail-backdrop" onMouseDown={onClose} role="presentation">
      <aside
        aria-label={`${translations.title}: ${application.candidateName}`}
        aria-modal="true"
        className="recruiter-application-detail-drawer"
        role="dialog"
        ref={drawerRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="recruiter-application-detail-drawer__header">
          <div>
            <p className="recruiter-eyebrow">{translations.title}</p>
            <h2>{application.candidateName}</h2>
            <p>{application.candidateHeadline}</p>
          </div>
          <button
            aria-label={translations.close}
            className="recruiter-application-detail-drawer__close"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </header>

        <div className="recruiter-application-detail-drawer__body">
          <section className="recruiter-application-detail-card recruiter-application-detail-card--identity">
            <div className="recruiter-application-detail-card__candidate">
              <span aria-hidden="true" className="recruiter-applications-avatar">
                {getInitials(application.candidateName)}
              </span>
              <div>
                <h3>{translations.candidateTitle}</h3>
                <p>{application.candidateName}</p>
              </div>
            </div>
            <div className="recruiter-application-detail-actions">
              <button onClick={() => onOpenResume(application)} type="button">
                <ExternalLinkIcon />
                {translations.resumeAction}
              </button>
              <button onClick={() => onEmail(application)} type="button">
                <MailIcon />
                {translations.emailAction}
              </button>
              {application.portfolioUrl ? (
                <a href={application.portfolioUrl} rel="noreferrer" target="_blank">
                  <ExternalLinkIcon />
                  {translations.portfolioAction}
                </a>
              ) : null}
            </div>
          </section>

          <section className="recruiter-application-detail-card">
            <div className="recruiter-application-detail-card__heading">
              <h3>{translations.applicationTitle}</h3>
              <span className="recruiter-applications-score">{application.score}%</span>
            </div>
            <SelectField
              className="recruiter-application-status-select"
              label={translations.statusLabel}
              onChange={handleStatusChange}
              options={statusOrder.map((status) => ({
                label: statusLabels[status],
                value: status,
              }))}
              value={application.status}
            />
            <dl className="recruiter-application-detail-list">
              <div>
                <dt>{translations.appliedJobLabel}</dt>
                <dd>{application.jobTitle}</dd>
              </div>
              <div>
                <dt>{translations.submittedLabel}</dt>
                <dd>{application.submittedAt}</dd>
              </div>
              <div>
                <dt>{translations.updatedLabel}</dt>
                <dd>{application.updatedAt}</dd>
              </div>
              <div>
                <dt>{translations.scoreLabel}</dt>
                <dd>{application.score}%</dd>
              </div>
            </dl>
          </section>

          <section className="recruiter-application-detail-card">
            <h3>{translations.contactTitle}</h3>
            <dl className="recruiter-application-detail-list">
              <div>
                <dt>{translations.emailLabel}</dt>
                <dd>{application.candidateEmail}</dd>
              </div>
              <div>
                <dt>{translations.phoneLabel}</dt>
                <dd>{application.candidatePhone}</dd>
              </div>
              <div>
                <dt>{translations.locationLabel}</dt>
                <dd>{application.candidateLocation}</dd>
              </div>
              <div>
                <dt>{translations.experienceLabel}</dt>
                <dd>{application.experience}</dd>
              </div>
              <div>
                <dt>{translations.expectedSalaryLabel}</dt>
                <dd>{application.expectedSalary}</dd>
              </div>
            </dl>
          </section>

          <section className="recruiter-application-detail-card">
            <h3>{translations.skillsTitle}</h3>
            <div className="recruiter-application-skill-list">
              {application.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </section>

          <section className="recruiter-application-detail-card">
            <h3>{translations.coverLetterTitle}</h3>
            <p className="recruiter-application-cover-letter">{application.coverLetter}</p>
          </section>

          <section className="recruiter-application-detail-card">
            <h3>{translations.activityTitle}</h3>
            <ol className="recruiter-application-timeline">
              {application.timeline.map((item) => (
                <li key={item.id}>
                  <span aria-hidden="true" />
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.description}</p>
                    <time>{item.date}</time>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </aside>
    </div>
  )
}
