import { Button } from '../../_components'

export function HeroPanel() {
  return (
    <section className="grid gap-8 rounded-lg border border-[#dedfd7] bg-white p-6 shadow-sm md:grid-cols-[1.2fr_0.8fr] md:p-8">
      <div className="flex flex-col justify-center">
        <p className="text-sm font-semibold uppercase text-[#9a6a19]">Nexhire platform</p>
        <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-[#20242c] md:text-5xl">
          Ket noi nha tuyen dung voi ung vien phu hop nhanh hon.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#5f6673]">
          Khoi tao nen tang frontend dau tien cho Nexhire voi cau truc page-first, san sang mo rong
          cho cac luong tuyen dung, ho so ung vien va quan tri cong ty.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button>Dang tin tuyen dung</Button>
          <Button variant="secondary">Xem ung vien</Button>
        </div>
      </div>

      <div className="rounded-lg bg-[#eaf0e4] p-5">
        <div className="rounded-lg border border-[#cfd4c7] bg-white p-5">
          <div className="flex items-center justify-between border-b border-[#e5e7df] pb-4">
            <div>
              <p className="text-sm font-semibold text-[#20242c]">Frontend setup</p>
              <p className="mt-1 text-sm text-[#5f6673]">React TS + Tailwind</p>
            </div>
            <span className="rounded-md bg-[#dff2ec] px-3 py-1 text-xs font-semibold text-[#116a5b]">
              Ready
            </span>
          </div>
          <div className="mt-5 grid gap-3 text-sm text-[#3b414b]">
            <div className="flex justify-between rounded-md bg-[#f6f7f2] px-3 py-2">
              <span>Pages</span>
              <strong>Folder rieng</strong>
            </div>
            <div className="flex justify-between rounded-md bg-[#f6f7f2] px-3 py-2">
              <span>Shared UI</span>
              <strong>pages/_components</strong>
            </div>
            <div className="flex justify-between rounded-md bg-[#f6f7f2] px-3 py-2">
              <span>Layouts</span>
              <strong>src/layouts</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
