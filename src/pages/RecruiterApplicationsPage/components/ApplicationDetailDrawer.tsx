import { useEffect, useRef } from 'react'
import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import type { RecruiterApplicationItem } from '../types'
import type { RecruiterDecisionStatus } from '../utils/recruiterApplicationDecisionValidation'
import { AiMatchBadge } from './AiMatchBadge'
import { ApplicationDecisionForm } from './ApplicationDecisionForm'

type ApplicationDetailDrawerProps = {
  application: RecruiterApplicationItem
  isMatching: boolean
  isStatusUpdating: boolean
  matchLabels: RecruiterApplicationsTranslations['match']
  meta: RecruiterApplicationsTranslations['meta']
  onClose: () => void
  onEmail: (application: RecruiterApplicationItem) => void
  onOpenResume: (application: RecruiterApplicationItem) => void
  onRunMatch: (application: RecruiterApplicationItem) => void
  onStatusChange: (applicationId: string, status: RecruiterDecisionStatus, feedback: string) => Promise<boolean>
  statusLabels: RecruiterApplicationsTranslations['statusLabels']
  translations: RecruiterApplicationsTranslations['drawer']
}

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

function getMatchActionLabel(
  application: RecruiterApplicationItem,
  isMatching: boolean,
  labels: RecruiterApplicationsTranslations['match'],
) {
  if (isMatching) {
    return labels.processingAction
  }

  if (application.cvParseStatus === 'PARSING') {
    return labels.retryAction
  }

  if (application.cvParseStatus === 'FAILED') {
    return labels.retryAction
  }

  if (application.matchScore !== null) {
    return labels.refreshAction
  }

  return labels.runAction
}

function isLongMatchItem(item: string) {
  return item.length > 42 || item.includes(' ~ ') || item.includes('. ')
}

function renderStringList(title: string, items: ReadonlyArray<string>, emptyLabel: string, className?: string) {
  return (
    <div className={className}>
      <h4>{title}</h4>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li className={isLongMatchItem(item) ? 'is-long' : undefined} key={item}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="recruiter-ai-match-empty">{emptyLabel}</p>
      )}
    </div>
  )
}

export function ApplicationDetailDrawer({
  application,
  isMatching,
  isStatusUpdating,
  matchLabels,
  meta,
  onClose,
  onEmail,
  onOpenResume,
  onRunMatch,
  onStatusChange,
  statusLabels,
  translations,
}: ApplicationDetailDrawerProps) {
  const drawerRef = useRef<HTMLElement | null>(null)
  const isMatchActionDisabled = isMatching

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
          <button aria-label={translations.close} className="recruiter-application-detail-drawer__close" onClick={onClose} type="button">
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
              <AiMatchBadge application={application} labels={matchLabels} />
            </div>

            <div className="recruiter-application-status-actions" aria-label={translations.statusLabel}>
              <span className={`recruiter-application-status recruiter-application-status--${application.status}`}>
                {statusLabels[application.status]}
              </span>
            </div>

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
                <dd>{application.matchScore === null ? matchLabels.notScored : `${application.matchScore}%`}</dd>
              </div>
              <div>
                <dt>{matchLabels.cvParseStatusLabel}</dt>
                <dd>{matchLabels.cvParseStatus[application.cvParseStatus]}</dd>
              </div>
            </dl>
          </section>

          <section className="recruiter-application-detail-card">
            <ApplicationDecisionForm
              application={application}
              isSubmitting={isStatusUpdating}
              onSubmit={(status, feedback) => onStatusChange(application.id, status, feedback)}
              translations={translations.decision}
            />
          </section>

          <section className="recruiter-application-detail-card recruiter-ai-match-panel">
            <div className="recruiter-ai-match-panel__header">
              <div>
                <h3>{matchLabels.title}</h3>
                <p>{matchLabels.description}</p>
              </div>
              <button disabled={isMatchActionDisabled} onClick={() => onRunMatch(application)} type="button">
                {getMatchActionLabel(application, isMatching, matchLabels)}
              </button>
            </div>

            <div className="recruiter-ai-match-summary">
              <AiMatchBadge application={application} labels={matchLabels} />
              <p>{application.matchSummary ?? matchLabels.emptySummary}</p>
            </div>

            <dl className="recruiter-ai-match-grid">
              <div>
                <dt>{matchLabels.recommendationLabel}</dt>
                <dd>{application.matchRecommendation ? matchLabels.recommendations[application.matchRecommendation] : meta.notAvailable}</dd>
              </div>
              <div>
                <dt>{matchLabels.decisionLabel}</dt>
                <dd>{application.matchDecision ? matchLabels.decisions[application.matchDecision] : meta.notAvailable}</dd>
              </div>
              <div>
                <dt>{matchLabels.priorityLabel}</dt>
                <dd>{application.matchPriority ? matchLabels.priorities[application.matchPriority] : meta.notAvailable}</dd>
              </div>
            </dl>

            <div className="recruiter-ai-match-lists">
              {renderStringList(matchLabels.matchedSkills, application.matchMatchedSkills, matchLabels.emptyList)}
              {renderStringList(matchLabels.missingSkills, application.matchMissingSkills, matchLabels.emptyList, 'recruiter-ai-match-list--missing')}
              {renderStringList(matchLabels.nextActions, application.matchNextActions, matchLabels.emptyList)}
              {application.matchRiskFlags.length > 0
                ? renderStringList(matchLabels.riskFlags, application.matchRiskFlags, matchLabels.emptyList, 'recruiter-ai-match-list--risk')
                : null}
            </div>
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
              <div>
                <dt>{meta.cvFile}</dt>
                <dd>{application.cvFileName}</dd>
              </div>
            </dl>
          </section>

          <section className="recruiter-application-detail-card">
            <h3>{translations.skillsTitle}</h3>
            <div className="recruiter-application-skill-list">
              {application.skills.length > 0 ? (
                application.skills.map((skill) => <span key={skill}>{skill}</span>)
              ) : (
                <p className="recruiter-ai-match-empty">{matchLabels.emptyList}</p>
              )}
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
