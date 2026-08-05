import { Controller } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { RecruiterVerificationTranslations } from '../../../i18n/types'
import type { CompanyResponse } from '../../../types/company.types'
import { Input } from '../../_components'
import type { CompanyLegalFormValues } from '../types'

type CompanyLegalSectionProps = {
  company: CompanyResponse | null
  control: Control<CompanyLegalFormValues>
  disabled: boolean
  logoError?: string
  logoFile: File | null
  logoPreview: string
  onLogoChange: (file: File | null) => void
  translations: RecruiterVerificationTranslations['legal']
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'CO'
}

export function CompanyLegalSection({
  company,
  control,
  disabled,
  logoError,
  logoFile,
  logoPreview,
  onLogoChange,
  translations,
}: CompanyLegalSectionProps) {
  return (
    <section className="verification-section" id="verification-legal">
      <div className="verification-section__heading">
        <span aria-hidden="true">01</span>
        <div>
          <h2>{translations.title}</h2>
          <p>{translations.description}</p>
        </div>
      </div>

      {company?.status === 'APPROVED' ? (
        <p className="verification-inline-note verification-inline-note--warning">{translations.approvedWarning}</p>
      ) : null}
      {disabled ? (
        <p className="verification-inline-note verification-inline-note--locked">{translations.suspendedHint}</p>
      ) : null}

      <div className="verification-logo-field">
        <div className="verification-logo-field__preview">
          {logoPreview ? (
            <img alt="" height="72" src={logoPreview} width="72" />
          ) : (
            <span>{getInitials(company?.name ?? '')}</span>
          )}
        </div>
        <div className="verification-logo-field__copy">
          <strong>{translations.logoTitle}</strong>
          <p>{translations.logoDescription}</p>
          <div className="verification-logo-field__actions">
            <label className={`verification-file-action${disabled ? ' is-disabled' : ''}`}>
              <span>{logoPreview ? translations.logoReplace : translations.logoAction}</span>
              <input
                accept="image/jpeg,image/png,image/webp"
                disabled={disabled}
                onChange={(event) => onLogoChange(event.target.files?.[0] ?? null)}
                type="file"
              />
            </label>
            {logoFile ? <small>{translations.logoSelected}</small> : null}
          </div>
          <small className={logoError ? 'is-error' : ''} role={logoError ? 'alert' : undefined}>
            {logoError ?? translations.logoHint}
          </small>
        </div>
      </div>

      <div className="verification-form-grid">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              autoComplete="organization"
              disabled={disabled}
              error={fieldState.error?.message}
              label={translations.nameLabel}
              placeholder={translations.namePlaceholder}
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
              disabled={disabled}
              error={fieldState.error?.message}
              label={translations.taxCodeLabel}
              placeholder={translations.taxCodePlaceholder}
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
              disabled={disabled}
              error={fieldState.error?.message}
              label={translations.websiteLabel}
              placeholder={translations.websitePlaceholder}
              reserveMessageSpace
              type="url"
            />
          )}
        />
        <Controller
          control={control}
          name="address"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              autoComplete="street-address"
              disabled={disabled}
              error={fieldState.error?.message}
              label={translations.addressLabel}
              placeholder={translations.addressPlaceholder}
              reserveMessageSpace
            />
          )}
        />
      </div>

      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => (
          <label className="verification-textarea" htmlFor="verification-company-description">
            <span>{translations.descriptionLabel}</span>
            <textarea
              {...field}
              aria-describedby={fieldState.error ? 'verification-company-description-error' : undefined}
              aria-invalid={Boolean(fieldState.error)}
              disabled={disabled}
              id="verification-company-description"
              placeholder={translations.descriptionPlaceholder}
            />
            <small aria-hidden={!fieldState.error} className="min-h-[2lh]" id={fieldState.error ? 'verification-company-description-error' : undefined} role={fieldState.error ? 'alert' : undefined}>
              {fieldState.error?.message ?? ' '}
            </small>
          </label>
        )}
      />
    </section>
  )
}
