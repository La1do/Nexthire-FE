import { useTranslations } from '../../i18n'
import { AuthPageShell } from '../_components'
import { LoginForm } from './components/LoginForm'
import type { AuthApiRole } from '../../lib/auth/authRole'

type LoginPageRole = 'candidate' | 'recruiter' | 'admin'

function LoginPageForRole({ role }: { role: LoginPageRole }) {
  const { common, pages } = useTranslations()
  const login = pages.login
  const roleContent = login[role]
  const switchHref = role === 'candidate' ? '/recruiter/login' : '/login'
  const registerHref =
    role === 'recruiter' ? '/recruiter/register' : role === 'candidate' ? '/register' : '/admin/dashboard'
  const apiRoleByPageRole: Record<LoginPageRole, AuthApiRole> = {
    admin: 'ADMIN',
    candidate: 'CANDIDATE',
    recruiter: 'RECRUITER',
  }

  return (
    <AuthPageShell
      brandName={common.brandName}
      footer={
        <>
          {role === 'admin' ? null : (
            <p>
              <span>{login.footer.prompt}</span>{' '}
              <a className="font-bold text-[var(--color-brand-solid)] transition hover:opacity-80" href={registerHref}>
                {login.footer.action}
              </a>
            </p>
          )}
          <p className="mt-2">
            <span>{roleContent.switchPrompt}</span>{' '}
            <a className="font-bold text-[var(--color-brand-solid)] transition hover:opacity-80" href={switchHref}>
              {roleContent.switchAction}
            </a>
          </p>
        </>
      }
      subtitle={roleContent.subtitle}
      title={roleContent.title}
    >
      <LoginForm
        apiErrors={common.apiErrors}
        authFeedback={common.authFeedback}
        backToLoginLabel={common.navigation.login}
        role={apiRoleByPageRole[role]}
        translations={login}
        verificationTranslations={pages.register.verification.verify}
        verificationValidation={{ codeRequired: pages.register.validation.codeRequired }}
        verifyEmailLabel={common.loader.verifyEmailLabel}
      />
    </AuthPageShell>
  )
}

export function CandidateLoginPage() {
  return <LoginPageForRole role="candidate" />
}

export function RecruiterLoginPage() {
  return <LoginPageForRole role="recruiter" />
}

export function AdminLoginPage() {
  return <LoginPageForRole role="admin" />
}

export function LoginPage() {
  return <CandidateLoginPage />
}

export default LoginPage
