import type { RecruiterHomeTranslations } from '../../../i18n/types'
import type {
  RecruiterApplication,
  RecruiterPerformancePoint,
  RecruiterPipelineItem,
  RecruiterQuickAction,
  RecruiterStat,
  RecruiterTask,
} from '../types'

type RecruiterStatGridProps = {
  stats: ReadonlyArray<RecruiterStat>
  title: string
}

export function RecruiterStatGrid({ stats, title }: RecruiterStatGridProps) {
  return (
    <section className="recruiter-panel recruiter-stat-section">
      <div className="recruiter-panel__header">
        <h2>{title}</h2>
      </div>
      <div className="recruiter-stat-grid">
        {stats.map((stat) => (
          <article className={`recruiter-stat-card recruiter-stat-card--${stat.tone}`} key={stat.id}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.delta}</small>
          </article>
        ))}
      </div>
    </section>
  )
}

type RecruiterQuickActionsProps = {
  actions: ReadonlyArray<RecruiterQuickAction>
  isVerified: boolean
  translations: RecruiterHomeTranslations['quickActions']
}

export function RecruiterQuickActions({ actions, isVerified, translations }: RecruiterQuickActionsProps) {
  return (
    <section className="recruiter-panel">
      <div className="recruiter-panel__header">
        <h2>{translations.title}</h2>
      </div>
      <div className="recruiter-action-grid">
        {actions.map((action) => {
          const isLocked = action.disabledWhenUnverified && !isVerified

          return (
            <a
              aria-disabled={isLocked}
              className={`recruiter-action-card${isLocked ? ' is-disabled' : ''}`}
              href={action.href}
              key={action.id}
              onClick={(event) => {
                if (isLocked) {
                  event.preventDefault()
                }
              }}
            >
              <span aria-hidden="true" />
              <strong>{action.label}</strong>
              <small>{action.description}</small>
              {isLocked ? <em>{translations.lockedHint}</em> : null}
            </a>
          )
        })}
      </div>
    </section>
  )
}

type RecruiterPipelineProps = {
  items: ReadonlyArray<RecruiterPipelineItem>
  translations: RecruiterHomeTranslations['pipeline']
}

export function RecruiterPipeline({ items, translations }: RecruiterPipelineProps) {
  const maxCount = Math.max(...items.map((item) => item.count), 1)

  return (
    <section className="recruiter-panel">
      <div className="recruiter-panel__header">
        <div>
          <h2>{translations.title}</h2>
          <p>{translations.description}</p>
        </div>
      </div>
      <div className="recruiter-pipeline-list">
        {items.map((item) => (
          <article className={`recruiter-pipeline-item recruiter-pipeline-item--${item.tone}`} key={item.id}>
            <div>
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </div>
            <span className="recruiter-pipeline-bar">
              <span style={{ width: `${(item.count / maxCount) * 100}%` }} />
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}

type RecruiterApplicationsProps = {
  applications: ReadonlyArray<RecruiterApplication>
  translations: RecruiterHomeTranslations['applications']
}

export function RecruiterApplications({ applications, translations }: RecruiterApplicationsProps) {
  return (
    <section className="recruiter-panel recruiter-applications-panel">
      <div className="recruiter-panel__header">
        <div>
          <h2>{translations.title}</h2>
          <p>{translations.description}</p>
        </div>
        <a href="/">{translations.viewAll}</a>
      </div>
      <div className="recruiter-application-list">
        {applications.map((application) => (
          <article className="recruiter-application-card" key={application.id}>
            <span aria-hidden="true">{application.candidateName.slice(0, 2).toUpperCase()}</span>
            <div>
              <strong>{application.candidateName}</strong>
              <small>{application.role}</small>
            </div>
            <em>{application.score}</em>
            <p>{application.stage}</p>
            <time>{application.submittedAt}</time>
          </article>
        ))}
      </div>
    </section>
  )
}

type RecruiterPerformanceProps = {
  points: ReadonlyArray<RecruiterPerformancePoint>
  translations: RecruiterHomeTranslations['performance']
}

export function RecruiterPerformance({ points, translations }: RecruiterPerformanceProps) {
  return (
    <section className="recruiter-panel">
      <div className="recruiter-panel__header">
        <div>
          <h2>{translations.title}</h2>
          <p>{translations.description}</p>
        </div>
      </div>
      <div className="recruiter-performance-chart">
        {points.map((point) => (
          <div key={point.id}>
            <span aria-label={`${point.value} ${translations.applicationsLabel}`} style={{ height: `${point.value}%` }} />
            <small>{point.label}</small>
          </div>
        ))}
      </div>
    </section>
  )
}

type RecruiterTasksProps = {
  tasks: ReadonlyArray<RecruiterTask>
  translations: RecruiterHomeTranslations['tasks']
}

export function RecruiterTasks({ tasks, translations }: RecruiterTasksProps) {
  return (
    <section className="recruiter-panel">
      <div className="recruiter-panel__header">
        <div>
          <h2>{translations.title}</h2>
          <p>{translations.description}</p>
        </div>
      </div>
      <div className="recruiter-task-list">
        {tasks.map((task) => (
          <article className={`recruiter-task-card recruiter-task-card--${task.tone}`} key={task.id}>
            <span aria-hidden="true" />
            <div>
              <strong>{task.label}</strong>
              <small>{task.description}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
