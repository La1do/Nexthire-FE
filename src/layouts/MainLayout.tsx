import type { PropsWithChildren } from 'react'

export function MainLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[#f6f7f2] text-[#20242c]">
      <header className="border-b border-[#dedfd7] bg-white/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a className="text-lg font-semibold" href="/">
            Nexhire
          </a>
          <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm text-[#5f6673]">
            <a className="transition hover:text-[#20242c]" href="/">
              Viec lam
            </a>
            <a className="transition hover:text-[#20242c]" href="/">
              Ung vien
            </a>
            <a className="transition hover:text-[#20242c]" href="/">
              Cong ty
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-10">{children}</main>
    </div>
  )
}
