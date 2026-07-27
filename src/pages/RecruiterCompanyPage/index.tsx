import type { ChangeEvent, FormEvent } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../context'
import { useTranslations } from '../../i18n'
import { getApiErrorCode, getApiErrorEnvelope } from '../../lib/api/apiError'
import { companyService } from '../../services/company.service'
import type { RecruiterCompanyTranslations } from '../../i18n/types'
import type { CompanyResponse, UpdateCompanyPayload } from '../../types/company.types'
import { EmptyState, Loading } from '../_components'
import './recruiter-company.css'

type CompanyProfileFormValues = {
  address: string
  contactEmail: string
  culture: string
  description: string
  foundedYear: string
  heroImageUrl: string
  industry: string
  mission: string
  perksText: string
  size: string
  valuesText: string
  website: string
}

type CompanyProfileFormErrors = Partial<Record<keyof CompanyProfileFormValues, string>>

const EMPTY_FORM: CompanyProfileFormValues = {
  address: '',
  contactEmail: '',
  culture: '',
  description: '',
  foundedYear: '',
  heroImageUrl: '',
  industry: '',
  mission: '',
  perksText: '',
  size: '',
  valuesText: '',
  website: '',
}

const LOGO_MAX_SIZE = 5 * 1024 * 1024
const LOGO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function compact(value: string) {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function listFromText(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function isValidOptionalUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return true

  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isValidOptionalEmail(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
}

function yearFromText(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsedYear = Number.parseInt(trimmed, 10)
  return Number.isFinite(parsedYear) ? parsedYear : null
}

function companyToForm(company: CompanyResponse | null): CompanyProfileFormValues {
  if (!company) return EMPTY_FORM

  return {
    address: company.address ?? '',
    contactEmail: company.contactEmail ?? '',
    culture: company.culture ?? '',
    description: company.description ?? '',
    foundedYear: company.foundedYear ? String(company.foundedYear) : '',
    heroImageUrl: company.heroImageUrl ?? '',
    industry: company.industry ?? '',
    mission: company.mission ?? '',
    perksText: company.perks.join('\n'),
    size: company.size ?? '',
    valuesText: company.values.join('\n'),
    website: company.website ?? '',
  }
}

function formToPayload(form: CompanyProfileFormValues): UpdateCompanyPayload {
  return {
    address: compact(form.address),
    contactEmail: compact(form.contactEmail),
    culture: compact(form.culture),
    description: compact(form.description),
    foundedYear: yearFromText(form.foundedYear),
    heroImageUrl: compact(form.heroImageUrl),
    industry: compact(form.industry),
    mission: compact(form.mission),
    perks: listFromText(form.perksText),
    size: compact(form.size),
    values: listFromText(form.valuesText),
    website: compact(form.website),
  }
}

function getCompanyInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  return ((parts[0]?.[0] ?? 'N') + (parts[1]?.[0] ?? parts[0]?.[1] ?? 'H')).toUpperCase()
}

function getCompanyLogo(company: CompanyResponse) {
  return company.logoUrl ?? company.logo ?? ''
}

function isSamePayload(left: UpdateCompanyPayload, right: UpdateCompanyPayload) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function validateForm(
  form: CompanyProfileFormValues,
  validation: RecruiterCompanyTranslations['form']['validation'],
) {
  const errors: CompanyProfileFormErrors = {}
  const maxTextLength = 2000
  const maxShortLength = 255
  const maxFactLength = 120
  const maxListItems = 12
  const maxListItemLength = 90
  const currentYear = new Date().getFullYear()

  if (form.description.length > maxTextLength) errors.description = validation.descriptionMaxLength
  if (form.mission.length > maxTextLength) errors.mission = validation.missionMaxLength
  if (form.culture.length > maxTextLength) errors.culture = validation.cultureMaxLength
  if (form.industry.length > maxFactLength) errors.industry = validation.industryMaxLength
  if (form.size.length > maxFactLength) errors.size = validation.sizeMaxLength
  const foundedYear = form.foundedYear.trim()
  if (
    foundedYear
    && (!/^\d{4}$/.test(foundedYear)
      || Number.parseInt(foundedYear, 10) < 1800
      || Number.parseInt(foundedYear, 10) > currentYear)
  ) {
    errors.foundedYear = validation.foundedYearInvalid
  }
  if (form.address.length > 500) errors.address = validation.addressMaxLength
  if (form.contactEmail.length > maxShortLength) errors.contactEmail = validation.contactEmailMaxLength
  if (!isValidOptionalEmail(form.contactEmail)) errors.contactEmail = validation.contactEmailInvalid
  if (form.website.length > maxShortLength) errors.website = validation.websiteMaxLength
  if (!isValidOptionalUrl(form.website)) errors.website = validation.websiteInvalid
  if (form.heroImageUrl.length > 500) errors.heroImageUrl = validation.heroImageUrlMaxLength
  if (!isValidOptionalUrl(form.heroImageUrl)) errors.heroImageUrl = validation.heroImageUrlInvalid

  const values = listFromText(form.valuesText)
  const perks = listFromText(form.perksText)
  if (values.length > maxListItems) errors.valuesText = validation.valuesMaxItems
  if (values.some((item) => item.length > maxListItemLength)) errors.valuesText = validation.valuesItemMaxLength
  if (perks.length > maxListItems) errors.perksText = validation.perksMaxItems
  if (perks.some((item) => item.length > maxListItemLength)) errors.perksText = validation.perksItemMaxLength

  return errors
}

type FieldProps = {
  disabled?: boolean
  error?: string
  helper: string
  id: keyof CompanyProfileFormValues
  inputMode?: 'decimal' | 'email' | 'numeric' | 'search' | 'tel' | 'text' | 'url'
  label: string
  max?: number
  min?: number
  multiline?: boolean
  onChange: (id: keyof CompanyProfileFormValues, value: string) => void
  placeholder: string
  type?: string
  value: string
}

function ProfileField({
  disabled = false,
  error,
  helper,
  id,
  inputMode,
  label,
  max,
  min,
  multiline = false,
  onChange,
  placeholder,
  type = 'text',
  value,
}: FieldProps) {
  const helperId = `${id}-helper`
  const controlProps = {
    'aria-describedby': helperId,
    'aria-invalid': error ? true : undefined,
    className: multiline ? 'recruiter-company-field__control is-textarea' : 'recruiter-company-field__control',
    disabled,
    id,
    name: id,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(id, event.target.value),
    placeholder,
    value,
  }

  return (
    <label className="recruiter-company-field" htmlFor={id}>
      <span>{label}</span>
      {multiline ? (
        <textarea {...controlProps} rows={5} />
      ) : (
        <input {...controlProps} inputMode={inputMode} max={max} min={min} type={type} />
      )}
      <small className={error ? 'is-error' : undefined} id={helperId}>
        {error ?? helper}
      </small>
    </label>
  )
}

export function RecruiterCompanyPage() {
  const { refreshUser, user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const nextPath = searchParams.get('next')
  const { pages } = useTranslations()
  const content = pages.recruiterCompany
  const [company, setCompany] = useState<CompanyResponse | null>(null)
  const [form, setForm] = useState<CompanyProfileFormValues>(EMPTY_FORM)
  const [errors, setErrors] = useState<CompanyProfileFormErrors>({})
  const [logoError, setLogoError] = useState<string>()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string>()
  const [saveError, setSaveError] = useState<string>()
  const [saveSuccess, setSaveSuccess] = useState<string>()
  const [isSaving, setSaving] = useState(false)
  const [isReviewOpen, setReviewOpen] = useState(false)
  const reviewCloseButtonRef = useRef<HTMLButtonElement | null>(null)

  const loadCompany = useCallback(async () => {
    setLoading(true)
    setLoadError(undefined)

    try {
      const nextCompany = await companyService.getMyCompany()
      setCompany(nextCompany)
      setForm(companyToForm(nextCompany))
      setErrors({})
      setLogoError(undefined)
      setLogoFile(null)
      setSaveError(undefined)
      setSaveSuccess(undefined)
    } catch (error) {
      if (getApiErrorCode(error) === 'COMPANY.NOT_FOUND') {
        setCompany(null)
        setLogoError(undefined)
        setLogoFile(null)
        return
      }
      setLoadError(getApiErrorEnvelope(error)?.error.message ?? content.states.errorDescription)
    } finally {
      setLoading(false)
    }
  }, [content.states.errorDescription])

  useEffect(() => {
    void loadCompany()
  }, [loadCompany])

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(company ? getCompanyLogo(company) : '')
      return
    }

    const objectUrl = URL.createObjectURL(logoFile)
    setLogoPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [company, logoFile])

  useEffect(() => {
    if (!isReviewOpen) return undefined

    const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null

    reviewCloseButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setReviewOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      activeElement?.focus()
    }
  }, [isReviewOpen])

  const currentPayload = useMemo(() => formToPayload(form), [form])
  const savedPayload = useMemo(() => formToPayload(companyToForm(company)), [company])
  const isDirty = company ? !isSamePayload(currentPayload, savedPayload) : false
  const isReadOnly = company?.status === 'SUSPENDED'
  const hasUnsavedChanges = isDirty || Boolean(logoFile)
  const logo = logoPreview || (company ? getCompanyLogo(company) : '')
  const values = listFromText(form.valuesText)
  const perks = listFromText(form.perksText)
  const reviewContactFacts = [
    {
      label: content.review.websiteLabel,
      value: form.website.trim() || content.review.websiteFallback,
    },
    {
      label: content.review.contactEmailLabel,
      value: form.contactEmail.trim() || content.review.contactEmailFallback,
    },
    {
      label: content.review.addressLabel,
      value: form.address.trim() || content.review.addressFallback,
    },
  ]
  const previewFacts = [
    {
      label: content.preview.industryLabel,
      value: form.industry.trim() || content.preview.industryFallback,
    },
    {
      label: content.preview.sizeLabel,
      value: form.size.trim() || content.preview.sizeFallback,
    },
    {
      label: content.preview.foundedYearLabel,
      value: form.foundedYear.trim() || content.preview.foundedYearFallback,
    },
  ]

  function updateForm(field: keyof CompanyProfileFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      const { [field]: _fieldError, ...nextErrors } = current
      return nextErrors
    })
    setSaveError(undefined)
    setSaveSuccess(undefined)
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    setLogoError(undefined)
    setSaveError(undefined)
    setSaveSuccess(undefined)

    if (!file) return

    if (!LOGO_TYPES.has(file.type)) {
      setLogoFile(null)
      setLogoError(content.form.logoInvalidType)
      event.currentTarget.value = ''
      return
    }

    if (file.size > LOGO_MAX_SIZE) {
      setLogoFile(null)
      setLogoError(content.form.logoTooLarge)
      event.currentTarget.value = ''
      return
    }

    setLogoFile(file)
    event.currentTarget.value = ''
  }

  function resetForm() {
    setForm(companyToForm(company))
    setErrors({})
    setLogoError(undefined)
    setLogoFile(null)
    setSaveError(undefined)
    setSaveSuccess(undefined)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!company || isReadOnly) return

    const nextErrors = validateForm(form, content.form.validation)
    const selectedLogoFile = logoFile
    setErrors(nextErrors)
    setSaveError(undefined)
    setSaveSuccess(undefined)

    if (Object.keys(nextErrors).length > 0) return
    if (!isDirty && !selectedLogoFile) {
      setSaveSuccess(content.form.noChanges)
      return
    }

    setSaving(true)
    try {
      let updatedCompany = company
      if (isDirty) {
        updatedCompany = await companyService.updateCompany(company.id, currentPayload)
        setCompany(updatedCompany)
        setForm(companyToForm(updatedCompany))
      }

      if (selectedLogoFile) {
        updatedCompany = await companyService.uploadLogo(updatedCompany.id, selectedLogoFile)
        setCompany(updatedCompany)
        setForm(companyToForm(updatedCompany))
        setLogoFile(null)
        setLogoError(undefined)
        void refreshUser()
      }

      setCompany(updatedCompany)
      setForm(companyToForm(updatedCompany))
      setSaveSuccess(content.form.saveSuccess)
      if (user) {
        await queryClient.invalidateQueries({
          queryKey: ['company', 'me', user.id],
        })
      }
    } catch (error) {
      setSaveError(getApiErrorEnvelope(error)?.error.message ?? content.form.saveError)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="recruiter-company-page">
        <section className="recruiter-company-state">
          <Loading label={content.states.loading} />
        </section>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="recruiter-company-page">
        <section className="recruiter-company-state">
          <EmptyState description={loadError} title={content.states.errorTitle} />
          <button className="recruiter-company-action" type="button" onClick={() => void loadCompany()}>
            {content.states.retry}
          </button>
        </section>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="recruiter-company-page">
        <section className="recruiter-company-empty">
          <span>{content.states.noCompanyKicker}</span>
          <h1>{content.states.noCompanyTitle}</h1>
          <p>{content.states.noCompanyDescription}</p>
          <Link className="recruiter-company-action" to="/recruiter/verification">
            {content.states.noCompanyAction}
          </Link>
        </section>
      </div>
    )
  }

  return (
    <div className="recruiter-company-page">
      {nextPath ? (
        <aside className="recruiter-company-next-banner" role="status">
          <h2>{content.nextBanner.title}</h2>
          <p>{content.nextBanner.description}</p>
          <Link className="recruiter-company-next-banner__action" to={nextPath}>
            {content.nextBanner.action}
          </Link>
        </aside>
      ) : null}
      <header className="recruiter-company-hero">
        <div className="recruiter-company-hero__copy">
          <span>{content.hero.kicker}</span>
          <h1>{content.pageTitle}</h1>
          <p>{content.pageSubtitle}</p>
        </div>
        <div className="recruiter-company-hero__meta" aria-label={content.hero.companyLabel}>
          <div className="recruiter-company-logo" aria-hidden="true">
            {logo ? <img alt="" src={logo} /> : <span>{getCompanyInitials(company.name)}</span>}
          </div>
          <div>
            <strong>{company.name}</strong>
            <span>{content.statuses[company.status]}</span>
          </div>
        </div>
      </header>

      <main className="recruiter-company-workspace">
        <form className="recruiter-company-form" onSubmit={(event) => void handleSubmit(event)}>
          <section className="recruiter-company-panel">
            <div className="recruiter-company-panel__header">
              <h2>{content.form.storyTitle}</h2>
              <p>{content.form.storyDescription}</p>
            </div>

            <div className="recruiter-company-form__grid">
              <ProfileField
                disabled={isReadOnly}
                error={errors.description}
                helper={content.form.descriptionHint}
                id="description"
                label={content.form.descriptionLabel}
                multiline
                onChange={updateForm}
                placeholder={content.form.descriptionPlaceholder}
                value={form.description}
              />
              <ProfileField
                disabled={isReadOnly}
                error={errors.mission}
                helper={content.form.missionHint}
                id="mission"
                label={content.form.missionLabel}
                multiline
                onChange={updateForm}
                placeholder={content.form.missionPlaceholder}
                value={form.mission}
              />
              <ProfileField
                disabled={isReadOnly}
                error={errors.culture}
                helper={content.form.cultureHint}
                id="culture"
                label={content.form.cultureLabel}
                multiline
                onChange={updateForm}
                placeholder={content.form.culturePlaceholder}
                value={form.culture}
              />
            </div>
          </section>

          <section className="recruiter-company-panel">
            <div className="recruiter-company-panel__header">
              <h2>{content.form.highlightsTitle}</h2>
              <p>{content.form.highlightsDescription}</p>
            </div>

            <div className="recruiter-company-form__grid recruiter-company-form__grid--two">
              <ProfileField
                disabled={isReadOnly}
                error={errors.valuesText}
                helper={content.form.valuesHint}
                id="valuesText"
                label={content.form.valuesLabel}
                multiline
                onChange={updateForm}
                placeholder={content.form.valuesPlaceholder}
                value={form.valuesText}
              />
              <ProfileField
                disabled={isReadOnly}
                error={errors.perksText}
                helper={content.form.perksHint}
                id="perksText"
                label={content.form.perksLabel}
                multiline
                onChange={updateForm}
                placeholder={content.form.perksPlaceholder}
                value={form.perksText}
              />
            </div>
          </section>

          <section className="recruiter-company-panel">
            <div className="recruiter-company-panel__header">
              <h2>{content.form.factsTitle}</h2>
              <p>{content.form.factsDescription}</p>
            </div>

            <div className="recruiter-company-form__grid recruiter-company-form__grid--three">
              <ProfileField
                disabled={isReadOnly}
                error={errors.industry}
                helper={content.form.industryHint}
                id="industry"
                label={content.form.industryLabel}
                onChange={updateForm}
                placeholder={content.form.industryPlaceholder}
                value={form.industry}
              />
              <ProfileField
                disabled={isReadOnly}
                error={errors.size}
                helper={content.form.sizeHint}
                id="size"
                label={content.form.sizeLabel}
                onChange={updateForm}
                placeholder={content.form.sizePlaceholder}
                value={form.size}
              />
              <ProfileField
                disabled={isReadOnly}
                error={errors.foundedYear}
                helper={content.form.foundedYearHint}
                id="foundedYear"
                inputMode="numeric"
                label={content.form.foundedYearLabel}
                max={new Date().getFullYear()}
                min={1800}
                onChange={updateForm}
                placeholder={content.form.foundedYearPlaceholder}
                type="number"
                value={form.foundedYear}
              />
            </div>
          </section>

          <section className="recruiter-company-panel">
            <div className="recruiter-company-panel__header">
              <h2>{content.form.contactTitle}</h2>
              <p>{content.form.contactDescription}</p>
            </div>

            <div className="recruiter-company-form__grid recruiter-company-form__grid--two">
              <div className={`recruiter-company-logo-field${logoError ? ' has-error' : ''}`}>
                <div className="recruiter-company-logo-field__preview" aria-hidden="true">
                  {logo ? <img alt="" src={logo} /> : <span>{getCompanyInitials(company.name)}</span>}
                </div>
                <div className="recruiter-company-logo-field__copy">
                  <strong>{content.form.logoTitle}</strong>
                  <p>{content.form.logoDescription}</p>
                  <div className="recruiter-company-logo-field__actions">
                    <label
                      aria-disabled={isReadOnly}
                      className={`recruiter-company-file-action${isReadOnly ? ' is-disabled' : ''}`}
                    >
                      <span>{logo ? content.form.logoReplace : content.form.logoAction}</span>
                      <input
                        accept="image/jpeg,image/png,image/webp"
                        aria-describedby="company-logo-helper"
                        aria-invalid={logoError ? true : undefined}
                        disabled={isReadOnly}
                        type="file"
                        onChange={handleLogoChange}
                      />
                    </label>
                    {logoFile ? <small>{content.form.logoSelected}</small> : null}
                  </div>
                  <small className={logoError ? 'is-error' : undefined} id="company-logo-helper" role={logoError ? 'alert' : undefined}>
                    {logoError ?? content.form.logoHint}
                  </small>
                </div>
              </div>
              <ProfileField
                disabled={isReadOnly}
                error={errors.heroImageUrl}
                helper={content.form.heroImageUrlHint}
                id="heroImageUrl"
                label={content.form.heroImageUrlLabel}
                onChange={updateForm}
                placeholder={content.form.heroImageUrlPlaceholder}
                value={form.heroImageUrl}
              />
              <ProfileField
                disabled={isReadOnly}
                error={errors.website}
                helper={content.form.websiteHint}
                id="website"
                label={content.form.websiteLabel}
                onChange={updateForm}
                placeholder={content.form.websitePlaceholder}
                value={form.website}
              />
              <ProfileField
                disabled={isReadOnly}
                error={errors.contactEmail}
                helper={content.form.contactEmailHint}
                id="contactEmail"
                label={content.form.contactEmailLabel}
                onChange={updateForm}
                placeholder={content.form.contactEmailPlaceholder}
                value={form.contactEmail}
              />
              <ProfileField
                disabled={isReadOnly}
                error={errors.address}
                helper={content.form.addressHint}
                id="address"
                label={content.form.addressLabel}
                onChange={updateForm}
                placeholder={content.form.addressPlaceholder}
                value={form.address}
              />
            </div>
          </section>

          {isReadOnly ? <p className="recruiter-company-feedback is-warning">{content.form.readOnlyHint}</p> : null}
          {saveError ? <p className="recruiter-company-feedback is-error">{saveError}</p> : null}
          {saveSuccess ? <p className="recruiter-company-feedback is-success">{saveSuccess}</p> : null}

          <div className="recruiter-company-actions">
            <button className="recruiter-company-action recruiter-company-action--primary" disabled={isSaving || isReadOnly} type="submit">
              {isSaving ? content.form.saving : content.form.save}
            </button>
            <button
              className="recruiter-company-action recruiter-company-action--secondary"
              disabled={!hasUnsavedChanges || isSaving}
              type="button"
              onClick={resetForm}
            >
              {content.form.reset}
            </button>
          </div>
        </form>

        <aside className="recruiter-company-panel recruiter-company-preview-panel" aria-labelledby="company-preview-title">
          <div className="recruiter-company-panel__header">
            <h2 id="company-preview-title">{content.preview.title}</h2>
            <p>{content.preview.description}</p>
          </div>

          <div className="company-profile-preview">
            <div className="company-profile-preview__media">
              {form.heroImageUrl.trim() ? <img alt="" src={form.heroImageUrl.trim()} /> : <span>{content.preview.heroImageFallback}</span>}
            </div>
            <div className="company-profile-preview__hero">
              <div className="company-profile-preview__logo">
                {logo ? <img alt="" src={logo} /> : <span>{getCompanyInitials(company.name)}</span>}
              </div>
              <div>
                <strong>{company.name}</strong>
                <span>{form.industry.trim() || content.preview.industryFallback}</span>
              </div>
            </div>

            <dl className="company-profile-preview__facts" aria-label={content.preview.factsLabel}>
              {previewFacts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>

            <section className="company-profile-preview__section">
              <span>{content.preview.aboutLabel}</span>
              <p>{form.description.trim() || content.preview.emptyDescription}</p>
            </section>

            <section className="company-profile-preview__section">
              <span>{content.preview.missionLabel}</span>
              <p>{form.mission.trim() || content.preview.emptyMission}</p>
            </section>

            <section className="company-profile-preview__section">
              <span>{content.preview.cultureLabel}</span>
              <p>{form.culture.trim() || content.preview.emptyCulture}</p>
            </section>

            <section className="company-profile-preview__section">
              <span>{content.preview.valuesLabel}</span>
              <div className="company-profile-preview__chips">
                {(values.length > 0 ? values : [content.preview.emptyValues]).map((value, index) => (
                  <em key={`${value}-${index}`}>{value}</em>
                ))}
              </div>
            </section>

            <section className="company-profile-preview__section">
              <span>{content.preview.perksLabel}</span>
              <div className="company-profile-preview__chips">
                {(perks.length > 0 ? perks : [content.preview.emptyPerks]).map((perk, index) => (
                  <em key={`${perk}-${index}`}>{perk}</em>
                ))}
              </div>
            </section>

            <section className="company-profile-preview__section">
              <span>{content.preview.contactLabel}</span>
              <p>{form.contactEmail.trim() || form.website.trim() || form.address.trim() || content.preview.emptyContact}</p>
            </section>
          </div>

          <div className="recruiter-company-public">
            <button
              className="recruiter-company-public__link"
              type="button"
              onClick={() => setReviewOpen(true)}
            >
              {content.preview.openReview}
            </button>
            <small>{content.preview.reviewHint}</small>
          </div>
        </aside>
      </main>

      {isReviewOpen ? (
        <div
          className="recruiter-company-review-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setReviewOpen(false)
          }}
        >
          <article className="company-review" aria-labelledby="company-review-title" aria-modal="true" role="dialog">
            <header className="company-review__topbar">
              <div>
                <span>{content.review.kicker}</span>
                <h2 id="company-review-title">{content.review.title}</h2>
                <p>{content.review.description}</p>
              </div>
              <button
                ref={reviewCloseButtonRef}
                className="company-review__close"
                type="button"
                aria-label={content.review.closeLabel}
                onClick={() => setReviewOpen(false)}
              >
                ×
              </button>
            </header>

            <div className="company-review__body">
              <section className="company-review__hero">
                <div className="company-review__hero-copy">
                  <div className="company-review__brand">
                    <div className="company-review__logo" aria-hidden="true">
                      {logo ? <img alt="" src={logo} /> : <span>{getCompanyInitials(company.name)}</span>}
                    </div>
                    <div>
                      <span>{form.industry.trim() || content.preview.industryFallback}</span>
                      <h3>{company.name}</h3>
                    </div>
                  </div>
                  <p>{form.description.trim() || content.review.emptyDescription}</p>
                  <dl className="company-review__facts" aria-label={content.review.factsLabel}>
                    {previewFacts.map((fact) => (
                      <div key={fact.label}>
                        <dt>{fact.label}</dt>
                        <dd>{fact.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="company-review__media">
                  {form.heroImageUrl.trim() ? (
                    <img alt="" src={form.heroImageUrl.trim()} />
                  ) : (
                    <span>{content.review.heroImageFallback}</span>
                  )}
                </div>
              </section>

              <section className="company-review__section">
                <h3>{content.review.missionLabel}</h3>
                <p>{form.mission.trim() || content.review.emptyMission}</p>
              </section>

              <section className="company-review__section">
                <h3>{content.review.cultureLabel}</h3>
                <p>{form.culture.trim() || content.review.emptyCulture}</p>
              </section>

              <div className="company-review__split">
                <section className="company-review__section">
                  <h3>{content.review.valuesLabel}</h3>
                  <div className="company-review__chips">
                    {(values.length > 0 ? values : [content.review.emptyValues]).map((value, index) => (
                      <span key={`${value}-${index}`}>{value}</span>
                    ))}
                  </div>
                </section>

                <section className="company-review__section">
                  <h3>{content.review.perksLabel}</h3>
                  <div className="company-review__chips">
                    {(perks.length > 0 ? perks : [content.review.emptyPerks]).map((perk, index) => (
                      <span key={`${perk}-${index}`}>{perk}</span>
                    ))}
                  </div>
                </section>
              </div>

              <section className="company-review__section company-review__section--contact">
                <h3>{content.review.contactLabel}</h3>
                <dl className="company-review__contact-list">
                  {reviewContactFacts.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  )
}

export default RecruiterCompanyPage
