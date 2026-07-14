import type { HomeJobItem, JobDetailTranslations } from '../../../i18n/types'

export type JobDetailSectionData = {
  body?: string
  items?: ReadonlyArray<string>
  title: string
}

function formatJobText(template: string, job: HomeJobItem) {
  const replacements = {
    company: job.company,
    field: job.field,
    location: job.location,
    salary: job.salary,
    tags: job.tags.join(', '),
    title: job.title,
    workMode: job.workMode,
  }

  return Object.entries(replacements).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template,
  )
}

function formatItems(items: ReadonlyArray<string>, job: HomeJobItem) {
  return items.map((item) => formatJobText(item, job))
}

export function getJobDetailSections(job: HomeJobItem, content: JobDetailTranslations['sections']) {
  return [
    {
      title: content.overview.title,
      body: formatJobText(content.overview.body, job),
    },
    {
      title: content.responsibilities.title,
      items: formatItems(content.responsibilities.items, job),
    },
    {
      title: content.requirements.title,
      items: formatItems(content.requirements.items, job),
    },
    {
      title: content.benefits.title,
      items: formatItems(content.benefits.items, job),
    },
  ] satisfies ReadonlyArray<JobDetailSectionData>
}
