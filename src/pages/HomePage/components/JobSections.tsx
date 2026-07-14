import { useState } from 'react'
import type { HomeTranslations } from '../../../i18n/types'
import { JobCard } from './JobCard'
import { SectionHeading } from './SectionHeading'

type JobSectionsProps = {
  content: HomeTranslations['jobs']
}

export function JobSections({ content }: JobSectionsProps) {
  const [activeTab, setActiveTab] = useState(0)
  const visibleJobs = activeTab === 0 ? content.items : [...content.items].reverse()

  return (
    <section className="home-section home-reveal">
      <div className="home-jobs-heading">
        <SectionHeading eyebrow={content.eyebrow} title={content.title} />
        <div className="home-tabs">
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
          <JobCard job={job} key={`${job.company}-${job.title}`} />
        ))}
      </div>

      <div className="home-pagination">
        <button aria-label={content.previousPage} type="button">
          <span aria-hidden="true">←</span>
        </button>
        <button aria-current="page" type="button">
          1
        </button>
        <button type="button">
          2
        </button>
        <button aria-label={content.nextPage} type="button">
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  )
}
