import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react'
import { useAsync } from '../../hooks/useAsync'
import { useLocale, useTranslations } from '../../i18n'
import type { CompaniesSort } from '../../i18n/types'
import { jobService } from '../../services/job.service'
import type {
  JobWorkingType,
  PublicFeaturedCompany,
  PublicJobListItem,
} from '../../types/job.types'
import { CompanyLogoMark } from '../_components'
import { Button } from '../_components'
import { createCompanyDetailHrefById, createJobDetailHrefById } from '../_utils/jobRoutes'
import { formatPostedAt, initials, intlLocale, pickTone } from '../_utils/jobFormat'
import './companies.css'

const COMPANY_LIMIT = 20
const JOB_LIMIT = 100
const SORT_OPTIONS: CompaniesSort[] = ['mostJobs', 'latest', 'name']

type CompaniesPageData = {
  featuredCompanies: PublicFeaturedCompany[]
  jobs: PublicJobListItem[]
}

type CompanyDirectoryItem = {
  activeJobCount: number
  companyId: string
  jobs: PublicJobListItem[]
  latestPublishedAt: string | null
  locations: string[]
  logoUrl: string
  name: string
  skills: string[]
  workModes: JobWorkingType[]
}

type MutableCompanyDirectoryItem = Omit<CompanyDirectoryItem, 'locations' | 'skills' | 'workModes'> & {
  locations: Set<string>
  skills: Map<string, number>
  workModes: Set<JobWorkingType>
}

function latestDate(left: string | null, right: string | null) {
  if (!left) return right
  if (!right) return left

  return new Date(left).getTime() >= new Date(right).getTime() ? left : right
}

function ensureCompany(
  companies: Map<string, MutableCompanyDirectoryItem>,
  companyId: string,
  name: string | null,
  logoUrl: string | null,
) {
  const current = companies.get(companyId)

  if (current) {
    if (name && current.name === '-') {
      current.name = name
    }

    if (logoUrl && !current.logoUrl) {
      current.logoUrl = logoUrl
    }

    return current
  }

  const next: MutableCompanyDirectoryItem = {
    activeJobCount: 0,
    companyId,
    jobs: [],
    latestPublishedAt: null,
    locations: new Set(),
    logoUrl: logoUrl ?? '',
    name: name ?? '-',
    skills: new Map(),
    workModes: new Set(),
  }

  companies.set(companyId, next)
  return next
}

function buildCompanyDirectory(
  featuredCompanies: ReadonlyArray<PublicFeaturedCompany>,
  jobs: ReadonlyArray<PublicJobListItem>,
) {
  const companies = new Map<string, MutableCompanyDirectoryItem>()

  for (const company of featuredCompanies) {
    const entry = ensureCompany(
      companies,
      company.companyId,
      company.companyName,
      company.companyLogoUrl,
    )

    entry.activeJobCount = Math.max(entry.activeJobCount, company.activeJobCount)
    entry.latestPublishedAt = latestDate(entry.latestPublishedAt, company.latestPublishedAt)
  }

  for (const job of jobs) {
    const entry = ensureCompany(companies, job.companyId, job.companyName, job.companyLogoUrl)
    entry.jobs.push(job)
    entry.activeJobCount = Math.max(entry.activeJobCount, entry.jobs.length)
    entry.latestPublishedAt = latestDate(entry.latestPublishedAt, job.publishedAt)
    entry.workModes.add(job.workingType)

    if (job.location.trim()) {
      entry.locations.add(job.location.trim())
    }

    for (const skill of job.skills) {
      const normalizedSkill = skill.trim()

      if (normalizedSkill) {
        entry.skills.set(normalizedSkill, (entry.skills.get(normalizedSkill) ?? 0) + 1)
      }
    }
  }

  return Array.from(companies.values()).map<CompanyDirectoryItem>((company) => ({
    activeJobCount: company.activeJobCount,
    companyId: company.companyId,
    jobs: [...company.jobs].sort(compareJobsByPublishedAt),
    latestPublishedAt: company.latestPublishedAt,
    locations: Array.from(company.locations).sort((left, right) => left.localeCompare(right)),
    logoUrl: company.logoUrl,
    name: company.name,
    skills: Array.from(company.skills.entries())
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .map(([skill]) => skill)
      .slice(0, 4),
    workModes: Array.from(company.workModes),
  }))
}

