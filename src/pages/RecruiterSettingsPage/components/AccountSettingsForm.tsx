import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { ComponentPropsWithoutRef } from 'react'
import { z } from 'zod'
import type { RecruiterSettingsTranslations } from '../../../i18n/types'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import { authService } from '../../../services/auth.service'
import type { AuthProfile } from '../../../services/auth.service'
import { Button } from '../../_components'

type AccountFormValues = {
  fullName: string
  phone: string
}

type AccountSettingsFormProps = {
  companyName?: string | null
  error?: string
  loading: boolean
  onRetry: () => void
  onSaved: (profile: AuthProfile) => void
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
      <small className={error ? 'is-error' : undefined} id={messageId}>
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
  companyName,
  error,
  loading,
  onRetry,
  onSaved,
  profile,
  translations,
}: AccountSettingsFormProps) {
  const [submitMessage, setSubmitMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
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
    }),
    [translations.validation],
  )
  const {
    formState: { errors, isDirty, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<AccountFormValues>({
    defaultValues: {
      fullName: profile?.fullName ?? '',
      phone: profile?.phone ?? '',
    },
    mode: 'onBlur',
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!profile) {
      return
    }

    reset({
      fullName: profile.fullName ?? '',
      phone: profile.phone ?? '',
    })
  }, [profile, reset])

  const handleSave = handleSubmit(async (values) => {
    setSubmitMessage(null)

    try {
      const updatedProfile = await authService.updateMe({
        fullName: values.fullName.trim(),
        phone: values.phone.trim() || null,
      })

      reset({
        fullName: updatedProfile.fullName ?? '',
        phone: updatedProfile.phone ?? '',
      })
      setSubmitMessage({ tone: 'success', text: translations.saveSuccess })
      onSaved(updatedProfile)
    } catch (submitError) {
      setSubmitMessage({
        tone: 'error',
        text: getApiErrorEnvelope(submitError)?.error.message ?? translations.saveError,
      })
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
