import { useMemo } from 'react'
import { useTranslations } from '../../i18n'
import { useSavedJobsHydrate } from '../../hooks/useSavedJobsHydrate'
import { ArticleGrid } from './components/ArticleGrid'
import { CategoryGrid } from './components/CategoryGrid'
import { EmployerStrip } from './components/EmployerStrip'
import { HeroPanel } from './components/HeroPanel'
import { IndustryJobs } from './components/IndustryJobs'
import { JobSections } from './components/JobSections'
import { NewsletterPanel } from './components/NewsletterPanel'
import { useHomeData } from './hooks/useHomeData'
import { useHomeReveal } from './hooks/useHomeReveal'
import './home.css'

export function HomePage() {
  const { pages } = useTranslations()
  const home = pages.home
  const states = home.states
  const data = useHomeData()
  const homeRef = useHomeReveal()

  const homeJobIds = useMemo(() => {
    const ids = new Set<string>()
    for (const job of data.jobs.data) {
      ids.add(job.id)
    }
    for (const group of data.industryGroups.data) {
      for (const job of group.jobs) {
        ids.add(job.id)
      }
    }
    return Array.from(ids)
  }, [data.jobs.data, data.industryGroups.data])

  useSavedJobsHydrate(homeJobIds)

  return (
    <div className="home-page" ref={homeRef}>
      <HeroPanel
        content={home.hero}
        spotlight={data.companies.data.slice(0, 3)}
        stats={data.stats.data}
      />
      <EmployerStrip
        companies={data.companies.data}
        content={home.employers}
        error={data.companies.error}
        loading={data.companies.loading}
        states={states}
      />
      <div className="home-discovery-grid">
        <JobSections
          content={home.jobs}
          error={data.jobs.error}
          jobs={data.jobs.data}
          loading={data.jobs.loading}
          states={states}
        />
        <CategoryGrid
          categories={data.categories.data}
          content={home.categories}
          error={data.categories.error}
          loading={data.categories.loading}
          states={states}
        />
      </div>
      <IndustryJobs
        content={home.industryJobs}
        error={data.industryGroups.error}
        groups={data.industryGroups.data}
        loading={data.industryGroups.loading}
        states={states}
      />
      <ArticleGrid content={home.articles} />
      <NewsletterPanel content={home.newsletter} />
    </div>
  )
}

export default HomePage
