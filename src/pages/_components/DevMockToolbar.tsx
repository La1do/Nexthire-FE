/**
 * DEV ONLY. Lazily imported from App.tsx behind `import.meta.env.DEV` + `isTeamMockEnabled`, so neither
 * this component nor the mock dev tools end up in production bundles. Deliberately NOT exported from
 * the `_components` barrel.
 */
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context'
import { useLocale } from '../../i18n'
import type { Locale } from '../../i18n'
import { devMockToolbar as enText } from '../../i18n/locales/en/pages/devMockToolbar'
import { devMockToolbar as jaText } from '../../i18n/locales/ja/pages/devMockToolbar'
import { devMockToolbar as viText } from '../../i18n/locales/vi/pages/devMockToolbar'
import type { DevMockToolbarTranslations } from '../../i18n/types'
import { authService } from '../../services/auth.service'
import { mockDevTools } from '../../services/team/mock/mockDevTools'
import type { CompanyPlan } from '../../types/company.types'
import './dev-mock-toolbar.css'

const PLANS: readonly CompanyPlan[] = ['FREE', 'PRO']

// Imported here (not via the global translations) so the strings only exist in the dev-only chunk.
const TEXT_BY_LOCALE: Record<Locale, DevMockToolbarTranslations> = { en: enText, ja: jaText, vi: viText }

export function DevMockToolbar() {
  const text = TEXT_BY_LOCALE[useLocale().locale]
  const { login } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isOpen, setOpen] = useState(false)
  const [isBusy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Mock data lives in localStorage, so re-read it after every action.
  const [, setVersion] = useState(0)

  const accounts = mockDevTools.listAccounts()
  const current = mockDevTools.currentAccount()

  async function run(action: () => Promise<void> | void) {
    setBusy(true)
    setError(null)

    try {
      await action()
    } catch (actionError) {
      console.error('[DevMockToolbar]', actionError)
      setError(text.switchError)
    } finally {
      setBusy(false)
      setVersion((value) => value + 1)
    }
  }

  async function switchAccount(email: string) {
    const auth = await authService.login({ email, password: mockDevTools.password, role: 'RECRUITER' })
    login(auth, 'local')
    queryClient.clear()
    navigate('/recruiter')
  }

  const handleAccountChange = (email: string) => {
    if (email) {
      void run(() => switchAccount(email))
    }
  }

  const handlePlanChange = (plan: CompanyPlan) => {
    void run(async () => {
      mockDevTools.setCurrentCompanyPlan(plan)
      await queryClient.invalidateQueries()
    })
  }

  const handleReset = () => {
    if (!window.confirm(text.resetConfirm)) {
      return
    }

    void run(async () => {
      const email = current?.email
      mockDevTools.reset()

      if (email) {
        await switchAccount(email)
      } else {
        queryClient.clear()
      }
    })
  }

  if (!isOpen) {
    return (
      <button
        aria-expanded={false}
        className="dev-mock-toolbar__pill"
        onClick={() => setOpen(true)}
        title={text.title}
        type="button"
      >
        {text.toggleLabel}
        {current ? ` · ${current.role} ${current.plan}` : null}
      </button>
    )
  }

  return (
    <section aria-label={text.title} className="dev-mock-toolbar">
      <header className="dev-mock-toolbar__header">
        <strong>{text.title}</strong>
        <button
          aria-label={text.closeLabel}
          className="dev-mock-toolbar__close"
          onClick={() => setOpen(false)}
          type="button"
        >
          ×
        </button>
      </header>

      <label className="dev-mock-toolbar__field">
        <span>{text.accountLabel}</span>
        <select
          disabled={isBusy}
          onChange={(event) => handleAccountChange(event.target.value)}
          value={current?.email ?? ''}
        >
          <option value="">—</option>
          {accounts.map((account) => (
            <option key={account.userId} value={account.email}>
              {account.email} ({account.role}, {account.plan}
              {account.status === 'SUSPENDED' ? `, ${account.status}` : ''})
            </option>
          ))}
        </select>
      </label>

      <label className="dev-mock-toolbar__field">
        <span>{text.planLabel}</span>
        <select
          disabled={isBusy || !current}
          onChange={(event) => handlePlanChange(event.target.value as CompanyPlan)}
          value={current?.plan ?? ''}
        >
          {current ? null : <option value="">—</option>}
          {PLANS.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>
      </label>

      <button className="dev-mock-toolbar__reset" disabled={isBusy} onClick={handleReset} type="button">
        {isBusy ? text.switching : text.resetAction}
      </button>

      {error ? (
        <p className="dev-mock-toolbar__error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  )
}
