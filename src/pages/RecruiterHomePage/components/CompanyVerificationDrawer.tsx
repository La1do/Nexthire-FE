import { useEffect, useRef } from 'react'
import type { RecruiterHomeTranslations } from '../../../i18n/types'
import { Button, Input } from '../../_components'
import { useFormState } from '../../../hooks/useFormState'
import { validateCompanyVerificationForm } from '../utils/companyVerificationValidation'
import type { CompanyVerificationFormValues } from '../types'

type CompanyVerificationDrawerProps = {
  initialValues: CompanyVerificationFormValues
  onClose: () => void
  onSubmit: (values: CompanyVerificationFormValues) => void
  translations: RecruiterHomeTranslations['verification']
}

export function CompanyVerificationDrawer({
  initialValues,
  onClose,
  onSubmit,
  translations,
}: CompanyVerificationDrawerProps) {
  const drawerRef = useRef<HTMLDivElement | null>(null)
  const form = translations.form
  const { getFieldError, handleFieldChange, handleSubmit, setFieldTouched, setFieldValue, values } =
    useFormState<CompanyVerificationFormValues>({
      initialValues,
      onSubmit,
      validate: (formValues) => validateCompanyVerificationForm(formValues, form.validation),
    })

  useEffect(() => {
    const firstFocusable = drawerRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    firstFocusable?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleDocumentToggle = (id: string) => {
    const nextDocuments = values.documents.includes(id)
      ? values.documents.filter((documentId) => documentId !== id)
      : [...values.documents, id]

    setFieldValue('documents', nextDocuments)
  }

  const documentsError = getFieldError('documents')

  return (
    <div className="company-verification-backdrop" onMouseDown={onClose}>
      <div
        aria-labelledby="company-verification-title"
        aria-modal="true"
        className="company-verification-drawer"
        onMouseDown={(event) => event.stopPropagation()}
        ref={drawerRef}
        role="dialog"
      >
        <div className="company-verification-drawer__header">
          <div>
            <p className="recruiter-eyebrow">{translations.eyebrow}</p>
            <h2 id="company-verification-title">{form.title}</h2>
            <p>{form.description}</p>
          </div>
          <button aria-label={translations.actions.close} className="company-verification-drawer__close" onClick={onClose} type="button">
            <span aria-hidden="true">x</span>
          </button>
        </div>

        <form className="company-verification-form" noValidate onSubmit={handleSubmit}>
          <div className="company-verification-form__grid">
            <Input
              autoComplete="organization"
              error={getFieldError('name')}
              label={form.nameLabel}
              onBlur={() => setFieldTouched('name')}
              onChange={handleFieldChange('name')}
              placeholder={form.namePlaceholder}
              value={values.name}
            />
            <Input
              error={getFieldError('taxCode')}
              label={form.taxCodeLabel}
              onBlur={() => setFieldTouched('taxCode')}
              onChange={handleFieldChange('taxCode')}
              placeholder={form.taxCodePlaceholder}
              value={values.taxCode}
            />
            <Input
              autoComplete="url"
              error={getFieldError('website')}
              label={form.websiteLabel}
              onBlur={() => setFieldTouched('website')}
              onChange={handleFieldChange('website')}
              placeholder={form.websitePlaceholder}
              type="url"
              value={values.website}
            />
            <Input
              autoComplete="url"
              label={form.logoLabel}
              onChange={handleFieldChange('logo')}
              placeholder={form.logoPlaceholder}
              type="url"
              value={values.logo}
            />
          </div>

          <Input
            autoComplete="street-address"
            error={getFieldError('address')}
            label={form.addressLabel}
            onBlur={() => setFieldTouched('address')}
            onChange={handleFieldChange('address')}
            placeholder={form.addressPlaceholder}
            value={values.address}
          />

          <label className="company-verification-textarea" htmlFor="company-description">
            <span>{form.descriptionLabel}</span>
            <textarea
              aria-describedby={getFieldError('description') ? 'company-description-error' : undefined}
              aria-invalid={Boolean(getFieldError('description'))}
              id="company-description"
              onBlur={() => setFieldTouched('description')}
              onChange={(event) => setFieldValue('description', event.target.value)}
              placeholder={form.descriptionPlaceholder}
              value={values.description}
            />
            {getFieldError('description') ? (
              <small id="company-description-error" role="alert">
                {getFieldError('description')}
              </small>
            ) : null}
          </label>

          <fieldset className="company-document-options">
            <legend>{form.documentsTitle}</legend>
            <p>{form.documentsDescription}</p>
            <div>
              {form.documentOptions.map((option) => {
                const isSelected = values.documents.includes(option.id)

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`company-document-option${isSelected ? ' is-selected' : ''}`}
                    key={option.id}
                    onClick={() => handleDocumentToggle(option.id)}
                    type="button"
                  >
                    <span>
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                    <em>{isSelected ? form.selectedLabel : '+'}</em>
                  </button>
                )
              })}
            </div>
            {documentsError ? (
              <small className="company-document-options__error" role="alert">
                {documentsError}
              </small>
            ) : null}
          </fieldset>

          <div className="company-verification-form__actions">
            <Button onClick={onClose} variant="secondary">
              {translations.actions.cancel}
            </Button>
            <Button type="submit">{translations.actions.submit}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
