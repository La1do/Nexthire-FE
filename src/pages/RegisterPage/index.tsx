import { getTranslations } from '../../i18n'
import { AuthPageShell } from '../_components'
import { RegisterForm } from './components/RegisterForm'

export function RegisterPage() {
  const { common, pages } = getTranslations()
  const register = pages.register

  return (
    <AuthPageShell
      brandName={common.brandName}
      footer={
        <>
          <span>{register.footer.prompt}</span>{' '}
          <a className="font-bold text-[var(--color-brand-solid)] transition hover:opacity-80" href="/login">
            {register.footer.action}
          </a>
        </>
      }
      subtitle={register.subtitle}
      title={register.title}
    >
      <RegisterForm translations={register} />
    </AuthPageShell>
  )
}

export default RegisterPage
