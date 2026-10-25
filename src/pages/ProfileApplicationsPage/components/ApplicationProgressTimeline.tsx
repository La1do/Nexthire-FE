import { useLocale } from '../../../i18n'
import type { ProfileTranslations } from '../../../i18n/types'
import type { ApplicationProgressEvent, ApplicationProgressStep } from '../../../types/application.types'
import type { CandidateApplication } from '../types'

const orderedSteps = ['CV_SUBMITTED', 'CV_RECEIVED', 'CV_VIEWED', 'RESPONDED'] as const

type OrderedProgressStep = (typeof orderedSteps)[number]

type ApplicationProgressTimelineProps = {
  application: CandidateApplication
  formatDate: (value: string) => string
  labels: ProfileTranslations['applications']['progress']
}

function isOrderedStep(step: ApplicationProgressStep): step is OrderedProgressStep {
  return orderedSteps.includes(step as OrderedProgressStep)
}

function getEventByStep(events: ReadonlyArray<ApplicationProgressEvent>) {
  return events.reduce<Partial<Record<OrderedProgressStep, ApplicationProgressEvent>>>((eventMap, event) => {
    if (isOrderedStep(event.step)) {
      eventMap[event.step] = event
    }

    return eventMap
  }, {})
}

function getCompletedStepIndex(application: CandidateApplication) {
  const currentProgressStep = application.currentProgressStep ?? application.progress?.currentProgressStep

  if (currentProgressStep === 'CANCELLED') {
    return -1
  }

  if (currentProgressStep && isOrderedStep(currentProgressStep)) {
    return orderedSteps.indexOf(currentProgressStep)
  }

  if (application.status === 'OFFERED' || application.status === 'REJECTED') {
    return orderedSteps.indexOf('RESPONDED')
  }

  if (application.status === 'SUBMITTED') {
    return orderedSteps.indexOf('CV_RECEIVED')
  }

  return -1
}

const stepBadgeLabels: Record<string, { completed: string; current: string; pending: string; counterSuffix: string }> = {
  vi: {
    completed: 'Đã hoàn thành',
    current: 'Đang xử lý',
    pending: 'Chờ xử lý',
    counterSuffix: 'bước hoàn tất',
  },
  en: {
    completed: 'Completed',
    current: 'In progress',
    pending: 'Upcoming',
    counterSuffix: 'steps completed',
  },
  ja: {
    completed: '完了',
    current: '対応中',
    pending: '待機中',
    counterSuffix: 'ステップ完了',
  },
}

export function ApplicationProgressTimeline({
  application,
  formatDate,
  labels,
}: ApplicationProgressTimelineProps) {
  const { locale } = useLocale()
  const badges = stepBadgeLabels[locale] ?? stepBadgeLabels.vi
  const events = application.progress?.events ?? []
  const eventByStep = getEventByStep(events)
  const completedStepIndex = getCompletedStepIndex(application)
  const currentProgressStep = application.currentProgressStep ?? application.progress?.currentProgressStep
  const cancelledEvent = events.find((event) => event.step === 'CANCELLED')

  const completedCount = completedStepIndex >= 0 ? Math.min(completedStepIndex + 1, orderedSteps.length) : 0

  return (
    <section className="profile-application-progress" aria-label={labels.label}>
      <div className="profile-application-progress__header">
        <h3>{labels.label}</h3>
        {completedStepIndex >= 0 && !cancelledEvent && currentProgressStep !== 'CANCELLED' ? (
          <span className="profile-application-progress__counter">
            {completedCount} / {orderedSteps.length} {badges.counterSuffix}
          </span>
        ) : null}
      </div>

      {currentProgressStep === 'CANCELLED' || cancelledEvent ? (
        <div className="profile-application-progress-cancelled">
          <strong>{cancelledEvent?.title ?? labels.cancelledTitle}</strong>
          <p>{cancelledEvent?.description ?? labels.cancelledDescription}</p>
          {cancelledEvent ? <time dateTime={cancelledEvent.occurredAt}>{formatDate(cancelledEvent.occurredAt)}</time> : null}
        </div>
      ) : (
        <ol className="profile-application-progress-steps">
          {orderedSteps.map((step, index) => {
            const event = eventByStep[step]
            const isCompleted = index < completedStepIndex
            const isCurrent = index === completedStepIndex
            const isDone = index <= completedStepIndex
            const isLineDone = index < completedStepIndex

            const badgeText = isCompleted
              ? badges.completed
              : isCurrent
                ? badges.current
                : badges.pending

            return (
              <li
                className={`profile-application-progress-steps__item ${isDone ? 'is-done' : 'is-pending'} ${
                  isCompleted ? 'is-completed' : ''
                } ${isCurrent ? 'is-current' : ''} ${isLineDone ? 'is-line-done' : ''}`}
                key={step}
              >
                <div className="profile-application-progress-steps__track">
                  <div className="profile-application-progress-steps__node" aria-hidden="true">
                    {isCompleted ? (
                      <span className="profile-application-progress-steps__check">
                        <svg
                          fill="none"
                          height="12"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          width="12"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    ) : isCurrent ? (
                      <span className="profile-application-progress-steps__pulse-dot" />
                    ) : (
                      <span className="profile-application-progress-steps__step-num">{index + 1}</span>
                    )}
                  </div>
                  {index < orderedSteps.length - 1 ? (
                    <div className={`profile-application-progress-steps__line ${isLineDone ? 'is-active' : ''}`} />
                  ) : null}
                </div>

                <div className="profile-application-progress-steps__card">
                  <div className="profile-application-progress-steps__meta">
                    <span
                      className={`profile-application-progress-step-tag ${
                        isCompleted
                          ? 'profile-application-progress-step-tag--completed'
                          : isCurrent
                            ? 'profile-application-progress-step-tag--current'
                            : 'profile-application-progress-step-tag--pending'
                      }`}
                    >
                      {badgeText}
                    </span>
                    {event ? (
                      <time className="profile-application-progress-steps__time" dateTime={event.occurredAt}>
                        {formatDate(event.occurredAt)}
                      </time>
                    ) : null}
                  </div>
                  <strong className="profile-application-progress-steps__title">
                    {event?.title ?? labels.steps[step]}
                  </strong>
                  <p className="profile-application-progress-steps__desc">
                    {event?.description ?? labels.descriptions[step]}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
