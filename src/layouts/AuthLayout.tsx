import type { PropsWithChildren } from 'react'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="auth-layout min-h-100dvh bg-[var(--color-background-app)] text-[var(--color-text-primary)]">
      <section className="auth-layout-inner mx-auto flex w-full items-center justify-center">
        {children}
      </section>
    </main>
  )
}
