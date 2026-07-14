import { Button, Input } from '../../_components'
import { useFormState } from '../../../hooks/useFormState'
import type { ForgotPasswordTranslations } from '../../../i18n/types'
import type { ForgotPasswordRequestValues } from '../types'
import { validateForgotPasswordRequest } from '../utils/forgotPasswordValidation'

type ForgotPasswordFormProps = {
  onSent: (email: string) => void
  translations: ForgotPasswordTranslations
}

const initialValues: ForgotPasswordRequestValues = {
  email: '',
}

export function ForgotPasswordForm({ onSent, translations }: ForgotPasswordFormProps) {
  const { form, validation } = translations
  const { getFieldError, handleFieldChange, handleSubmit, setFieldTouched, values } =
    useFormState<ForgotPasswordRequestValues>({
      initialValues,
      onSubmit: (formValues) => onSent(formValues.email.trim()),
      validate: (formValues) => validateForgotPasswordRequest(formValues, validation),
    })

  return (
    <form className="auth-form-grid grid gap-5" noValidate onSubmit={handleSubmit}>
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

      <Button className="w-full" type="submit">
        {form.requestSubmit}
      </Button>
    </form>
  )
}
