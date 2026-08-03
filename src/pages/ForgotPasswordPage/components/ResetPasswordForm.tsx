import { Button, PasswordInput } from '../../_components'
import { useFormState } from '../../../hooks/useFormState'
import type { ForgotPasswordTranslations } from '../../../i18n/types'
import type { ResetPasswordFormValues } from '../types'
import { validateResetPasswordForm } from '../utils/forgotPasswordValidation'

type ResetPasswordFormProps = {
  isSubmitting?: boolean
  onSaved: (values: ResetPasswordFormValues) => Promise<void> | void
  submitError?: string
  translations: ForgotPasswordTranslations
}

const initialValues: ResetPasswordFormValues = {
  confirmPassword: '',
  password: '',
}

export function ResetPasswordForm({
  isSubmitting = false,
  onSaved,
  submitError,
  translations,
}: ResetPasswordFormProps) {
  const { form, validation } = translations
  const { getFieldError, handleFieldChange, handleSubmit, setFieldTouched, values } =
    useFormState<ResetPasswordFormValues>({
      initialValues,
      onSubmit: (formValues) => {
        void onSaved(formValues)
      },
      validate: (formValues) => validateResetPasswordForm(formValues, validation),
    })

  return (
    <form className="auth-form-grid grid" noValidate onSubmit={handleSubmit}>
      <PasswordInput
        autoComplete="new-password"
        error={getFieldError('password')}
        hidePasswordLabel={form.hidePassword}
        label={form.passwordLabel}
        onBlur={() => setFieldTouched('password')}
        onChange={handleFieldChange('password')}
        placeholder={form.passwordPlaceholder}
        showPasswordLabel={form.showPassword}
        value={values.password}
      />

      <PasswordInput
        autoComplete="new-password"
        error={getFieldError('confirmPassword')}
        hidePasswordLabel={form.hidePassword}
        label={form.confirmPasswordLabel}
        onBlur={() => setFieldTouched('confirmPassword')}
        onChange={handleFieldChange('confirmPassword')}
        placeholder={form.confirmPasswordPlaceholder}
        showPasswordLabel={form.showPassword}
        value={values.confirmPassword}
      />

      {submitError ? (
        <p className="text-center text-sm font-medium text-[var(--color-text-danger)]">{submitError}</p>
      ) : null}

      <Button className="w-full" disabled={isSubmitting} type="submit">
        {form.resetSubmit}
      </Button>
    </form>
  )
}
