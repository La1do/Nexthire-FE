import { type CSSProperties, useState } from 'react'
import type { HomeTranslations } from '../../../i18n/types'
import { JobCard } from './JobCard'
import { SectionHeading } from './SectionHeading'

type JobSectionsProps = {
  content: HomeTranslations['jobs']
}

function getPostedRank(postedAt: string) {
  const normalized = postedAt.toLowerCase()

  if (normalized.includes('giờ') || normalized.includes('hour') || normalized.includes('時間')) return 0
  if (normalized.includes('hôm nay') || normalized.includes('today') || normalized.includes('本日')) return 1

  const dayMatch = normalized.match(/(\d+)/)
  return dayMatch ? Number(dayMatch[1]) + 1 : 99
}

function getSalaryRank(salary: string) {
  const values = salary.match(/\d+/g)?.map(Number) ?? []
  return Math.max(...values, 0)
}

export function JobSections({ content }: JobSectionsProps) {
  const [activeTab, setActiveTab] = useState(0)
  const visibleJobs = [...content.items].sort((left, right) => {
    if (activeTab === 1) return getPostedRank(left.postedAt) - getPostedRank(right.postedAt)
    if (activeTab === 2) return getSalaryRank(right.salary) - getSalaryRank(left.salary)
    return 0
  })
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