function compareJobsByPublishedAt(left: PublicJobListItem, right: PublicJobListItem) {
  return new Date(right.publishedAt ?? 0).getTime() - new Date(left.publishedAt ?? 0).getTime()
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase()
}

function filterCompanies(
  companies: ReadonlyArray<CompanyDirectoryItem>,
  query: string,
  location: string,
  workMode: string,
) {
  const normalizedQuery = normalizeSearch(query)

  return companies.filter((company) => {
    const matchesQuery =
      !normalizedQuery ||
      company.name.toLowerCase().includes(normalizedQuery) ||
      company.locations.some((item) => item.toLowerCase().includes(normalizedQuery)) ||
      company.skills.some((skill) => skill.toLowerCase().includes(normalizedQuery)) ||
      company.jobs.some((job) => job.title.toLowerCase().includes(normalizedQuery))
    const matchesLocation = !location || company.locations.includes(location)
    const matchesWorkMode = !workMode || company.workModes.includes(workMode as JobWorkingType)

    return matchesQuery && matchesLocation && matchesWorkMode
  })
}

function sortCompanies(
  companies: ReadonlyArray<CompanyDirectoryItem>,
  sort: CompaniesSort,
  locale: string,
) {
  const collator = new Intl.Collator(intlLocale(locale), { sensitivity: 'base' })

  return [...companies].sort((left, right) => {
    if (sort === 'name') {
      return collator.compare(left.name, right.name)
    }

    if (sort === 'latest') {
      return new Date(right.latestPublishedAt ?? 0).getTime() - new Date(left.latestPublishedAt ?? 0).getTime()
    }

    return right.activeJobCount - left.activeJobCount || collator.compare(left.name, right.name)
  })
}

