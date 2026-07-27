import { useNavigate } from 'react-router-dom'
import { useTranslations } from '../../i18n'
import { Button } from '../_components'
import { CompanyVerificationCard } from './components/CompanyVerificationCard'
import {
  RecruiterApplications,
  RecruiterPerformance,
  RecruiterPipeline,
  RecruiterQuickActions,
  RecruiterStatGrid,
  RecruiterTasks,
} from './components/RecruiterDashboardPanels'
import { useRecruiterDashboardData } from './hooks/useRecruiterDashboardData'
import { recruiterQuickActions } from './utils/recruiterHomeData'

export function RecruiterHomePage() {
  const { pages } = useTranslations()
  const content = pages.recruiterHome
  const navigate = useNavigate()
  const { data, error, loading, refresh } = useRecruiterDashboardData()

  if (loading && !data) {
    return (
      <div className="recruiter-home-page">
        <section className="recruiter-dashboard-state recruiter-panel">
          <p>{content.states.loading}</p>
        </section>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="recruiter-home-page">
        <section className="recruiter-dashboard-state recruiter-panel">
          <h2>{content.states.errorTitle}</h2>
          <p>{content.states.errorDescription}</p>
          <Button onClick={() => void refresh()}>{content.states.retry}</Button>
        </section>
      </div>
    )
  }

  const { applications, company: recruiterCompany, performance, pipeline, stats, tasks } = data
  const activeCompany = recruiterCompany
  const isVerified = activeCompany.status === 'APPROVED'

  return (
    <div className="recruiter-home-page">
      <section className="recruiter-hero">
        <div>
          <p className="recruiter-eyebrow">{content.hero.eyebrow}</p>
          <h2>{content.hero.title}</h2>
          <p>{content.hero.description}</p>
        </div>
        <div className="recruiter-hero__actions">
          <Button disabled={!isVerified} onClick={() => navigate('/recruiter/jobs/new')}>
            {content.hero.primaryAction}
          </Button>
          <Button onClick={() => navigate('/recruiter/applications')} variant="secondary">
            {content.hero.secondaryAction}
          </Button>
        </div>
      </section>

      <CompanyVerificationCard
        company={activeCompany}
        onOpenVerification={() => navigate('/recruiter/verification')}
        translations={content.verification}
      />

      <RecruiterStatGrid stats={stats} title={content.stats.title} />

      <div className="recruiter-home-grid">
        <div className="recruiter-home-grid__main">
          <RecruiterQuickActions
            actions={recruiterQuickActions}
            isVerified={isVerified}
            translations={content.quickActions}
          />
          <RecruiterApplications applications={applications} translations={content.applications} />
        </div>
        <aside className="recruiter-home-grid__side">
          <RecruiterPipeline items={pipeline} translations={content.pipeline} />
          <RecruiterPerformance points={performance} translations={content.performance} />
          <RecruiterTasks tasks={tasks} translations={content.tasks} />
        </aside>
      </div>
    </div>
  )
}
