import { getTranslations } from '../../i18n'
import { ArticleGrid } from './components/ArticleGrid'
import { CategoryGrid } from './components/CategoryGrid'
import { EmployerStrip } from './components/EmployerStrip'
import { HeroPanel } from './components/HeroPanel'
import { IndustryJobs } from './components/IndustryJobs'
import { JobSections } from './components/JobSections'
import { NewsletterPanel } from './components/NewsletterPanel'

export function HomePage() {
  const { pages } = getTranslations()
  const home = pages.home

  return (
    <div className="home-page">
      <HeroPanel content={home.hero} />
      <EmployerStrip content={home.employers} />
      <JobSections content={home.jobs} />
      <CategoryGrid content={home.categories} />
      <IndustryJobs content={home.industryJobs} />
      <ArticleGrid content={home.articles} />
      <NewsletterPanel content={home.newsletter} />
    </div>
  )
}

export default HomePage
