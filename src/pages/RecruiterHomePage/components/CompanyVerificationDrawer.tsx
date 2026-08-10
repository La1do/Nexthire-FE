import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import type { RecruiterHomeTranslations } from '../../../i18n/types'
import { Button, Input } from '../../_components'
import { createCompanyVerificationSchema } from '../utils/companyVerificationValidation'
import type { CompanyVerificationFormValues } from '../types'

type CompanyVerificationDrawerProps = {
  initialValues: CompanyVerificationFormValues
  isSubmitting?: boolean
  onClose: () => void
  onSubmit: (values: CompanyVerificationFormValues) => void
  submitError?: string
  translations: RecruiterHomeTranslations['verification']
}

export function CompanyVerificationDrawer({
  initialValues,
  isSubmitting = false,
  onClose,
  onSubmit,
  submitError,
  translations,
}: CompanyVerificationDrawerProps) {
  const drawerRef = useRef<HTMLDivElement | null>(null)
  const hasMountedRef = useRef(false)
  const form = translations.form
  const schema = useMemo(
    () => createCompanyVerificationSchema(form.validation),
    [form.validation],
  )
  const {
    control,
    formState: { errors },
    handleSubmit,
    setValue,
    trigger,
  } = useForm<CompanyVerificationFormValues>({
    defaultValues: initialValues,
    mode: 'onBlur',
    resolver: zodResolver(schema),
  })
  const documents = useWatch({ control, name: 'documents' }) ?? []

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

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    void trigger()
  }, [schema, trigger])

  const handleDocumentToggle = (id: string) => {
    const nextDocuments = documents.includes(id)
      ? documents.filter((documentId) => documentId !== id)
      : [...documents, id]

    setValue('documents', nextDocuments, { shouldDirty: true, shouldValidate: true })
  }

  const documentsError = errors.documents?.message

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

        <form className="company-verification-form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <div className="company-verification-form__grid">
            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  autoComplete="organization"
                  error={fieldState.error?.message}
                  label={form.nameLabel}
                  placeholder={form.namePlaceholder}
                  reserveMessageSpace
                />
              )}
            />
            <Controller
              control={control}
              name="taxCode"
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  error={fieldState.error?.message}
                  label={form.taxCodeLabel}
                  placeholder={form.taxCodePlaceholder}
                  reserveMessageSpace
                />
              )}
            />
            <Controller
              control={control}
              name="website"
              render={({ field, fieldState }) => (
                <Input
                  {...field}
                  autoComplete="url"
                  error={fieldState.error?.message}
                  label={form.websiteLabel}
                  placeholder={form.websitePlaceholder}
                  reserveMessageSpace
                  type="url"
                />
              )}
            />
            <Controller
              control={control}
              name="logo"
              render={({ field }) => (
                <Input
                  {...field}
                  autoComplete="url"
                  label={form.logoLabel}
                  placeholder={form.logoPlaceholder}
                  reserveMessageSpace
                  type="url"
                />
              )}
            />
          </div>

          <Controller
            control={control}
            name="address"
            render={({ field, fieldState }) => (
              <Input
                {...field}
                autoComplete="street-address"
                error={fieldState.error?.message}
                label={form.addressLabel}
                placeholder={form.addressPlaceholder}
                reserveMessageSpace
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <label className="company-verification-textarea" htmlFor="company-description">
                <span>{form.descriptionLabel}</span>
                <textarea
                  {...field}
                  aria-describedby={fieldState.error ? 'company-description-error' : undefined}
                  aria-invalid={Boolean(fieldState.error)}
                  id="company-description"
                  placeholder={form.descriptionPlaceholder}
                />
                <small aria-hidden={!fieldState.error?.message} className="min-h-[2lh]" id={fieldState.error?.message ? 'company-description-error' : undefined} role={fieldState.error?.message ? 'alert' : undefined}>
                  {fieldState.error?.message ?? ' '}
                </small>
              </label>
            )}
          />

          <fieldset className="company-document-options">
            <legend>{form.documentsTitle}</legend>
            <p>{form.documentsDescription}</p>
            <div>
              {form.documentOptions.map((option) => {
                const isSelected = documents.includes(option.id)

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
            {submitError ? (
              <p className="company-verification-form__submit-error" role="alert">
                {submitError}
              </p>
            ) : null}
            <Button disabled={isSubmitting} onClick={onClose} variant="secondary">
              {translations.actions.cancel}
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? translations.actions.submitLoading : translations.actions.submit}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
