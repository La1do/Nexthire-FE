import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link } from 'react-router-dom'
import type { RecruiterHomeTranslations } from '../../../i18n/types'
import type {
  RecruiterApplication,
  RecruiterPerformancePoint,
  RecruiterPipelineItem,
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
        {stats.map((stat) => {
          const className = `recruiter-stat-card recruiter-stat-card--${stat.tone}${stat.href ? ' recruiter-stat-card--link' : ''}`
          const content = (
            <>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.delta}</small>
            </>
          )

          return stat.href ? (
            <Link className={className} to={stat.href} key={stat.id}>
              {content}
            </Link>
          ) : (
            <article className={className} key={stat.id}>
              {content}
            </article>
          )
        })}
      </div>
    </section>
  )
}

type RecruiterQuickActionsProps = {
  isVerified: boolean
  translations: RecruiterHomeTranslations['quickActions']
}

export function RecruiterQuickActions({ isVerified, translations }: RecruiterQuickActionsProps) {
  return (
    <section className="recruiter-panel">
      <div className="recruiter-panel__header">
        <h2>{translations.title}</h2>
      </div>
      <div className="recruiter-action-grid">
        {translations.items.map((action) => {
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
        <a href="/recruiter/applications">{translations.viewAll}</a>
      </div>
      {applications.length ? (
        <div className="recruiter-application-list">
          {applications.map((application) => (
            <article className="recruiter-application-card" key={application.id}>
              <span aria-hidden="true">{application.candidateName.slice(0, 2).toUpperCase()}</span>
              <div>
                <strong>{application.candidateName}</strong>
                <small>{application.role}</small>
              </div>
              <em className={`recruiter-application-card__score is-${application.scoreTone}`}>
                {application.score}
              </em>
              <p>{application.stage}</p>
              <time>{application.submittedAt}</time>
            </article>
          ))}
        </div>
      ) : (
        <p className="recruiter-panel-empty">{translations.empty}</p>
      )}
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
        <ResponsiveContainer height="100%" width="100%">
          <BarChart accessibilityLayer data={points} margin={{ bottom: 0, left: -28, right: 0, top: 8 }}>
            <defs>
              <linearGradient id="recruiter-performance-gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-brand-start)" />
                <stop offset="100%" stopColor="var(--color-brand-end)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="label"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12, fontWeight: 700 }}
              tickLine={false}
            />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-control)',
              }}
              cursor={{ fill: 'var(--color-surface-muted)' }}
              formatter={(value) => [String(value), translations.applicationsLabel]}
              labelStyle={{ color: 'var(--color-text-primary)', fontWeight: 700 }}
            />
            <Bar
              dataKey="count"
              fill="url(#recruiter-performance-gradient)"
              maxBarSize={34}
              radius={[6, 6, 2, 2]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="sr-only">
        {points.map((point) => (
          <li key={point.id}>
            {point.label}: {point.count} {translations.applicationsLabel}
          </li>
        ))}
      </ul>
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
      {tasks.length ? (
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
      ) : (
        <p className="recruiter-panel-empty">{translations.empty}</p>
      )}
    </section>
  )
}
