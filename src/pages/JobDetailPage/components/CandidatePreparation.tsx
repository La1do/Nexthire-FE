import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { useAuth } from '../../../context'
import { apiClient } from '../../../lib/api'
import { candidateService } from '../../../services/candidate.service'
import type { CandidateCvResponse } from '../../../types/candidate.types'
import { Button } from '../../_components/Button'

const resultSchema = z.object({
  schemaVersion: z.literal('candidate-preparation-v1'),
  status: z.literal('READY'),
  jobId: z.string(),
  candidateCvId: z.string(),
  private: z.literal(true),
  applicationCreated: z.literal(false),
  candidateSupportVerified: z.literal(false),
  jobSnapshotSha256: z.string(),
  cvSnapshotSha256: z.string(),
  warnings: z.array(z.string()),
  requirements: z.array(z.object({
    requirement: z.string(),
    importance: z.string(),
    status: z.enum(['REVIEW_REFERENCES', 'NO_REFERENCE_FOUND']),
    evidence: z.array(z.object({ id: z.string(), source: z.string(), text: z.string() })).max(3),
    prompt: z.string(),
  })).max(32),
})
type Result = z.infer<typeof resultSchema>

const warningMessages: Record<string, string> = {
  NO_EXPERIENCE_OR_PROJECT_RECORDS: 'Dữ liệu CV đã phân tích chưa có kinh nghiệm làm việc hoặc dự án. Hãy kiểm tra CV gốc và kết quả phân tích.',
  CV_EVIDENCE_CONTEXT_TRUNCATED: 'CV có nhiều nội dung nên chỉ một phần được dùng để đối chiếu. Hãy kiểm tra thêm các phần còn lại trong CV gốc.',
}
const parseStatusLabels: Record<CandidateCvResponse['parseStatus'], string> = {
  NOT_PARSED: 'Chưa phân tích',
  PARSING: 'Đang phân tích',
  PARSED: 'Đã phân tích',
  FAILED: 'Phân tích chưa thành công',
}

