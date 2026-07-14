import { Button, Checkbox, Input, PasswordInput } from '../../_components'
import { useFormState } from '../../../hooks/useFormState'
import type { LoginTranslations } from '../../../i18n/types'
import type { LoginFormValues } from '../types'
import { validateLoginForm } from '../utils/loginValidation'

type LoginFormProps = {
  translations: LoginTranslations
}

const initialValues: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: false,
}

export function LoginForm({ translations }: LoginFormProps) {
  const { form, validation } = translations
  const { getFieldError, handleCheckboxChange, handleFieldChange, handleSubmit, setFieldTouched, values } =
    useFormState<LoginFormValues>({
      initialValues,
      onSubmit: () => undefined,
      validate: (formValues) => validateLoginForm(formValues, validation),
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

      <PasswordInput
        autoComplete="current-password"
        error={getFieldError('password')}
        hidePasswordLabel={form.hidePassword}
        label={form.passwordLabel}
        onBlur={() => setFieldTouched('password')}
        onChange={handleFieldChange('password')}
        placeholder={form.passwordPlaceholder}
        showPasswordLabel={form.showPassword}
        value={values.password}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox checked={values.rememberMe} label={form.rememberMe} onChange={handleCheckboxChange('rememberMe')} />
        <a className="text-sm font-semibold text-[var(--color-brand-solid)] transition hover:opacity-80" href="/forgot-password">
          {form.forgotPassword}
        </a>
      </div>

      <Button className="mt-1 w-full" type="submit">
        {form.submit}
      </Button>
    </form>
  )
}
