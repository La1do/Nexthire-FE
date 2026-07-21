import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLocale, useTranslations } from '../../i18n'
import { getApiErrorEnvelope } from '../../lib/api/apiError'
import { categoryService } from '../../services/category.service'
import { companyService } from '../../services/company.service'
import { jobService } from '../../services/job.service'
import type { CompanyResponse, CompanyStatus } from '../../types/company.types'
import type { PublicCategory, RecruiterJobResponse } from '../../types/job.types'
import { Button } from '../_components'
import { JobPostCompanyGate } from './components/JobPostCompanyGate'
import { JobPostForm } from './components/JobPostForm'
import { JobPostPreview } from './components/JobPostPreview'
import type {
  JobPostAction,
  JobPostFieldErrors,
  JobPostFormValues,
  JobPostSubmitResult,
} from './types'
import { createJobPostPayload } from './utils/jobPostPayload'
import { validateJobPostForm } from './utils/jobPostValidation'

type CompanyGateStatus = CompanyStatus | 'NO_COMPANY'

function createInitialJobPostValues(): JobPostFormValues {
  return {
    title: '',
    categoryId: '',
    employmentType: '',
    workingType: '',
    experienceLevel: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'VND',
    isSalaryVisible: true,
    deadline: '',
    numberOfOpenings: '',
    skills: [],
    skillInput: '',
    description: '',
    requirements: '',
    benefits: '',
  }
}

function formatDateInputValue(value: string | null) {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}

function mapJobToPostValues(job: RecruiterJobResponse): JobPostFormValues {
  return {
    title: job.title,
    categoryId: job.categoryId ?? '',
    employmentType: job.employmentType,
    workingType: job.workingType,
    experienceLevel: job.experienceLevel,
    location: job.location,
    salaryMin: job.salaryMin == null ? '' : String(job.salaryMin),
    salaryMax: job.salaryMax == null ? '' : String(job.salaryMax),
    salaryCurrency: job.salaryCurrency === 'USD' || job.salaryCurrency === 'JPY' ? job.salaryCurrency : 'VND',
    isSalaryVisible: job.isSalaryVisible,
    deadline: formatDateInputValue(job.deadline),
    numberOfOpenings: job.numberOfOpenings == null ? '' : String(job.numberOfOpenings),
    skills: job.skills,
    skillInput: '',
    description: job.description,
    requirements: job.requirements,
    benefits: job.benefits ?? '',
  }
}

function createPayloadKey(values: JobPostFormValues) {
  return JSON.stringify(createJobPostPayload(values))
}

function isCompanyNotFound(error: unknown) {
  const code = getApiErrorEnvelope(error)?.error.code
  return code?.includes('NOT_FOUND') ?? false
}

