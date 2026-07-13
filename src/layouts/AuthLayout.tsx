import type { PropsWithChildren } from 'react'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="min-h-screen bg-[var(--color-background-app)] px-5 py-9 text-[var(--color-text-primary)] sm:py-12">
      <section className="mx-auto flex min-h-[calc(100vh-4.5rem)] w-full items-center justify-center">{children}</section>
    </main>
  )
}
