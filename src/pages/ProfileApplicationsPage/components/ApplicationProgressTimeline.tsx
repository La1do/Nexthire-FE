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

export function ApplicationProgressTimeline({
  application,
  formatDate,
  labels,
}: ApplicationProgressTimelineProps) {
  const events = application.progress?.events ?? []
  const eventByStep = getEventByStep(events)
  const completedStepIndex = getCompletedStepIndex(application)
  const currentProgressStep = application.currentProgressStep ?? application.progress?.currentProgressStep
  const cancelledEvent = events.find((event) => event.step === 'CANCELLED')

  return (
    <section className="profile-application-progress" aria-label={labels.label}>
      <h3>{labels.label}</h3>

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
            const isDone = index <= completedStepIndex

            return (
              <li className={isDone ? 'is-done' : undefined} key={step}>
                <span aria-hidden="true" className="profile-application-progress-steps__dot" />
                <div>
                  <strong>{event?.title ?? labels.steps[step]}</strong>
                  <p>{event?.description ?? labels.descriptions[step]}</p>
                  {event ? <time dateTime={event.occurredAt}>{formatDate(event.occurredAt)}</time> : null}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
