import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Keyboard,
  Maximize2,
  Minimize2,
  UserCheck,
  X,
} from 'lucide-react'
import type { RecruiterApplicationsTranslations } from '../../../i18n/types'
import type { RecruiterApplicationItem } from '../types'
import type { RecruiterDecisionStatus } from '../utils/recruiterApplicationDecisionValidation'
import { AiMatchBadge } from './AiMatchBadge'
import { ApplicationDecisionForm, type ApplicationDecisionFormHandle } from './ApplicationDecisionForm'
import { ApplicationKeyboardShortcutsModal } from './ApplicationKeyboardShortcutsModal'
import { ApplicationReviewWorkspace } from './ApplicationReviewWorkspace'

type ApplicationDetailDrawerProps = {
  application: RecruiterApplicationItem
  applications?: ReadonlyArray<RecruiterApplicationItem>
  currentIndex?: number
  hasNext?: boolean
  hasPrevious?: boolean
  isMatching: boolean
  isStatusUpdating: boolean
  matchLabels: RecruiterApplicationsTranslations['match']
  meta: RecruiterApplicationsTranslations['meta']
  onClose: () => void
  onDecision?: (status: RecruiterDecisionStatus) => void
  onEmail: (application: RecruiterApplicationItem) => void
  onNavigateNext?: () => void
  onNavigatePrevious?: () => void
  onOpenResume: (application: RecruiterApplicationItem) => void
  onRunMatch: (application: RecruiterApplicationItem) => void
  onSelectApplication?: (application: RecruiterApplicationItem) => void
  onStatusChange: (applicationId: string, status: RecruiterDecisionStatus, feedback: string) => Promise<boolean>
  statusLabels: RecruiterApplicationsTranslations['statusLabels']
  totalCount?: number
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

function getInitials(name?: string | null) {
  const parts = (name ?? '').trim().split(/\s+/)
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
  applications,
  currentIndex,
  hasNext,
  hasPrevious,
  isMatching,
  isStatusUpdating,
  matchLabels,
  meta,
  onClose,
  onDecision,
  onEmail,
  onNavigateNext,
  onNavigatePrevious,
  onOpenResume,
  onRunMatch,
  onSelectApplication,
  onStatusChange,
  statusLabels,
  totalCount,
  translations,
}: ApplicationDetailDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [mobileActiveTab, setMobileActiveTab] = useState<'evaluation' | 'workspace'>('evaluation')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const drawerRef = useRef<HTMLElement | null>(null)
  const decisionFormRef = useRef<ApplicationDecisionFormHandle | null>(null)
  const isMatchActionDisabled = isMatching

  const derivedIndex = useMemo(() => {
    if (currentIndex !== undefined) return currentIndex
    if (applications && applications.length > 0) {
      const idx = applications.findIndex((app) => app.id === application.id)
      return idx >= 0 ? idx + 1 : undefined
    }
    return undefined
  }, [currentIndex, applications, application.id])

  const derivedTotal = useMemo(() => {
    if (totalCount !== undefined) return totalCount
    return applications ? applications.length : undefined
  }, [totalCount, applications])

  const canGoPrevious = useMemo(() => {
    if (hasPrevious !== undefined) return hasPrevious
    if (derivedIndex !== undefined) return derivedIndex > 1
    return false
  }, [hasPrevious, derivedIndex])

  const canGoNext = useMemo(() => {
    if (hasNext !== undefined) return hasNext
    if (derivedIndex !== undefined && derivedTotal !== undefined) return derivedIndex < derivedTotal
    return false
  }, [hasNext, derivedIndex, derivedTotal])

  const handleNext = useCallback(() => {
    if (onNavigateNext) {
      onNavigateNext()
      return
    }
    if (applications && onSelectApplication && derivedIndex !== undefined && derivedTotal !== undefined) {
      if (derivedIndex < derivedTotal) {
        onSelectApplication(applications[derivedIndex])
      }
    }
  }, [onNavigateNext, applications, onSelectApplication, derivedIndex, derivedTotal])

  const handlePrevious = useCallback(() => {
    if (onNavigatePrevious) {
      onNavigatePrevious()
      return
    }
    if (applications && onSelectApplication && derivedIndex !== undefined) {
      if (derivedIndex > 1) {
        onSelectApplication(applications[derivedIndex - 2])
      }
    }
  }, [onNavigatePrevious, applications, onSelectApplication, derivedIndex])

  useEffect(() => {
    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    firstFocusable?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      if (event.key === '?' || (event.key === '/' && event.shiftKey)) {
        if (!isTyping) {
          event.preventDefault()
          setShowShortcuts((prev) => !prev)
          return
        }
      }

      if (event.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false)
          return
        }
        onClose()
        return
      }

      if (isTyping || event.ctrlKey || event.metaKey || event.altKey) {
        return
      }

      if (event.key === 'j' || event.key === 'J' || event.key === 'ArrowDown') {
        event.preventDefault()
        if (canGoNext) {
          handleNext()
        }
        return
      }

      if (event.key === 'k' || event.key === 'K' || event.key === 'ArrowUp') {
        event.preventDefault()
        if (canGoPrevious) {
          handlePrevious()
        }
        return
      }

      if (event.key === 'o' || event.key === 'O') {
        event.preventDefault()
        onDecision?.('OFFERED')
        decisionFormRef.current?.openDecisionDialog('OFFERED')
        return
      }

      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault()
        onDecision?.('REJECTED')
        decisionFormRef.current?.openDecisionDialog('REJECTED')
        return
      }

      if (event.key === 'v' || event.key === 'V') {
        event.preventDefault()
        if (typeof window !== 'undefined' && window.innerWidth < 1080) {
          setMobileActiveTab((prev) => (prev === 'evaluation' ? 'workspace' : 'evaluation'))
        } else {
          setIsExpanded((prev) => !prev)
        }
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [canGoNext, canGoPrevious, handleNext, handlePrevious, onClose, onDecision, showShortcuts])

  return (
    <div className="recruiter-application-detail-backdrop" onMouseDown={onClose} role="presentation">
      <aside
        aria-label={`${translations.title}: ${application.candidateName}`}
        aria-modal="true"
        className={`recruiter-application-detail-drawer ${
          isExpanded ? 'is-expanded recruiter-application-detail-drawer--split' : ''
        }`}
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
          <div className="recruiter-application-detail-drawer__header-actions">
            <button
              aria-label={isExpanded ? 'Thu gọn workspace' : 'Mở rộng workspace kép'}
              className={`recruiter-drawer-header-btn ${isExpanded ? 'is-active' : ''}`}
              onClick={() => setIsExpanded((prev) => !prev)}
              title={
                isExpanded
                  ? 'Thu gọn về chiều rộng tiêu chuẩn (Phím V)'
                  : 'Mở rộng workspace xem CV & JD (Phím V)'
              }
              type="button"
            >
              {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              <span>{isExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
            </button>

            {derivedTotal !== undefined && derivedTotal > 0 ? (
              <div className="recruiter-drawer-header-pagination">
                <button
                  aria-label="Ứng viên trước"
                  className="recruiter-drawer-header-arrow"
                  disabled={!canGoPrevious}
                  onClick={handlePrevious}
                  title="Ứng viên trước (Phím K)"
                  type="button"
                >
                  <ChevronLeft size={15} />
                </button>
                <span className="recruiter-drawer-header-counter">
                  {derivedIndex !== undefined
                    ? `${derivedIndex} / ${derivedTotal}`
                    : derivedTotal}
                </span>
                <button
                  aria-label="Ứng viên kế tiếp"
                  className="recruiter-drawer-header-arrow"
                  disabled={!canGoNext}
                  onClick={handleNext}
                  title="Ứng viên kế tiếp (Phím J)"
                  type="button"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            ) : null}

            <button
              aria-label="Hướng dẫn phím tắt"
              className="recruiter-drawer-header-icon-btn"
              onClick={() => setShowShortcuts(true)}
              title="Hướng dẫn phím tắt ATS (Phím ?)"
              type="button"
            >
              <Keyboard size={16} />
            </button>

            <button
              aria-label={translations.close}
              className="recruiter-drawer-header-icon-btn recruiter-drawer-header-icon-btn--close"
              onClick={onClose}
              title="Đóng chi tiết (Esc)"
              type="button"
            >
              <X size={17} />
            </button>
          </div>
        </header>

        {/* Mobile Tab Switcher */}
        {isExpanded && (
          <div className="recruiter-application-detail-drawer__mobile-tabs">
            <button
              className={`recruiter-application-detail-drawer__mobile-tab ${
                mobileActiveTab === 'evaluation' ? 'is-active' : ''
              }`}
              onClick={() => setMobileActiveTab('evaluation')}
              type="button"
            >
              <UserCheck size={16} />
              <span>Đánh giá ứng viên</span>
            </button>
            <button
              className={`recruiter-application-detail-drawer__mobile-tab ${
                mobileActiveTab === 'workspace' ? 'is-active' : ''
              }`}
              onClick={() => setMobileActiveTab('workspace')}
              type="button"
            >
              <FileText size={16} />
              <span>Xem trước CV & Tiêu chí JD</span>
            </button>
          </div>
        )}

        <div
          className={`recruiter-application-detail-drawer__body ${
            isExpanded ? 'recruiter-drawer-split-grid recruiter-application-detail-drawer__body--split' : ''
          }`}
        >
          {/* Left Column: Review Workspace (CV preview / Job criteria) */}
          {isExpanded && (
            <div
              className={`recruiter-application-detail-pane recruiter-application-detail-pane--workspace ${
                mobileActiveTab !== 'workspace' ? 'is-hidden-mobile' : ''
              }`}
            >
              <ApplicationReviewWorkspace
                application={application}
                onOpenResumeExternal={() => onOpenResume(application)}
              />
            </div>
          )}

          {/* Right Column: Candidate Evaluation (Identity, AI Match, Decision form, Contact, Timeline) */}
          <div
            className={`recruiter-application-detail-pane recruiter-application-detail-pane--evaluation ${
              isExpanded && mobileActiveTab !== 'evaluation' ? 'is-hidden-mobile' : ''
            }`}
          >
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
                <button
                  onClick={() => {
                    setIsExpanded(true)
                    setMobileActiveTab('workspace')
                    onOpenResume(application)
                  }}
                  type="button"
                >
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
                ref={decisionFormRef}
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
        </div>

        <footer className="recruiter-drawer-shortcut-bar">
          <div className="recruiter-drawer-shortcut-bar__inner">
            <div className="recruiter-drawer-shortcut-bar__hint-cluster">
              <span className="recruiter-drawer-shortcut-bar__tag">
                <Keyboard size={13} /> Phím tắt:
              </span>
              <span className="recruiter-drawer-shortcut-bar__item">
                <kbd>J</kbd>/<kbd>K</kbd> Chuyển ứng viên
              </span>
              <span className="recruiter-drawer-shortcut-bar__item">
                <kbd>V</kbd> Đổi chế độ xem
              </span>
              <span className="recruiter-drawer-shortcut-bar__item">
                <kbd>O</kbd> Duyệt
              </span>
              <span className="recruiter-drawer-shortcut-bar__item">
                <kbd>R</kbd> Từ chối
              </span>
            </div>
            <button
              className="recruiter-drawer-shortcut-bar__trigger"
              onClick={() => setShowShortcuts(true)}
              title="Xem toàn bộ hướng dẫn phím tắt (Phím ?)"
              type="button"
            >
              <span>Hướng dẫn</span>
              <kbd>?</kbd>
            </button>
          </div>
        </footer>
      </aside>

      <ApplicationKeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  )
}
