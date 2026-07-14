import { type CSSProperties, useState } from 'react'
import type { HomeTranslations } from '../../../i18n/types'
import { JobCard } from './JobCard'
import { SectionHeading } from './SectionHeading'

type JobSectionsProps = {
  content: HomeTranslations['jobs']
}

export function JobSections({ content }: JobSectionsProps) {
  const [activeTab, setActiveTab] = useState(0)
  const visibleJobs = activeTab === 0 ? content.items : [...content.items].reverse()
  const tabStyle = {
    '--active-tab': activeTab,
    '--tab-count': content.tabs.length,
  } as CSSProperties

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

      <div className="home-card-grid">
        {visibleJobs.map((job) => (
          <JobCard job={job} key={`${job.company}-${job.title}`} saveLabel={content.saveLabel} />
        ))}
      </div>

      <button className="home-load-more" type="button">{content.loadMore}</button>
    </section>
  )
}
