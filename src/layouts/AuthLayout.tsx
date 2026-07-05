import type { PropsWithChildren } from 'react'

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7f2] px-5 py-10 text-[#20242c]">
      <section className="w-full max-w-md rounded-lg border border-[#dedfd7] bg-white p-6 shadow-sm">
        {children}
      </section>
    </main>
  )
}
