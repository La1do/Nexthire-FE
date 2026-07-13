import { Button, Input, PasswordInput, SegmentedControl } from '../../_components'
import { useFormState } from '../../../hooks/useFormState'
import type { RegisterTranslations } from '../../../i18n/types'
import type { RegisterFormValues, RegisterRole } from '../types'
import { validateRegisterForm } from '../utils/registerValidation'

type RegisterFormProps = {
  translations: RegisterTranslations
}

const initialValues: RegisterFormValues = {
  confirmPassword: '',
  email: '',
  password: '',
  role: 'candidate',
}

function isRegisterRole(value: string): value is RegisterRole {
  return value === 'candidate' || value === 'employer'
}

export function RegisterForm({ translations }: RegisterFormProps) {
  const { form, validation } = translations
  const { getFieldError, handleFieldChange, handleSubmit, setFieldTouched, setFieldValue, values } =
    useFormState<RegisterFormValues>({
      initialValues,
      onSubmit: () => undefined,
      validate: (formValues) => validateRegisterForm(formValues, validation),
    })

  const handleRoleChange = (role: string) => {
    if (isRegisterRole(role)) {
      setFieldValue('role', role)
    }
  }

  return (
    <form className="grid gap-5" noValidate onSubmit={handleSubmit}>
      <SegmentedControl
        label={form.roleLabel}
        name="role"
        onChange={handleRoleChange}
        options={form.roleOptions}
        value={values.role}
      />

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

      <Button className="mt-1 w-full" type="submit">
        {form.submit}
      </Button>
    </form>
  )
}
