import { Button, Input } from '../../_components'
import { useFormState } from '../../../hooks/useFormState'
import type { ForgotPasswordTranslations } from '../../../i18n/types'
import type { ForgotPasswordRequestValues } from '../types'
import { validateForgotPasswordRequest } from '../utils/forgotPasswordValidation'

type ForgotPasswordFormProps = {
  isSubmitting?: boolean
  onSent: (email: string) => Promise<void> | void
  submitError?: string
  translations: ForgotPasswordTranslations
}

const initialValues: ForgotPasswordRequestValues = {
  email: '',
}

export function ForgotPasswordForm({
  isSubmitting = false,
  onSent,
  submitError,
  translations,
}: ForgotPasswordFormProps) {
  const { form, validation } = translations
  const { getFieldError, handleFieldChange, handleSubmit, setFieldTouched, values } =
    useFormState<ForgotPasswordRequestValues>({
      initialValues,
      onSubmit: (formValues) => {
        void onSent(formValues.email.trim())
      },
      validate: (formValues) => validateForgotPasswordRequest(formValues, validation),
    })

  return (
    <form className="auth-form-grid grid" noValidate onSubmit={handleSubmit}>
      <Input
        autoComplete="email"
        error={getFieldError('email')}
        label={form.emailLabel}
        onBlur={() => setFieldTouched('email')}
        onChange={handleFieldChange('email')}
        placeholder={form.emailPlaceholder}
        type="email"
        value={values.email}
      />

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {form.requestSubmit}
      </Button>

      {submitError ? (
        <p className="text-center text-sm font-medium text-[var(--color-text-danger)]">{submitError}</p>
      ) : null}
    </form>
  )
}
