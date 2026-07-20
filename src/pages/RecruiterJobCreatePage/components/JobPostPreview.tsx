import type { Locale } from '../../../i18n'
import type { RecruiterJobCreateTranslations } from '../../../i18n/types'
import type { PublicCategory } from '../../../types/job.types'
import type { JobPostChecklist, JobPostFormValues } from '../types'
import { getJobPostChecklist } from '../utils/jobPostValidation'

type JobPostPreviewProps = {
  categories: ReadonlyArray<PublicCategory>
  companyName: string
  emptySkillsLabel: string
  noCategoryLabel: string
  locale: Locale
  optionLabels: RecruiterJobCreateTranslations['form']['options']
  translations: RecruiterJobCreateTranslations['preview']
  values: JobPostFormValues
}

function parseOptionalNumber(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
}

function formatDate(value: string, locale: Locale) {
  if (!value) {
    return null
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString(locale)
}

function createSalaryLabel(
  values: JobPostFormValues,
  translations: RecruiterJobCreateTranslations['preview'],
  locale: Locale,
) {
  if (!values.isSalaryVisible) {
    return translations.salaryHidden
  }

  const salaryMin = parseOptionalNumber(values.salaryMin)
  const salaryMax = parseOptionalNumber(values.salaryMax)

  if (salaryMin === null && salaryMax === null) {
    return translations.salaryNegotiable
  }

  if (salaryMin !== null && salaryMax !== null) {
    return `${formatNumber(salaryMin, locale)} - ${formatNumber(salaryMax, locale)} ${values.salaryCurrency}`
  }

  const salaryValue = salaryMin ?? salaryMax
  return salaryValue === null ? translations.salaryNegotiable : `${formatNumber(salaryValue, locale)} ${values.salaryCurrency}`
}

function createSummary(text: string) {
  const compactText = text.trim().replace(/\s+/g, ' ')
  return compactText.length > 148 ? `${compactText.slice(0, 145)}...` : compactText
}

function ChecklistRow({
  done,
  label,
}: {
  done: boolean
  label: string
}) {
  return (
    <li className={done ? 'is-done' : undefined}>
      <span aria-hidden="true" />
      <p>{label}</p>
    </li>
  )
}

function Checklist({
  checklist,
  translations,
}: {
  checklist: JobPostChecklist
  translations: RecruiterJobCreateTranslations['preview']
}) {
  return (
    <div className="job-post-checklist">
      <h3>{translations.checklistTitle}</h3>
      <ul>
        <ChecklistRow done={checklist.basics} label={translations.checklistItems.basics} />
        <ChecklistRow done={checklist.salary} label={translations.checklistItems.salary} />
        <ChecklistRow done={checklist.skills} label={translations.checklistItems.skills} />
        <ChecklistRow done={checklist.content} label={translations.checklistItems.content} />
        <ChecklistRow done={checklist.deadline} label={translations.checklistItems.deadline} />
      </ul>
    </div>
  )
}

export function JobPostPreview({
  categories,
  companyName,
  emptySkillsLabel,
  locale,
  noCategoryLabel,
  optionLabels,
  translations,
  values,
}: JobPostPreviewProps) {
  const checklist = getJobPostChecklist(values)
  const title = values.title.trim() || translations.emptyTitle
  const selectedCategory = categories.find((category) => category.id === values.categoryId)
  const deadline = formatDate(values.deadline, locale)
  const openings = parseOptionalNumber(values.numberOfOpenings)
  const hasContent = values.description.trim() || values.requirements.trim() || values.benefits.trim()

  return (
    <aside className="job-post-preview recruiter-panel" aria-label={translations.title}>
      <div className="recruiter-panel__header">
        <div>
          <h2>{translations.title}</h2>
          <p>{hasContent ? title : translations.emptyDescription}</p>
        </div>
      </div>

      <article className="job-post-preview-card">
        <div className="job-post-preview-card__header">
          <p>{translations.labels.company}</p>
          <strong>{companyName}</strong>
          <h3>{title}</h3>
        </div>

        <dl className="job-post-preview-meta">
          {values.location.trim() ? (
            <div>
              <dt>{translations.labels.location}</dt>
              <dd>{values.location.trim()}</dd>
            </div>
          ) : null}
          <div>
            <dt>{translations.labels.category}</dt>
            <dd>{selectedCategory?.name ?? noCategoryLabel}</dd>
          </div>
          <div>
            <dt>{translations.labels.salary}</dt>
            <dd>{createSalaryLabel(values, translations, locale)}</dd>
          </div>
          {openings ? (
            <div>
              <dt>{translations.labels.openings}</dt>
              <dd>{formatNumber(openings, locale)}</dd>
            </div>
          ) : null}
          <div>
            <dt>{translations.labels.deadline}</dt>
            <dd>{deadline ?? translations.noDeadline}</dd>
          </div>
          {values.employmentType ? (
            <div>
              <dt>{translations.labels.employmentType}</dt>
              <dd>{optionLabels.employmentTypes[values.employmentType]}</dd>
            </div>
          ) : null}
          {values.workingType ? (
            <div>
              <dt>{translations.labels.workingType}</dt>
              <dd>{optionLabels.workingTypes[values.workingType]}</dd>
            </div>
          ) : null}
          {values.experienceLevel ? (
            <div>
              <dt>{translations.labels.experienceLevel}</dt>
              <dd>{optionLabels.experienceLevels[values.experienceLevel]}</dd>
            </div>
          ) : null}
        </dl>

        <div className="job-post-preview-skills">
          <p>{translations.labels.skills}</p>
          {values.skills.length ? (
            <ul>
              {values.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          ) : (
            <span>{emptySkillsLabel}</span>
          )}
        </div>

        {values.description.trim() ? (
          <section className="job-post-preview-copy">
            <h4>{translations.labels.description}</h4>
            <p>{createSummary(values.description)}</p>
          </section>
        ) : null}
        {values.requirements.trim() ? (
          <section className="job-post-preview-copy">
            <h4>{translations.labels.requirements}</h4>
            <p>{createSummary(values.requirements)}</p>
          </section>
        ) : null}
        <section className="job-post-preview-copy">
          <h4>{translations.labels.benefits}</h4>
          <p>{values.benefits.trim() ? createSummary(values.benefits) : translations.noBenefits}</p>
        </section>
      </article>

      <Checklist checklist={checklist} translations={translations} />
    </aside>
  )
}
