import { useEffect, useRef, useState } from 'react'
import { applicationService } from '../../../../services/application.service'
import type { ApplicationResponse } from '../../../../types/application.types'
import { parseAi2Pool } from '../../../../types/ai2-pool.types'
import './ai2-review-order.css'

export type Ai2TableOrder = { applications: ApplicationResponse[]; ranks: Record<string, number> }
type Props = {
  applicationId: string; jobId: string; locale: string; applied: boolean; disabled: boolean
  onApply: (order: Ai2TableOrder) => void; onReset: () => void
}

export function Ai2ReviewOrder({ applicationId, jobId, locale, applied, disabled, onApply, onReset }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'unavailable'>('idle')
  const request = useRef<AbortController | null>(null)
  const vi = locale === 'vi'
  useEffect(() => () => { request.current?.abort() }, [])

  function reset() {
    request.current?.abort()
    request.current = null
    setStatus('idle')
    onReset()
  }

  async function load() {
    reset()
    const controller = new AbortController()
    request.current = controller
    setStatus('loading')
    const timer = window.setTimeout(() => {
      controller.abort()
      if (request.current === controller) { request.current = null; onReset(); setStatus('unavailable') }
    }, 20000)
    try {
      const payload = await applicationService.getRecruiterApplicationAi2Pool(applicationId, controller.signal)
      const pool = parseAi2Pool(payload, applicationId, jobId)
      if (pool.status !== 'READY' || pool.rank === null) throw new Error('Pool not comparable')
      const data = (payload as { data: { items: Array<{ applicationId: string; candidateId: string; candidateCvId: string; rankingPosition: number }> } }).data
      // Load the complete authorized job list, never reorder just the current server page.
      // Bound reads; a larger or changing list fails closed rather than displaying a partial order.
      const first = await applicationService.getRecruiterApplications({ jobId, limit: 100, page: 1, sortBy: 'submittedAt', sortOrder: 'desc' })
      if (first.meta.page !== 1 || !Number.isInteger(first.meta.total) || first.meta.total < 0 || !Number.isInteger(first.meta.limit) || first.meta.limit < 1 ||
        !Number.isInteger(first.meta.totalPages) || first.meta.totalPages < 1 || first.meta.totalPages > 10) throw new Error('Scope too large')
      const applications = [...first.data]
      for (let page = 2; page <= first.meta.totalPages; page++) {
        controller.signal.throwIfAborted()
        const next = await applicationService.getRecruiterApplications({ jobId, limit: 100, page, sortBy: 'submittedAt', sortOrder: 'desc' })
        if (next.meta.total !== first.meta.total || next.meta.totalPages !== first.meta.totalPages || next.meta.page !== page) throw new Error('Scope changed')
        applications.push(...next.data)
      }
      controller.signal.throwIfAborted()
      const byId = new Map(applications.map(app => [app.id, app]))
      if (applications.length !== first.meta.total || byId.size !== applications.length || applications.some(app => app.jobId !== jobId)) throw new Error('Incomplete job scope')
      const active = applications.filter(app => app.status === 'SUBMITTED' || app.status === 'OFFERED')
      if (active.length !== pool.count) throw new Error('Active scope changed')
      const ranks: Record<string, number> = {}
      for (const item of data.items) {
        const app = byId.get(item.applicationId)
        if (!app || app.candidateId !== item.candidateId || app.candidateCvId !== item.candidateCvId ||
          !['SUBMITTED', 'OFFERED'].includes(app.status)) throw new Error('Pool identity changed')
        ranks[app.id] = item.rankingPosition
      }
      const latest = await applicationService.getRecruiterApplicationAi2Pool(applicationId, controller.signal)
      parseAi2Pool(latest, applicationId, jobId)
      if (JSON.stringify((latest as { data: unknown }).data) !== JSON.stringify((payload as { data: unknown }).data)) throw new Error('Pool changed during loading')
      controller.signal.throwIfAborted()
      // Equal positions preserve the normal newest-first order, not an invented tie-break score.
      applications.sort((a, b) => (ranks[a.id] ?? Infinity) - (ranks[b.id] ?? Infinity) ||
        Date.parse(b.submittedAt) - Date.parse(a.submittedAt) || a.id.localeCompare(b.id))
      if (request.current === controller) { onApply({ applications, ranks }); setStatus('idle') }
    } catch {
      if (request.current === controller) { onReset(); setStatus('unavailable') }
    } finally {
      window.clearTimeout(timer)
      if (request.current === controller) request.current = null
    }
  }

  return <section className="ai2-review-order" aria-label={vi ? 'Thứ tự AI2 demo' : 'AI2 demo order'} aria-busy={status === 'loading'}>
    <div className="ai2-review-order__controls">
      <strong>{vi ? 'Thứ tự AI2 · demo local' : 'AI2 order · local demo'}</strong>
      <button type="button" disabled={disabled || status === 'loading'} aria-pressed={applied} onClick={() => void load()}>{applied ? (vi ? 'Tải lại thứ tự AI2' : 'Refresh AI2 order') : (vi ? 'Áp dụng thứ tự AI2' : 'Apply AI2 order')}</button>
      {(applied || status === 'loading') && <button type="button" onClick={reset}>{vi ? 'Về thứ tự thường' : 'Restore normal order'}</button>}
    </div>
    <p role="note">{vi ? 'Model chưa được xác nhận chất lượng. Chỉ đổi thứ tự hiển thị trong bảng để kiểm thử; không phải độ phù hợp hay quyết định tuyển/loại.' : 'Model quality is unvalidated. Changes table display order for testing only; not suitability or a hiring/rejection decision.'}</p>
    {disabled ? <p>{vi ? 'Chọn một tin, bỏ tìm kiếm/bộ lọc trạng thái và chờ matching hoàn tất để so sánh toàn bộ nhóm.' : 'Select one job, clear search/status filters and wait for matching to finish to compare the complete group.'}</p> : null}
    {status === 'loading' ? <p role="status">{vi ? 'Đang kiểm tra toàn bộ nhóm hồ sơ…' : 'Checking the complete application group…'}</p> : null}
    {status === 'unavailable' ? <p role="status">{vi ? 'Chưa thể so sánh toàn bộ nhóm. Đã giữ lại thứ tự thường.' : 'The complete group cannot be compared. Normal order is restored.'}</p> : null}
    {applied ? <p role="status">{vi ? 'Đã áp dụng cho toàn bộ tin: hồ sơ đang hoạt động trước, hồ sơ đã đóng sau. Đồng hạng giữ thứ tự mới nhất. Tải lại sau khi dữ liệu thay đổi.' : 'Applied across this job: active applications first, closed applications afterward. Ties keep newest order. Refresh after data changes.'}</p> : null}
  </section>
}