export function CandidatePreparation({ jobId }: { jobId: string }) {
  const { user } = useAuth()
  const [cvs, setCvs] = useState<CandidateCvResponse[]>([])
  const [cv, setCv] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [profileState, setProfileState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [profileAttempt, setProfileAttempt] = useState(0)
  const sequence = useRef(0)

  useEffect(() => {
    const run = ++sequence.current
    setResult(null)
    setError('')
    setBusy(false)
    setCvs([])
    setCv('')
    setProfileState('loading')
    if (user?.role === 'CANDIDATE') {
      candidateService.getMyProfile().then(p => {
        if (sequence.current !== run) return
        setCvs(p.cvs)
        setCv(p.cvs.find(c => c.id === p.defaultCv?.id)?.id ?? p.cvs[0]?.id ?? '')
        setProfileState('ready')
      }).catch(() => {
        if (sequence.current !== run) return
        setProfileState('error')
        setError('Không tải được danh sách CV. Hãy thử tải lại.')
      })
    }
    return () => { sequence.current++ }
  }, [jobId, user?.id, user?.role, profileAttempt])

  if (user?.role !== 'CANDIDATE') return null

  async function check() {
    if (!cv || busy || cvs.find(c => c.id === cv)?.parseStatus !== 'PARSED') return
    const run = ++sequence.current
    const selectedCv = cv
    setBusy(true)
    setError('')
    setResult(null)
    try {
      // Gateway allows up to 85s for snapshot reads and matching; keep this request bounded above that budget.
      const response = await apiClient.post(`/candidates/me/cvs/${encodeURIComponent(selectedCv)}/jobs/${encodeURIComponent(jobId)}/preparation`, undefined, { timeout: 90_000 })
      if (response.data.success !== true) throw new Error('Invalid response')
      const value = resultSchema.parse(response.data.data)
      if (value.jobId !== jobId || value.candidateCvId !== selectedCv) throw new Error('Source changed')
      if (sequence.current === run) setResult(value)
    } catch (cause: unknown) {
      const code = (cause as { response?: { data?: { error?: { code?: string } } } })?.response?.data?.error?.code
      const messages: Record<string, string> = {
        'CANDIDATE.PREPARATION_JOB_UNAVAILABLE': 'Không lấy được thông tin công việc công khai. Hãy thử lại sau; bạn không cần phân tích lại CV vì lỗi này.',
        'CANDIDATE.PREPARATION_PARSE_UNAVAILABLE': 'Chưa lấy được kết quả đã lưu từ dịch vụ phân tích CV. Hãy thử lại sau; không cần tải lên hoặc phân tích lại CV vì lỗi dịch vụ.',
        'CANDIDATE.PREPARATION_PARSE_MISSING': 'CV được đánh dấu đã phân tích nhưng không tìm thấy kết quả phân tích đã lưu. Hãy kiểm tra kết quả trong hồ sơ trước khi phân tích lại.',
      }
      if (sequence.current === run) setError(`${messages[code ?? ''] ?? 'Chưa đối chiếu được. Dịch vụ đối chiếu chưa khả dụng hoặc dữ liệu chưa đáp ứng giới hạn xử lý. Hãy thử lại sau.'} CV và đơn ứng tuyển không bị thay đổi.`)
    } finally {
      if (sequence.current === run) setBusy(false)
    }
  }

  return <section aria-label="Chuẩn bị CV cho công việc này" className="job-detail-card job-detail-section-card">
    <header className="job-detail-card__header"><h2 className="job-detail-card__title">Chuẩn bị CV cho công việc này</h2></header>
    <div className="job-detail-card__content">
    <p>Kết quả riêng tư, không gửi nhà tuyển dụng và không tạo đơn ứng tuyển. Đây là tham chiếu nội dung CV, không phải điểm phù hợp hoặc dự đoán được tuyển.</p>
    {profileState === 'loading' && <p role="status">Đang tải danh sách CV…</p>}
    {profileState === 'ready' && cvs.length === 0 && <p>Bạn chưa có CV. Hãy tải CV lên và phân tích trong hồ sơ trước khi đối chiếu.</p>}
    <label className="flex min-w-0 flex-col gap-2">Chọn CV <select className="w-full min-w-0 rounded-lg border border-[var(--color-border-default)] bg-[var(--color-surface-card)] p-3" aria-label="Chọn CV" value={cv} disabled={profileState !== 'ready'} onChange={e => {
      sequence.current++
      setCv(e.target.value)
      setResult(null)
      setError('')
      setBusy(false)
    }}>
      <option value="">Chọn CV</option>
      {cvs.map(c => <option key={c.id} value={c.id}>{c.title ?? 'CV'} — {parseStatusLabels[c.parseStatus] ?? 'Chưa sẵn sàng'}</option>)}
    </select></label>
    <Button disabled={busy || !cv || cvs.find(c => c.id === cv)?.parseStatus !== 'PARSED'} onClick={() => void check()}>{busy ? 'Đang đối chiếu…' : 'Kiểm tra CV với công việc này'}</Button>
    <p><a className="font-semibold text-[var(--color-brand-solid)] underline" href="/profile">Kiểm tra/chỉnh hồ sơ và CV</a> · Sau khi cập nhật hoặc phân tích lại CV, hãy đối chiếu lại.</p>
    {error && <p role="alert">{error}</p>}
    {profileState === 'error' && <Button variant="secondary" onClick={() => setProfileAttempt(attempt => attempt + 1)}>Tải lại danh sách CV</Button>}
    {result && <div className="flex flex-col gap-4" aria-live="polite">
      <p>Đối chiếu từ dữ liệu đã phân tích của CV bạn chọn. Hãy kiểm tra dữ liệu gốc nếu nội dung chưa đúng.</p>
      {result.warnings.length > 0 && <div role="status">
        <p>Dữ liệu CV có giới hạn cần kiểm tra:</p>
        <ul className="list-disc pl-5">{[...new Set(result.warnings)].map(warning => <li key={warning}>{warningMessages[warning] ?? 'Một phần dữ liệu CV có giới hạn chưa được mô tả cụ thể. Hãy kiểm tra CV gốc và kết quả phân tích trước khi sử dụng tham chiếu.'}</li>)}</ul>
      </div>}
      {result.requirements.map((r, i) => <article className="flex flex-col gap-2 border-t border-[var(--color-border-subtle)] pt-4" key={i}>
        <h3 className="font-semibold">{r.requirement}</h3>
        <p>{r.status === 'REVIEW_REFERENCES' ? 'Có đoạn tham chiếu để bạn kiểm tra' : 'Chưa tìm thấy đoạn tham chiếu; không đồng nghĩa bạn thiếu năng lực'}</p>
        {r.evidence.map(e => <blockquote className="border-l-2 border-[var(--color-border-default)] pl-3" key={e.id} style={{ whiteSpace: 'pre-wrap' }}>{e.text}</blockquote>)}
        <p>{r.evidence.length ? 'Nếu các đoạn này liên quan, hãy làm rõ dự án, hành động và kết quả thực tế. Không thêm kinh nghiệm hoặc thành tích không có thật.' : 'Nếu bạn có kinh nghiệm liên quan nhưng chưa ghi trong CV, hãy bổ sung bối cảnh thực tế. Không thêm kỹ năng chỉ để khớp JD.'}</p>
      </article>)}
    </div>}
    </div>
  </section>
}
