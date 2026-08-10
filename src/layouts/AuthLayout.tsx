import type { PropsWithChildren } from 'react'
import { LanguageSwitch } from '../pages/_components'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="auth-layout min-h-100dvh bg-[var(--color-background-app)] text-[var(--color-text-primary)]">
      <div className="auth-language-switch">
        <LanguageSwitch compact />
      </div>
      <section className="auth-layout-inner mx-auto flex w-full items-center justify-center">
        {children}
      </section>
    </main>
  )
}
