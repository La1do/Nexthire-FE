import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslations } from '../../i18n'
import { getApiErrorEnvelope } from '../../lib/api/apiError'
import { companyService } from '../../services/company.service'
import type { CreateCompanyPayload } from '../../types/company.types'
import { Button } from '../_components'
import { CompanyVerificationCard } from './components/CompanyVerificationCard'
import { CompanyVerificationDrawer } from './components/CompanyVerificationDrawer'
import {
  RecruiterApplications,
  RecruiterPerformance,
  RecruiterPipeline,
  RecruiterQuickActions,
  RecruiterStatGrid,
  RecruiterTasks,
} from './components/RecruiterDashboardPanels'
import type { CompanyVerificationFormValues } from './types'
import { useRecruiterDashboardData } from './hooks/useRecruiterDashboardData'
import {
  createCompanyFormValues,
  recruiterQuickActions,
} from './utils/recruiterHomeData'

function createCompanyPayload(values: CompanyVerificationFormValues): CreateCompanyPayload {
  const logo = values.logo.trim()
  const website = values.website.trim()
  const address = values.address.trim()
  const description = values.description.trim()

  return {
    name: values.name.trim(),
    address: address || null,
    description: description || null,
    logo: logo || null,
    taxCode: values.taxCode.trim(),
    website: website || null,
  }
}

export function RecruiterHomePage() {
  const { pages } = useTranslations()
  const content = pages.recruiterHome
  const navigate = useNavigate()
  const { data, error, loading, refresh } = useRecruiterDashboardData()
  const [isVerificationOpen, setVerificationOpen] = useState(false)
  const [isCompanySubmitting, setCompanySubmitting] = useState(false)
  const [companySubmitError, setCompanySubmitError] = useState<string | undefined>(undefined)
  const company = data?.company

  const handleVerificationSubmit = useCallback(
    async (values: CompanyVerificationFormValues) => {
      setCompanySubmitting(true)
      setCompanySubmitError(undefined)

      try {
        const payload = createCompanyPayload(values)

        if (company?.id) {
          await companyService.updateCompany(company.id, payload)
        } else {
          await companyService.createCompany(payload)
        }

        await refresh()
        setVerificationOpen(false)
      } catch (submitError) {
        setCompanySubmitError(getApiErrorEnvelope(submitError)?.error.message ?? content.verification.form.submitError)
      } finally {
        setCompanySubmitting(false)
      }
    },
    [company?.id, content.verification.form.submitError, refresh],
  )

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
          <Button onClick={() => navigate('/recruiter/candidates')} variant="secondary">
            {content.hero.secondaryAction}
          </Button>
        </div>
      </section>

      <CompanyVerificationCard
        company={activeCompany}
        onOpenVerification={() => {
          setCompanySubmitError(undefined)
          setVerificationOpen(true)
        }}
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

      {isVerificationOpen ? (
        <CompanyVerificationDrawer
          initialValues={createCompanyFormValues(activeCompany)}
          isSubmitting={isCompanySubmitting}
          onClose={() => setVerificationOpen(false)}
          onSubmit={handleVerificationSubmit}
          submitError={companySubmitError}
          translations={content.verification}
        />
      ) : null}
    </div>
  )
}
