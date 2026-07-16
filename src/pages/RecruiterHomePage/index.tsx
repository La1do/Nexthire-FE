import { useCallback, useState } from 'react'
import { getTranslations } from '../../i18n'
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
import {
  createCompanyFormValues,
  recruiterApplications,
  recruiterCompanyFixture,
  recruiterPerformance,
  recruiterPipeline,
  recruiterQuickActions,
  recruiterStats,
  recruiterTasks,
} from './utils/recruiterHomeData'

export function RecruiterHomePage() {
  const { pages } = getTranslations()
  const content = pages.recruiterHome
  const [company, setCompany] = useState(recruiterCompanyFixture)
  const [isVerificationOpen, setVerificationOpen] = useState(false)
  const isVerified = company.status === 'APPROVED'

  const handleVerificationSubmit = useCallback((values: CompanyVerificationFormValues) => {
    setCompany((currentCompany) => ({
      ...currentCompany,
      address: values.address.trim(),
      completion: 86,
      description: values.description.trim(),
      logo: values.logo.trim(),
      name: values.name.trim(),
      status: 'PENDING',
      submittedAt: '16/07/2026',
      taxCode: values.taxCode.trim(),
      website: values.website.trim(),
    }))
    setVerificationOpen(false)
  }, [])

  return (
    <div className="recruiter-home-page">
      <section className="recruiter-hero">
        <div>
          <p className="recruiter-eyebrow">{content.hero.eyebrow}</p>
          <h2>{content.hero.title}</h2>
          <p>{content.hero.description}</p>
        </div>
        <div className="recruiter-hero__actions">
          <Button disabled={!isVerified}>{content.hero.primaryAction}</Button>
          <Button variant="secondary">{content.hero.secondaryAction}</Button>
        </div>
      </section>

      <CompanyVerificationCard
        company={company}
        onOpenVerification={() => setVerificationOpen(true)}
        translations={content.verification}
      />

      <RecruiterStatGrid stats={recruiterStats} title={content.stats.title} />

      <div className="recruiter-home-grid">
        <div className="recruiter-home-grid__main">
          <RecruiterQuickActions
            actions={recruiterQuickActions}
            isVerified={isVerified}
            translations={content.quickActions}
          />
          <RecruiterApplications applications={recruiterApplications} translations={content.applications} />
        </div>
        <aside className="recruiter-home-grid__side">
          <RecruiterPipeline items={recruiterPipeline} translations={content.pipeline} />
          <RecruiterPerformance points={recruiterPerformance} translations={content.performance} />
          <RecruiterTasks tasks={recruiterTasks} translations={content.tasks} />
        </aside>
      </div>

      {isVerificationOpen ? (
        <CompanyVerificationDrawer
          initialValues={createCompanyFormValues(company)}
          onClose={() => setVerificationOpen(false)}
          onSubmit={handleVerificationSubmit}
          translations={content.verification}
        />
      ) : null}
    </div>
  )
}
