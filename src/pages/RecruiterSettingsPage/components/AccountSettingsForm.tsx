import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { ComponentPropsWithoutRef } from 'react'
import { z } from 'zod'
import { useToast } from '../../../context'
import type { RecruiterSettingsTranslations } from '../../../i18n/types'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import { authService } from '../../../services/auth.service'
import type { AuthProfile } from '../../../services/auth.service'
import { companyService } from '../../../services/company.service'
import type { CompanyResponse } from '../../../types/company.types'
import { Button } from '../../_components'

type AccountFormValues = {
  fullName: string
  phone: string
  contactEmail: string
}

type AccountSettingsFormProps = {
  company: CompanyResponse | null
  companyName?: string | null
  error?: string
  loading: boolean
  onRetry: () => void
  onSaved: (profile: AuthProfile, company: CompanyResponse | null) => void
  profile: AuthProfile | null
  translations: RecruiterSettingsTranslations['account']
}

type AccountFieldProps = {
  error?: string
  helper?: string
  id: string
  label: string
  readOnly?: boolean
} & ComponentPropsWithoutRef<'input'>

function AccountField({ error, helper, id, label, readOnly = false, ...props }: AccountFieldProps) {
  const messageId = `${id}-message`

  return (
    <label className="recruiter-settings-field" htmlFor={id}>
      <span>{label}</span>
      <input
        aria-describedby={messageId}
        aria-invalid={Boolean(error)}
        className="recruiter-settings-field__control"
        id={id}
        readOnly={readOnly}
        {...props}
      />
      <small aria-hidden={!error && !helper} className={`min-h-[2lh]${error ? ' is-error' : ''}`} id={messageId} role={error ? 'alert' : undefined}>
        {error ?? helper ?? ''}
      </small>
    </label>
  )
}

function AccountLoading({ label }: { label: string }) {
  return (
    <div aria-label={label} className="recruiter-settings-skeleton" role="status">
      <span />
      <span />
      <span />
    </div>
  )
}

export function AccountSettingsForm({
  company,
  companyName,
  error,
  loading,
  onRetry,
  onSaved,
  profile,
  translations,
}: AccountSettingsFormProps) {
  const toast = useToast()
  const [submitMessage, setSubmitMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const hasMountedRef = useRef(false)
  const schema = useMemo(
    () => z.object({
      fullName: z.string()
        .trim()
        .min(1, translations.validation.fullNameRequired)
        .min(2, translations.validation.fullNameMinLength)
        .max(255, translations.validation.fullNameMaxLength),
      phone: z.string()
        .trim()
        .max(30, translations.validation.phoneMaxLength),
      contactEmail: z.string()
        .trim()
        .max(255, translations.validation.contactEmailMaxLength)
        .refine(
          (value) => value.length === 0 || z.string().email().safeParse(value).success,
          translations.validation.contactEmailInvalid,
        ),
    }),
    [translations.validation],
  )
  const {
    formState: { dirtyFields, errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
    trigger,
  } = useForm<AccountFormValues>({
    defaultValues: {
      fullName: profile?.fullName ?? '',
      phone: profile?.phone ?? '',
      contactEmail: company?.contactEmail ?? '',
    },
    mode: 'onBlur',
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    void trigger()
  }, [schema, trigger])

  useEffect(() => {
    if (!profile) {
      return
    }

    reset({
      fullName: profile.fullName ?? '',
      phone: profile.phone ?? '',
      contactEmail: company?.contactEmail ?? '',
    })
  }, [company?.contactEmail, profile, reset])

  const handleSave = handleSubmit(async (values) => {
    if (!profile) return
    setSubmitMessage(null)

    try {
      const shouldUpdateAccount = dirtyFields.fullName || dirtyFields.phone
      const shouldUpdateCompany = Boolean(company && dirtyFields.contactEmail)
      const [updatedProfile, updatedCompany] = await Promise.all([
        shouldUpdateAccount
          ? authService.updateMe({
              fullName: values.fullName.trim(),
              phone: values.phone.trim() || null,
            })
          : Promise.resolve(profile),
        shouldUpdateCompany && company
          ? companyService.updateCompany(company.id, {
              contactEmail: values.contactEmail.trim() || null,
            })
          : Promise.resolve(company),
      ])

      reset({
        fullName: updatedProfile.fullName ?? '',
        phone: updatedProfile.phone ?? '',
        contactEmail: updatedCompany?.contactEmail ?? '',
      })
      setSubmitMessage({ tone: 'success', text: translations.saveSuccess })
      toast.success(translations.saveSuccess)
      onSaved(updatedProfile, updatedCompany)
    } catch (submitError) {
      const message = getApiErrorEnvelope(submitError)?.error.message ?? translations.saveError
      setSubmitMessage({
        tone: 'error',
        text: message,
      })
      toast.error(message)
    }
  })

  return (
    <section aria-labelledby="settings-account-title" className="recruiter-settings-section" id="settings-account">
      <header className="recruiter-settings-section__header">
        <h2 id="settings-account-title">{translations.title}</h2>
        <p>{translations.description}</p>
      </header>

      {loading && !profile ? <AccountLoading label={translations.loading} /> : null}

      {!loading && error && !profile ? (
        <div className="recruiter-settings-load-error" role="alert">
          <h3>{translations.errorTitle}</h3>
          <p>{error}</p>
          <Button onClick={onRetry} variant="secondary">{translations.retry}</Button>
        </div>
      ) : null}

      {profile ? (
        <form className="recruiter-settings-form" noValidate onSubmit={handleSave}>
          <div className="recruiter-settings-form__grid">
            <AccountField
              aria-required="true"
              autoComplete="name"
              error={errors.fullName?.message}
              id="settings-full-name"
              label={translations.fullNameLabel}
              placeholder={translations.fullNamePlaceholder}
              {...register('fullName')}
            />
            <AccountField
              autoComplete="tel"
              error={errors.phone?.message}
              helper={translations.phoneHint}
              id="settings-phone"
              label={translations.phoneLabel}
              placeholder={translations.phonePlaceholder}
              type="tel"
              {...register('phone')}
            />
            <AccountField
              autoComplete="email"
              helper={translations.emailHint}
              id="settings-email"
              label={translations.emailLabel}
              readOnly
              type="email"
              value={profile.email}
            />
            <AccountField
              autoComplete="email"
              disabled={!company}
              error={errors.contactEmail?.message}
              helper={company ? translations.contactEmailHint : translations.contactEmailUnavailableHint}
              id="settings-contact-email"
              label={translations.contactEmailLabel}
              placeholder={translations.contactEmailPlaceholder}
              type="email"
              {...register('contactEmail')}
            />
          </div>

          <dl className="recruiter-settings-account-meta">
            <div>
              <dt>{translations.roleLabel}</dt>
              <dd>{translations.recruiterRole}</dd>
            </div>
            <div>
              <dt>{translations.companyLabel}</dt>
              <dd>{companyName || translations.noCompany}</dd>
            </div>
          </dl>

          {submitMessage ? (
            <p
              className="recruiter-settings-status"
              data-tone={submitMessage.tone}
              role={submitMessage.tone === 'error' ? 'alert' : 'status'}
            >
              {submitMessage.text}
            </p>
          ) : null}

          <div className="recruiter-settings-actions">
            <Button
              disabled={!isDirty || isSubmitting}
              type="submit"
            >
              {isSubmitting ? translations.saveLoading : translations.save}
            </Button>
            <Button
              disabled={!isDirty || isSubmitting}
              onClick={() => {
                reset()
                setSubmitMessage(null)
              }}
              variant="secondary"
            >
              {translations.reset}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  )
}
