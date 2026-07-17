import { type CSSProperties, useState } from 'react'
import type { HomeTranslations } from '../../../i18n/types'
import type { JobCardView } from '../types'
import { HomeSectionState } from './HomeSectionState'
import { JobCard } from './JobCard'
import { SectionHeading } from './SectionHeading'

type JobSectionsProps = {
  content: HomeTranslations['jobs']
  states: HomeTranslations['states']
  jobs: ReadonlyArray<JobCardView>
  loading: boolean
  error: unknown
}

export function JobSections({ content, states, jobs, loading, error }: JobSectionsProps) {
  const [activeTab, setActiveTab] = useState(0)
  const visibleJobs = [...jobs].sort((left, right) => {
    // Tab 1 = newest, Tab 2 = highest salary. Sort on raw numeric fields
    // instead of the locale-formatted strings so ordering stays correct.
    if (activeTab === 1) return right.postedSortValue - left.postedSortValue
    if (activeTab === 2) return right.salarySortValue - left.salarySortValue
    return 0
  })
  const tabStyle = {
    '--active-tab': activeTab,
    '--tab-count': content.tabs.length,
  } as CSSProperties

  const isEmpty = !visibleJobs.length
  const showPlaceholder = loading || Boolean(error) || isEmpty

  return (
    <section className="home-section home-reveal">
      <div className="home-jobs-heading">
        <SectionHeading eyebrow={content.eyebrow} title={content.title} />
        <div className="home-tabs" style={tabStyle}>
          {content.tabs.map((tab, index) => (
            <button
              aria-pressed={activeTab === index}
              key={tab}
              onClick={() => setActiveTab(index)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {showPlaceholder ? (
        <HomeSectionState error={error} isEmpty={isEmpty} loading={loading} states={states} />
      ) : (
        <>
          <div className="home-card-grid">
            {visibleJobs.map((job) => (
              <JobCard job={job} key={job.id} saveLabel={content.saveLabel} />
            ))}
          </div>

          <button className="home-load-more" type="button">{content.loadMore}</button>
        </>
      )}
    </section>
  )
}
