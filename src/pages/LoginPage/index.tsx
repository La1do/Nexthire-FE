import { useTranslations } from '../../i18n'
import { AuthPageShell } from '../_components'
import { LoginForm } from './components/LoginForm'

export function LoginPage() {
  const { common, pages } = useTranslations()
  const login = pages.login

  return (
    <AuthPageShell
      brandName={common.brandName}
      footer={
        <>
          <span>{login.footer.prompt}</span>{' '}
          <a className="font-bold text-[var(--color-brand-solid)] transition hover:opacity-80" href="/register">
            {login.footer.action}
          </a>
        </>
      }
      subtitle={login.subtitle}
      title={login.title}
    >
      <LoginForm apiErrors={common.apiErrors} translations={login} />
    </AuthPageShell>
  )
}

export default LoginPage
