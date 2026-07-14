import { Button, PasswordInput } from '../../_components'
import { useFormState } from '../../../hooks/useFormState'
import type { ForgotPasswordTranslations } from '../../../i18n/types'
import type { ResetPasswordFormValues } from '../types'
import { validateResetPasswordForm } from '../utils/forgotPasswordValidation'

type ResetPasswordFormProps = {
  onSaved: () => void
  translations: ForgotPasswordTranslations
}

const initialValues: ResetPasswordFormValues = {
  confirmPassword: '',
  password: '',
}

export function ResetPasswordForm({ onSaved, translations }: ResetPasswordFormProps) {
  const { form, validation } = translations
  const { getFieldError, handleFieldChange, handleSubmit, setFieldTouched, values } =
    useFormState<ResetPasswordFormValues>({
      initialValues,
      onSubmit: onSaved,
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

      <Button className="w-full" type="submit">
        {form.resetSubmit}
      </Button>
    </form>
  )
}
