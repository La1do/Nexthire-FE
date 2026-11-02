import { useEffect, useState } from 'react'
import { applicationService } from '../../../../services/application.service'
import { parseAi2Pool } from '../../../../types/ai2-pool.types'

type Props = { applicationId: string; jobId: string; locale: string; onView: (id: string) => void }
type Row = { id: string; name: string; rank: number }

export function Ai2ReviewOrder({ applicationId, jobId, locale, onView }: Props) {
  const [rows, setRows] = useState<Row[] | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'unavailable'>('idle')
  const [revision, setRevision] = useState(0)
  const vi = locale === 'vi'
  useEffect(() => {
    if (!revision) return
    const controller = new AbortController()
    let active = true
    setStatus('loading'); setRows(null)
    const timer = window.setTimeout(() => { active = false; controller.abort(); setStatus('unavailable') }, 20000)
    async function load() {
      const payload = await applicationService.getRecruiterApplicationAi2Pool(applicationId, controller.signal)
      const pool = parseAi2Pool(payload, applicationId, jobId)
      if (pool.status !== 'READY') throw new Error('Pool not comparable')
      const data = (payload as { data: { items: Array<{ applicationId: string; candidateId: string; candidateCvId: string; rankingPosition: number }> } }).data
      const ordered = []
      // Bounded sequential reads: do not fan out 50 requests at once.
      for (const item of data.items) {
        const app = await applicationService.getRecruiterApplication(item.applicationId, controller.signal)
        if (app.id !== item.applicationId || app.jobId !== jobId || app.candidateId !== item.candidateId ||
          app.candidateCvId !== item.candidateCvId || !['SUBMITTED', 'OFFERED'].includes(app.status)) throw new Error('Pool changed')
        ordered.push({ id: app.id, name: app.candidateFullName, rank: item.rankingPosition })
      }
      const latest = await applicationService.getRecruiterApplicationAi2Pool(applicationId, controller.signal)
      parseAi2Pool(latest, applicationId, jobId)
      if (JSON.stringify((latest as { data: unknown }).data) !== JSON.stringify((payload as { data: unknown }).data)) throw new Error('Pool changed during loading')
      if (active) { setRows(ordered); setStatus('idle') }
    }
    load().catch(() => { if (active) setStatus('unavailable') }).finally(() => window.clearTimeout(timer))
    return () => { active = false; window.clearTimeout(timer); controller.abort() }
  }, [applicationId, jobId, revision])
  return <section className="recruiter-application-detail-card" aria-label={vi ? 'Danh sách gợi ý xem hồ sơ' : 'Suggested application review list'} aria-busy={status === 'loading'}>
    <h3>{vi ? 'Gợi ý thứ tự xem hồ sơ — thử nghiệm' : 'Suggested review order — experimental'}</h3>
    <p>{vi ? 'Chỉ so sánh toàn bộ đơn đang hoạt động của tin đã chọn khi dữ liệu tương thích. Điểm bằng nhau có cùng thứ tự. Không phải kết luận phù hợp hoặc quyết định tuyển dụng.' : 'Compares all active applications for the selected job only when data is compatible. Equal scores share a position. Not a suitability conclusion or hiring decision.'}</p>
    <button type="button" disabled={status === 'loading'} onClick={() => setRevision(value => value + 1)}>{vi ? 'Tải thứ tự gợi ý' : 'Load suggested order'}</button>
    {status === 'loading' ? <p role="status">{vi ? 'Đang kiểm tra nhóm hồ sơ…' : 'Checking application group…'}</p> : null}
    {status === 'unavailable' ? <p role="status">{vi ? 'Chưa thể gợi ý thứ tự: dữ liệu hoặc chất lượng đánh giá nội dung chưa đủ điều kiện. Danh sách bên dưới vẫn giữ thứ tự ban đầu.' : 'The complete group cannot be compared. At least two results compatible with the current job are needed. The original list below is unchanged.'}</p> : null}
    {rows ? <><p>{vi ? `${rows.length} hồ sơ đang hoạt động; thứ tự tại thời điểm tải. Tải lại sau khi dữ liệu thay đổi.` : `${rows.length} active applications; order as loaded. Refresh after data changes.`}</p><ul>{rows.map(row => <li key={row.id}><button type="button" onClick={() => onView(row.id)}>{vi ? `Thứ ${row.rank}` : `Position ${row.rank}`} — {row.name}</button></li>)}</ul></> : null}
  </section>
}