function createCompanyJobsHref(company: CompanyDirectoryItem) {
  const params = new URLSearchParams({ keyword: company.name })
  return `/search?${params.toString()}`
}

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(intlLocale(locale), {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

function formatAbsoluteDate(value: string | null, locale: string, fallback: string) {
  if (!value) return fallback

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

async function fetchCompaniesPageData(): Promise<CompaniesPageData> {
  const [featuredCompanies, jobsResponse] = await Promise.all([
    jobService.getFeaturedCompanies(COMPANY_LIMIT),
    jobService.getJobs({ limit: JOB_LIMIT, sort: 'latest' }),
  ])

  return {
    featuredCompanies,
    jobs: jobsResponse.data,
  }
}

export function CompaniesPage() {
  const { locale } = useLocale()
  const { common, pages } = useTranslations()
  const content = pages.companies
  const [reloadKey, setReloadKey] = useState(0)
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [workMode, setWorkMode] = useState('')
  const [sort, setSort] = useState<CompaniesSort>('mostJobs')
  const state = useAsync(fetchCompaniesPageData, [reloadKey])
  const directory = useMemo(
    () => buildCompanyDirectory(state.data?.featuredCompanies ?? [], state.data?.jobs ?? []),
    [state.data?.featuredCompanies, state.data?.jobs],
  )
  const locationOptions = useMemo(
    () =>
      Array.from(new Set(directory.flatMap((company) => company.locations)))
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right)),
    [directory],
  )
  const visibleCompanies = useMemo(
    () => sortCompanies(filterCompanies(directory, query, location, workMode), sort, locale),
    [directory, location, locale, query, sort, workMode],
  )
  const latestJobs = useMemo(
    () => visibleCompanies.flatMap((company) => company.jobs).sort(compareJobsByPublishedAt).slice(0, 5),
    [visibleCompanies],
  )
  const stats = useMemo(
    () => ({
      companies: directory.length,
      openRoles: directory.reduce((total, company) => total + company.activeJobCount, 0),
      remoteFriendly: directory.filter(
        (company) => company.workModes.includes('REMOTE') || company.workModes.includes('HYBRID'),
      ).length,
    }),
    [directory],
  )
  const jobLabels = common.job
  const hasActiveFilters = Boolean(query.trim() || location || workMode)

  function resetFilters() {
    setQuery('')
    setLocation('')
    setWorkMode('')
    setSort('mostJobs')
  }

  if (state.loading) {
    return (
      <div className="companies-page">
        <section className="companies-state">
          <p>{content.states.loading}</p>
        </section>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="companies-page">
        <section className="companies-state">
          <Building2 aria-hidden="true" />
          <h1>{content.states.errorTitle}</h1>
          <p>{content.states.errorDescription}</p>
          <Button onClick={() => setReloadKey((current) => current + 1)}>
            {content.actions.retry}
          </Button>
        </section>
      </div>
    )
  }

  return (
    <div className="companies-page">
      <section className="companies-hero">
        <div className="companies-hero-copy">
          <span className="companies-hero-mark">
            <Sparkles aria-hidden="true" />
            {content.routeLabel}
          </span>
          <h1>{content.hero.title}</h1>
          <p>{content.hero.description}</p>

          <div className="companies-stats" aria-label={content.routeLabel}>
            <CompanyStat
              icon={<Building2 aria-hidden="true" />}
              label={content.stats.companies}
              value={formatNumber(stats.companies, locale)}
            />
            <CompanyStat
              icon={<BriefcaseBusiness aria-hidden="true" />}
              label={content.stats.openRoles}
              value={formatNumber(stats.openRoles, locale)}
            />
            <CompanyStat
              icon={<MapPin aria-hidden="true" />}
              label={content.stats.remoteFriendly}
              value={formatNumber(stats.remoteFriendly, locale)}
            />
          </div>
        </div>

        <form className="companies-filter-panel" onSubmit={(event) => event.preventDefault()}>
          <label className="companies-field companies-search-field">
            <span>{content.hero.searchLabel}</span>
            <span className="companies-input-wrap">
              <Search aria-hidden="true" />
              <input
                onChange={(event) => setQuery(event.target.value)}
                placeholder={content.hero.searchPlaceholder}
                type="search"
                value={query}
              />
            </span>
          </label>

          <div className="companies-filter-grid">
            <label className="companies-field">
              <span>{content.hero.locationLabel}</span>
              <select onChange={(event) => setLocation(event.target.value)} value={location}>
                <option value="">{content.hero.locationAll}</option>
                {locationOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="companies-field">
              <span>{content.hero.workModeLabel}</span>
              <select onChange={(event) => setWorkMode(event.target.value)} value={workMode}>
                <option value="">{content.hero.workModeAll}</option>
                {Object.entries(jobLabels.workingType).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            className="companies-reset-button"
            disabled={!hasActiveFilters && sort === 'mostJobs'}
            onClick={resetFilters}
            type="button"
          >
            <RotateCcw aria-hidden="true" />
            {content.hero.reset}
          </button>
        </form>
      </section>

      <section className="companies-directory">
        <div className="companies-section-heading">
          <div>
            <h2>{content.sections.directoryTitle}</h2>
            <p>{content.sections.directoryDescription}</p>
          </div>

          <div className="companies-sort-tabs" aria-label={content.sections.directoryTitle}>
            {SORT_OPTIONS.map((option) => (
              <button
                className={sort === option ? 'is-active' : ''}
                key={option}
                onClick={() => setSort(option)}
                type="button"
              >
                {content.sort[option]}
              </button>
            ))}
          </div>
        </div>

        {visibleCompanies.length ? (
          <div className="companies-grid">
            {visibleCompanies.map((company) => (
              <CompanyCard
                company={company}
                content={content}
                jobLabels={jobLabels}
                key={company.companyId}
                locale={locale}
              />
            ))}
          </div>
        ) : (
          <section className="companies-empty">
            <Building2 aria-hidden="true" />
            <h2>{content.states.emptyTitle}</h2>
            <p>{content.states.emptyDescription}</p>
            <button onClick={resetFilters} type="button">
              {content.hero.reset}
            </button>
          </section>
        )}
      </section>

      {latestJobs.length ? (
        <section className="companies-latest-panel">
          <div className="companies-section-heading">
            <div>
              <h2>{content.sections.latestJobsTitle}</h2>
              <p>{content.sections.latestJobsDescription}</p>
            </div>
          </div>

          <div className="companies-latest-list">
            {latestJobs.map((job) => (
              <a className="companies-latest-job" href={createJobDetailHrefById(job.id)} key={job.id}>
                <span>{job.companyName ?? '-'}</span>
                <strong>{job.title}</strong>
                <small>{formatPostedAt(job.publishedAt, locale, jobLabels)}</small>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

type CompanyStatProps = {
  icon: ReactNode
  label: string
  value: string
}

function CompanyStat({ icon, label, value }: CompanyStatProps) {
  return (
    <div className="companies-stat">
      <span>{icon}</span>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  )
}

type CompanyCardProps = {
  company: CompanyDirectoryItem
  content: ReturnType<typeof useTranslations>['pages']['companies']
  jobLabels: ReturnType<typeof useTranslations>['common']['job']
  locale: string
}

function CompanyCard({ company, content, jobLabels, locale }: CompanyCardProps) {
  const visibleLocations = company.locations.slice(0, 2)
  const visibleWorkModes = company.workModes.slice(0, 2).map((mode) => jobLabels.workingType[mode])
  const visibleJobs = company.jobs.slice(0, 3)
  const companyHref = createCompanyDetailHrefById(company.companyId)
  const companyJobsHref = createCompanyJobsHref(company)

  return (
    <article className="company-directory-card">
      <div className="company-card-topline">
        <CompanyLogoMark
          alt={`${company.name} logo`}
          className="company-directory-logo"
          fallbackText={initials(company.name)}
          src={company.logoUrl}
          tone={pickTone(company.companyId)}
        />
        <span>{content.card.verified}</span>
      </div>

      <div className="company-card-copy">
        <h3>
          <a href={companyHref}>{company.name}</a>
        </h3>
        <p>
          {company.activeJobCount} {content.card.openRoles}
        </p>
      </div>

      {company.skills.length ? (
        <div className="company-skill-row" aria-label={content.card.rolesPreview}>
          {company.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      ) : null}

      <dl className="company-card-meta">
        <div>
          <dt>{content.card.locations}</dt>
          <dd>{visibleLocations.length ? visibleLocations.join(', ') : content.card.noLocation}</dd>
        </div>
        <div>
          <dt>{content.card.workModes}</dt>
          <dd>{visibleWorkModes.length ? visibleWorkModes.join(', ') : content.card.noLocation}</dd>
        </div>
        <div>
          <dt>{content.card.latestHiring}</dt>
          <dd>{formatAbsoluteDate(company.latestPublishedAt, locale, content.card.noJobs)}</dd>
        </div>
      </dl>

      <div className="company-card-jobs">
        <span>{content.card.rolesPreview}</span>
        {visibleJobs.length ? (
          visibleJobs.map((job) => (
            <a href={createJobDetailHrefById(job.id)} key={job.id}>
              {job.title}
            </a>
          ))
        ) : (
          <p>{content.card.noJobs}</p>
        )}
      </div>

      <div className="company-card-actions">
        <a href={companyHref}>
          {content.actions.viewCompany}
          <ExternalLink aria-hidden="true" />
        </a>
        <a href={companyJobsHref}>{content.actions.viewJobs}</a>
      </div>
    </article>
  )
}

export default CompaniesPage
