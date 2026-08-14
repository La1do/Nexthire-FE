import { zodResolver } from '@hookform/resolvers/zod'
import { useId, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { ComponentPropsWithoutRef } from 'react'
import { z } from 'zod'
import { useToast } from '../../../context'
import type { CandidateSettingsTranslations } from '../../../i18n/types'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import { authService } from '../../../services/auth.service'
import { Button } from '../../_components'

type PasswordFormValues = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type PasswordFieldProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  error?: string
  hideLabel: string
  label: string
  showLabel: string
}

function PasswordField({ error, hideLabel, id, label, showLabel, ...props }: PasswordFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`
  const [isVisible, setVisible] = useState(false)
  const toggleLabel = isVisible ? hideLabel : showLabel

  return (
    <div className="candidate-settings-field">
      <label htmlFor={inputId}>{label}</label>
      <div className="candidate-settings-password">
        <input
          aria-describedby={messageId}
          aria-invalid={Boolean(error)}
          aria-required="true"
          className="candidate-settings-field__control"
          id={inputId}
          type={isVisible ? 'text' : 'password'}
          {...props}
        />
        <button
          aria-label={toggleLabel}
          className="candidate-settings-password__toggle"
          onClick={() => setVisible((current) => !current)}
          title={toggleLabel}
          type="button"
        >
          <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
            {isVisible ? (
              <>
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="3" />
              </>
            ) : (
              <>
                <path d="m3 3 18 18" />
                <path d="M10.7 5.2A10.2 10.2 0 0 1 12 5c6 0 9.5 7 9.5 7a18.3 18.3 0 0 1-2.7 3.7" />
                <path d="M6.5 6.5A18.3 18.3 0 0 0 2.5 12s3.5 7 9.5 7a9.8 9.8 0 0 0 4.2-.9" />
                <path d="M9.9 9.9A3 3 0 0 0 14.1 14.1" />
              </>
            )}
          </svg>
        </button>
      </div>
      <small className={error ? 'is-error' : undefined} id={messageId}>{error ?? ''}</small>
    </div>
  )
}

type PasswordSettingsFormProps = {
  translations: CandidateSettingsTranslations['security']
}

function getSecurityApiError(
  error: unknown,
  translations: CandidateSettingsTranslations['security'],
) {
  const envelope = getApiErrorEnvelope(error)

  switch (envelope?.error.code) {
    case 'AUTH.INVALID_CREDENTIALS':
      return translations.apiErrors.invalidCredentials
    case 'AUTH.PASSWORD_REUSE_NOT_ALLOWED':
      return translations.apiErrors.passwordReuse
    case 'AUTH.USER_CREDENTIAL_NOT_FOUND':
      return translations.apiErrors.credentialMissing
    default:
      return translations.submitError
  }
}

export function PasswordSettingsForm({ translations }: PasswordSettingsFormProps) {
  const toast = useToast()
  const [submitMessage, setSubmitMessage] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)
  const schema = useMemo(
    () => z.object({
      currentPassword: z.string()
        .min(1, translations.validation.currentRequired)
        .min(8, translations.validation.passwordMinLength)
        .max(128, translations.validation.passwordMaxLength),
      newPassword: z.string()
        .min(1, translations.validation.newRequired)
        .min(8, translations.validation.passwordMinLength)
        .max(128, translations.validation.passwordMaxLength),
      confirmPassword: z.string()
        .min(1, translations.validation.confirmRequired),
    }).superRefine((values, context) => {
      if (values.currentPassword && values.newPassword && values.newPassword === values.currentPassword) {
        context.addIssue({
          code: 'custom',
          message: translations.validation.passwordReuse,
          path: ['newPassword'],
        })
      }

      if (values.confirmPassword && values.newPassword && values.confirmPassword !== values.newPassword) {
        context.addIssue({
          code: 'custom',
          message: translations.validation.passwordMismatch,
          path: ['confirmPassword'],
        })
      }
    }),
    [translations.validation],
  )
  const {
    formState: { errors, isDirty, isSubmitted, isSubmitting, touchedFields },
    handleSubmit,
    register,
    reset,
  } = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: zodResolver(schema),
  })

  const handleChangePassword = handleSubmit(async (values) => {
    setSubmitMessage(null)

    try {
      await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      reset()
      setSubmitMessage({ tone: 'success', text: translations.submitSuccess })
      toast.success(translations.submitSuccess)
    } catch (submitError) {
      const message = getSecurityApiError(submitError, translations)
      setSubmitMessage({ tone: 'error', text: message })
      toast.error(message)
    }
  })

  return (
    <section
      aria-labelledby="candidate-settings-security-title"
      className="candidate-settings-section candidate-settings-section--security"
    >
      <header className="candidate-settings-section__header">
        <h2 id="candidate-settings-security-title">{translations.title}</h2>
        <p>{translations.description}</p>
      </header>

      <form className="candidate-settings-form" noValidate onSubmit={handleChangePassword}>
        <div className="candidate-settings-form__fields">
          <PasswordField
            autoComplete="current-password"
            error={(touchedFields.currentPassword || isSubmitted) ? errors.currentPassword?.message : undefined}
            hideLabel={translations.hidePassword}
            label={translations.currentPasswordLabel}
            showLabel={translations.showPassword}
            {...register('currentPassword')}
          />
          <PasswordField
            autoComplete="new-password"
            error={(touchedFields.newPassword || isSubmitted) ? errors.newPassword?.message : undefined}
            hideLabel={translations.hidePassword}
            label={translations.newPasswordLabel}
            showLabel={translations.showPassword}
            {...register('newPassword')}
          />
          <PasswordField
            autoComplete="new-password"
            error={(touchedFields.confirmPassword || isSubmitted) ? errors.confirmPassword?.message : undefined}
            hideLabel={translations.hidePassword}
            label={translations.confirmPasswordLabel}
            showLabel={translations.showPassword}
            {...register('confirmPassword')}
          />
        </div>

        {submitMessage ? (
          <p
            className="candidate-settings-status"
            data-tone={submitMessage.tone}
            role={submitMessage.tone === 'error' ? 'alert' : 'status'}
          >
            {submitMessage.text}
          </p>
        ) : null}

        <div className="candidate-settings-actions">
          <Button
            aria-busy={isSubmitting}
            className="candidate-settings-submit"
            disabled={!isDirty || isSubmitting}
            type="submit"
          >
            {isSubmitting ? <span aria-hidden="true" className="candidate-settings-spinner" /> : null}
            <span>{isSubmitting ? translations.submitLoading : translations.submit}</span>
          </Button>
        </div>
      </form>
    </section>
  )
}