export function RecruiterJobCreatePage() {
  const { id: editJobId } = useParams()
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const content = pages.recruiterJobCreate
  const isEditMode = Boolean(editJobId)
  const [categories, setCategories] = useState<PublicCategory[]>([])
  const [categoryWarning, setCategoryWarning] = useState<string | undefined>(undefined)
  const [company, setCompany] = useState<CompanyResponse | null>(null)
  const [loadError, setLoadError] = useState<string | undefined>(undefined)
  const [isLoading, setLoading] = useState(true)
  const [values, setValues] = useState<JobPostFormValues>(() => createInitialJobPostValues())
  const [errors, setErrors] = useState<JobPostFieldErrors>({})
  const [submitError, setSubmitError] = useState<string | undefined>(undefined)
  const [submittingAction, setSubmittingAction] = useState<JobPostAction | undefined>(undefined)
  const [submitResult, setSubmitResult] = useState<JobPostSubmitResult | undefined>(undefined)
  const [draftJob, setDraftJob] = useState<RecruiterJobResponse | undefined>(undefined)
  const [draftPayloadKey, setDraftPayloadKey] = useState<string | undefined>(undefined)

  const loadPageData = useCallback(async () => {
    setLoading(true)
    setLoadError(undefined)
    setCategoryWarning(undefined)

    const [companyResult, categoriesResult] = await Promise.allSettled([
      companyService.getMyCompany(),
      categoryService.getCategories(),
    ])

    if (companyResult.status === 'fulfilled') {
      setCompany(companyResult.value)
    } else if (isCompanyNotFound(companyResult.reason)) {
      setCompany(null)
    } else {
      setLoadError(getApiErrorEnvelope(companyResult.reason)?.error.message ?? content.states.errorDescription)
    }

    if (categoriesResult.status === 'fulfilled') {
      setCategories(categoriesResult.value)
    } else {
      setCategories([])
      setCategoryWarning(content.states.categoryFallback)
    }

    if (editJobId) {
      try {
        const job = await jobService.getRecruiterJobById(editJobId)

        if (job.status !== 'DRAFT') {
          setLoadError(content.states.editDraftOnly)
        } else {
          const nextValues = mapJobToPostValues(job)
          setValues(nextValues)
          setDraftJob(job)
          setDraftPayloadKey(createPayloadKey(nextValues))
        }
      } catch (error) {
        setLoadError(getApiErrorEnvelope(error)?.error.message ?? content.states.editErrorDescription)
      }
    }

    setLoading(false)
  }, [
    content.states.categoryFallback,
    content.states.editDraftOnly,
    content.states.editErrorDescription,
    content.states.errorDescription,
    editJobId,
  ])

  useEffect(() => {
    void loadPageData()
  }, [loadPageData])

  const companyStatus: CompanyGateStatus = company?.status ?? 'NO_COMPANY'
  const companyName = company?.name ?? content.preview.labels.company

  const handleFieldChange = useCallback(
    <TField extends keyof JobPostFormValues>(field: TField, value: JobPostFormValues[TField]) => {
      setValues((currentValues) => ({
        ...currentValues,
        [field]: value,
      }))
      setErrors((currentErrors) => {
        if (!currentErrors[field]) {
          return currentErrors
        }

        const nextErrors = { ...currentErrors }
        delete nextErrors[field]
        return nextErrors
      })
      setSubmitError(undefined)
      setSubmitResult(undefined)
    },
    [],
  )

  const handleAddSkill = useCallback(() => {
    setValues((currentValues) => {
      const nextSkills = currentValues.skillInput
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean)
        .filter((skill) => !currentValues.skills.includes(skill))

      if (!nextSkills.length) {
        return {
          ...currentValues,
          skillInput: '',
        }
      }

      return {
        ...currentValues,
        skillInput: '',
        skills: [...currentValues.skills, ...nextSkills],
      }
    })
    setErrors((currentErrors) => {
      if (!currentErrors.skills) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      delete nextErrors.skills
      return nextErrors
    })
    setSubmitError(undefined)
    setSubmitResult(undefined)
  }, [])

  const handleRemoveSkill = useCallback((skill: string) => {
    setValues((currentValues) => ({
      ...currentValues,
      skills: currentValues.skills.filter((currentSkill) => currentSkill !== skill),
    }))
    setSubmitResult(undefined)
  }, [])

  const handleReset = useCallback(() => {
    if (isEditMode && draftJob) {
      const nextValues = mapJobToPostValues(draftJob)
      setValues(nextValues)
      setErrors({})
      setSubmitError(undefined)
      setSubmitResult(undefined)
      setDraftPayloadKey(createPayloadKey(nextValues))
      return
    }

    setValues(createInitialJobPostValues())
    setErrors({})
    setSubmitError(undefined)
    setSubmitResult(undefined)
    setDraftJob(undefined)
    setDraftPayloadKey(undefined)
  }, [draftJob, isEditMode])

  const handleSubmit = useCallback(
    async (action: JobPostAction) => {
      const nextErrors = validateJobPostForm(values, content.validation)

      if (Object.keys(nextErrors).length) {
        setErrors(nextErrors)
        setSubmitError(content.form.submitError)
        return
      }

      const payload = createJobPostPayload(values)
      const payloadKey = JSON.stringify(payload)

      setSubmittingAction(action)
      setSubmitError(undefined)

      try {
        let job = draftJob

        if (!job) {
          job = await jobService.createRecruiterJob(payload)
        } else if (draftPayloadKey !== payloadKey) {
          job = await jobService.updateRecruiterJob(job.id, payload)
        }

        setDraftJob(job)
        setDraftPayloadKey(payloadKey)

        if (action === 'submit') {
          job = await jobService.submitRecruiterJob(job.id)
          setDraftJob(job)
        }

        setSubmitResult({ action, job })
      } catch (error) {
        setSubmitError(getApiErrorEnvelope(error)?.error.message ?? content.form.submitError)
      } finally {
        setSubmittingAction(undefined)
      }
    },
    [content.form.submitError, content.validation, draftJob, draftPayloadKey, values],
  )

  if (loadError) {
    return (
      <div className="recruiter-job-create-page">
        <section className="job-post-state recruiter-panel">
          <h2>{content.states.errorTitle}</h2>
          <p>{loadError}</p>
          <Button onClick={() => void loadPageData()}>{content.states.retry}</Button>
        </section>
      </div>
    )
  }

  return (
    <div className="recruiter-job-create-page">
      <section className="job-post-page-header">
        <div>
          <p className="recruiter-eyebrow">{content.hero.eyebrow}</p>
          <h1>{isEditMode ? content.hero.editTitle : content.hero.title}</h1>
          <p>{isEditMode ? content.hero.editDescription : content.hero.description}</p>
        </div>
        <Link className="job-post-link-button" to={isEditMode && editJobId ? `/recruiter/jobs/${editJobId}` : '/recruiter'}>
          {isEditMode ? content.hero.backToDetail : content.hero.backAction}
        </Link>
      </section>

      <JobPostCompanyGate isLoading={isLoading} status={companyStatus} translations={content.gate}>
        {submitResult ? (
          <section className="job-post-success recruiter-panel">
            <span>{content.statusLabels[submitResult.job.status]}</span>
            <div>
              <h2>{submitResult.action === 'submit' ? content.form.successSubmit : content.form.successDraft}</h2>
              <p>{content.form.successDescription}</p>
            </div>
            <div>
              <Link className="job-post-link-button job-post-link-button--primary" to="/recruiter/jobs">
                {content.form.viewJobs}
              </Link>
              <Button onClick={handleReset} type="button" variant="secondary">
                {content.form.createAnother}
              </Button>
            </div>
          </section>
        ) : null}

        <div className="job-post-workspace">
          <JobPostForm
            categories={categories}
            categoryWarning={categoryWarning}
            errors={errors}
            onAddSkill={handleAddSkill}
            onChange={handleFieldChange}
            onRemoveSkill={handleRemoveSkill}
            onReset={handleReset}
            onSubmit={(action) => void handleSubmit(action)}
            submitError={submitError}
            submittingAction={submittingAction}
            translations={content}
            values={values}
          />
          <JobPostPreview
            categories={categories}
            companyName={companyName}
            emptySkillsLabel={content.form.fields.skills.empty}
            locale={locale}
            noCategoryLabel={content.form.options.noCategory}
            optionLabels={content.form.options}
            translations={content.preview}
            values={values}
          />
        </div>
      </JobPostCompanyGate>
    </div>
  )
}
