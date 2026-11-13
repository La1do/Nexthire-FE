import { useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { apiClient } from '../../../lib/api'
import type { HrReview } from '../../../types/hr-review.types'
import { InterviewConfirmDialog } from './InterviewConfirmDialog'
import { usePlanNavigationGuard } from '../../RecruiterJobsPage/components/requirement-plan/usePlanNavigationGuard'
import type { JumpToPdfPayload } from './ai1/Ai1EvidenceView'

const rowSchema = z.object({ requirementId: z.string(), status: z.enum(['UNREVIEWED', 'REVIEWED', 'CLARIFY', 'NOT_FOUND']), note: z.string(), evidenceIds: z.array(z.string()) })
const questionSchema = z.object({ id: z.string(), requirementId: z.string().nullable().optional(), question: z.string(), answer: z.string(), note: z.string() })
const documentSchema = z.object({ sourceRequirements: z.array(z.object({ requirementId: z.string(), text: z.string(), evidence: z.array(z.object({ evidenceId: z.string(), text: z.string(), source: z.string() })) })), applicationId: z.string(), revision: z.number().int(), resultId: z.string(), jobSnapshotSha256: z.string(), candidateSnapshotSha256: z.string(), requirements: z.array(rowSchema), questions: z.array(questionSchema), interviewStatus: z.enum(['DRAFT', 'COMPLETED']), reviewerId: z.string(), updatedAt: z.string() })
const envelopeSchema = z.object({ success: z.literal(true), data: z.object({ schemaVersion: z.literal('hr-workspace-v1'), document: documentSchema.nullable(), stale: z.boolean(), freshnessUnavailable: z.boolean().optional(), bindingScope: z.literal('LATEST_MATCHING_RESULT'), isTrainingLabel: z.literal(false), hiringDecision: z.null() }) })
type Row = z.infer<typeof rowSchema>
type Question = z.infer<typeof questionSchema>
const templates = [
  ['Vai trò & dự án', 'Hãy mô tả một dự án gần đây, vai trò trực tiếp của bạn và kết quả đạt được.'],
  ['Tình huống thực tế', 'Một vấn đề khó bạn từng xử lý là gì? Bạn đã tìm nguyên nhân và giải quyết như thế nào?'],
  ['Cách làm việc', 'Bạn phối hợp với đồng đội và xử lý bất đồng trong công việc như thế nào?'],
] as const

export function HrReviewNotebook({ applicationId, review, onLocate, reviewAvailable = true, candidateName = 'Chưa có tên ứng viên', jobTitle = 'Chưa có tên vị trí' }: { applicationId: string; review: HrReview; onLocate: (target: JumpToPdfPayload) => void; reviewAvailable?: boolean; candidateName?: string; jobTitle?: string }) {
  const [rows, setRows] = useState<Row[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [revision, setRevision] = useState(0)
  const [status, setStatus] = useState<'DRAFT' | 'COMPLETED'>('DRAFT')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stale, setStale] = useState(false)
  const [freshnessUnavailable, setFreshnessUnavailable] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [oldSources, setOldSources] = useState<z.infer<typeof documentSchema>['sourceRequirements']>([])
  const [loaded, setLoaded] = useState(false)
  const [requirementSearch, setRequirementSearch] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [confirmation, setConfirmation] = useState<{ message: string; action: () => void } | null>(null)
  function confirmAction(message: string, action: () => void) { setConfirmation({ message, action }) }
  const generation = useRef(0)
  const editVersion = useRef(0)
  const dirtyRef = useRef(dirty)
  dirtyRef.current = dirty
  const binding = `${review.resultId}:${review.jobSnapshotSha256}:${review.candidateSnapshotSha256}`
  const previousBinding = useRef(binding)
  useEffect(() => {
    const bindingChanged = previousBinding.current !== binding
    previousBinding.current = binding
    setSaving(false)
    if (bindingChanged && dirtyRef.current) {
      setLoading(false)
      setStale(true)
      setError('Kết quả đối chiếu đã thay đổi. Bản nháp được giữ nguyên; bạn có thể in hoặc sao chép trước khi tạo phiếu mới.')
      return
    }
    const run = ++generation.current
    setLoading(true); setLoaded(false); setError(''); setDirty(false)
    apiClient.get(`/recruiter/applications/${applicationId}/review-workspace`).then(response => {
      const data = envelopeSchema.parse(response.data).data
      if (generation.current !== run) return
      if (data.document && data.document.applicationId !== applicationId) throw new Error('Wrong application')
      const doc = data.document
      const outdated = data.stale || !!doc && (doc.resultId !== review.resultId || doc.jobSnapshotSha256 !== review.jobSnapshotSha256 || doc.candidateSnapshotSha256 !== review.candidateSnapshotSha256)
      setRevision(doc?.revision ?? 0); setRows(doc?.requirements ?? []); setQuestions(doc?.questions ?? [])
      setStatus(doc?.interviewStatus ?? 'DRAFT'); setSavedAt(doc?.updatedAt ?? ''); setStale(outdated)
      setFreshnessUnavailable(data.freshnessUnavailable === true)
      setOldSources(doc?.sourceRequirements ?? structuredClone(review.requirements)); setLoaded(true)
    }).catch(() => { if (generation.current === run) setError('Không tải được phiếu phỏng vấn. Thử lại; không ghi đè dữ liệu đã lưu.') })
      .finally(() => { if (generation.current === run) setLoading(false) })
    return () => { generation.current = run + 1 }
  }, [applicationId, review.resultId, review.jobSnapshotSha256, review.candidateSnapshotSha256, binding, attempt])
  usePlanNavigationGuard(dirty, 'Phiếu có nội dung chưa lưu. Rời đi và bỏ thay đổi?')
  function printSheet() {
    const popup = window.open('', '_blank', 'width=900,height=700')
    if (!popup) { setError('Trình duyệt chặn cửa sổ in. Cho phép popup để in phiếu.'); return }
    popup.opener = null
    const escape = (text: string) => text.replace(/[&<>"']/g, value => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[value]!))
    const sources = oldSources
    popup.document.write(`<html lang="vi"><head><meta charset="utf-8"><title>Phiếu phỏng vấn — ${escape(candidateName)}</title><style>
      @page{size:A4;margin:18mm 17mm}*{box-sizing:border-box}body{font:11pt/1.6 Arial,sans-serif;color:#182230;margin:0;min-height:250mm;display:flex;flex-direction:column}header,article,footer{flex-shrink:0}h1{text-align:center;font-size:20pt;letter-spacing:1px;margin:0 0 8mm}.identity{padding:5mm;border:1px solid #cbd5e1;border-radius:2mm;margin-bottom:7mm}.identity p{margin:1mm 0}article{margin:0 0 6mm;break-inside:avoid}h2{font-size:12pt;margin:0 0 3mm}p{white-space:pre-wrap;overflow-wrap:anywhere}.context{font-size:10pt;color:#475569}.field{margin:2mm 0}.field strong{font-size:10pt}.writing-space{height:22mm;border-bottom:1px solid #cbd5e1;background:repeating-linear-gradient(transparent,transparent 7mm,#e2e8f0 7.2mm)}footer{margin-top:auto;border-top:1px solid #cbd5e1;padding-top:3mm;text-align:right;font-size:9pt;color:#64748b}footer p{margin:0}header,footer{break-inside:avoid}
      </style></head><body><header><h1>PHIẾU PHỎNG VẤN</h1><div class="identity"><p><strong>Ứng viên:</strong> ${escape(candidateName)}</p><p><strong>Vị trí / JD:</strong> ${escape(jobTitle)}</p><p><strong>Ngày phỏng vấn:</strong> …… / …… / ………… &nbsp; <strong>Người phỏng vấn:</strong> …………………………</p></div></header>${questions.map((q, i) => `<article><h2>${i + 1}. ${escape(q.question)}</h2>${q.requirementId ? `<p class="context">Yêu cầu liên quan: ${escape(sources.find(s => s.requirementId === q.requirementId)?.text ?? '')}</p>` : ''}<div class="field"><strong>Câu trả lời / ghi nhận</strong>${q.answer.trim() ? `<p>${escape(q.answer)}</p>` : '<div class="writing-space"></div>'}</div><div class="field"><strong>Nhận xét</strong>${q.note.trim() ? `<p>${escape(q.note)}</p>` : '<div class="writing-space"></div>'}</div></article>`).join('')}<footer><p>${dirty || !savedAt ? 'BẢN NHÁP CHƯA LƯU' : status === 'DRAFT' ? 'BẢN NHÁP' : 'ĐÃ HOÀN TẤT'}${stale ? ' · Theo kết quả đối chiếu cũ' : ''}</p><p>Phiên bản ${revision} · ${escape(new Date().toLocaleDateString('vi-VN'))}</p></footer></body></html>`)

    popup.document.close(); popup.focus(); popup.print()
  }
  useEffect(() => {
    const guard = (event: Event) => {
      if (dirty) {
        event.preventDefault()
        window.dispatchEvent(new Event('hr-workspace-reveal'))
        const proceed = (event as CustomEvent<{ proceed?: () => void }>).detail?.proceed
        confirmAction('Phiếu có nội dung chưa lưu. Rời đi và bỏ thay đổi?', () => proceed?.())
      }
    }
    window.addEventListener('hr-workspace-before-leave', guard)
    return () => window.removeEventListener('hr-workspace-before-leave', guard)
  }, [dirty])
  function changed() { editVersion.current++; setDirty(true); setError('') }
  function updateQuestion(id: string, update: Partial<Question>) { setQuestions(current => current.map(q => q.id === id ? { ...q, ...update } : q)); changed() }
  async function save() {
    if (saving || stale || freshnessUnavailable || !reviewAvailable || !loaded || loading) return
    if (questions.some(q => !q.question.trim())) { setError('Hãy nhập nội dung cho các câu hỏi còn trống hoặc xóa câu không sử dụng.'); return }
    if (status === 'COMPLETED' && (!questions.length || questions.some(q => !q.answer.trim()))) { setError('Để hoàn tất phiếu, hãy ghi câu trả lời cho từng câu hỏi. Bạn vẫn có thể lưu bản nháp.'); return }
    const run = generation.current, edits = editVersion.current
    setSaving(true); setError('')
    try {
      const response = await apiClient.post(`/recruiter/applications/${applicationId}/review-workspace`, {
        expectedRevision: revision, resultId: review.resultId, jobSnapshotSha256: review.jobSnapshotSha256,
        candidateSnapshotSha256: review.candidateSnapshotSha256, requirements: rows, questions, interviewStatus: status,
      })
      const data = envelopeSchema.parse(response.data).data
      if (generation.current !== run) return
      if (!data.document || data.document.applicationId !== applicationId || data.document.resultId !== review.resultId) throw new Error('Wrong saved binding')
      setRevision(data.document.revision); setSavedAt(data.document.updatedAt)
      if (editVersion.current === edits) setDirty(false)
    } catch (cause: unknown) {
      if (generation.current !== run) return
      const code = (cause as { response?: { status?: number } }).response?.status
      setError(code === 409 ? 'Dữ liệu đã thay đổi hoặc người khác vừa lưu. Nội dung của bạn vẫn ở đây; sao chép trước khi tải lại.' : 'Không lưu được. Kiểm tra câu hỏi/câu trả lời và thử lại; nội dung chưa bị xóa.')
    } finally { if (generation.current === run) setSaving(false) }
  }
  function addQuestion(requirementId?: string, text?: string) {
    if (questions.length >= 30) return
    setQuestions(current => [...current, { id: crypto.randomUUID(), requirementId: requirementId ?? null,
      question: text ?? '', answer: '', note: '' }]); changed()
  }
  if (loading) return <p role="status">Đang tải phiếu phỏng vấn…</p>
  const blocked = stale || freshnessUnavailable || !reviewAvailable || !loaded
  return <section className="hr-notebook" aria-label="Phiếu phỏng vấn">
    <header><h3>Chuẩn bị phỏng vấn</h3><p>Đọc CV bên cạnh, ghi nhanh điều cần hỏi. Không cần đánh giá từng yêu cầu.</p></header>
    {(freshnessUnavailable || !reviewAvailable) && <p role="alert">Chưa xác minh được độ mới của kết quả đối chiếu. Nội dung được giữ để đọc/in; tạm khóa chỉnh sửa và lưu.</p>}
    {error && <div role="alert">{error} <button type="button" onClick={() => { if (!dirty) setAttempt(v => v + 1); else confirmAction('Tải lại sẽ bỏ nội dung chưa lưu. Tiếp tục?', () => setAttempt(v => v + 1)) }}>Tải lại bản đã lưu</button></div>}
    {stale && <div role="alert"><p>Phiếu thuộc kết quả đối chiếu cũ. Nội dung vẫn được giữ để tham khảo.</p><button type="button" onClick={() => { confirmAction('Tạo phiếu cho kết quả mới? Bản cũ vẫn được giữ trong lịch sử.', () => { setRows([]); setQuestions([]); setStatus('DRAFT'); setOldSources(structuredClone(review.requirements)); setSaving(false); setStale(false); changed() }) }}>Tạo phiếu cho kết quả mới</button></div>}
    <div className="hr-notebook__savebar"><span role="status">{saving ? 'Đang lưu…' : dirty ? 'Có thay đổi chưa lưu' : savedAt ? `Đã lưu lúc ${new Date(savedAt).toLocaleString('vi-VN')}` : 'Chưa có bản lưu'}</span><div><button type="button" disabled={saving || blocked || !dirty} onClick={() => void save()}>Lưu phiếu</button><button type="button" disabled={!loaded} onClick={printSheet}>In / lưu PDF</button></div></div>
    {confirmation && <InterviewConfirmDialog message={confirmation.message} onCancel={() => setConfirmation(null)} onConfirm={() => { const action = confirmation.action; setConfirmation(null); action() }} />}
    <fieldset disabled={blocked || saving} className="hr-notebook__fields">
      <legend className="sr-only">Soạn câu hỏi phỏng vấn</legend>
      <div className="hr-notebook__templates"><strong>Thêm nhanh từ mẫu</strong><div>{templates.map(([label, text]) => <button key={label} type="button" disabled={questions.length >= 30} onClick={() => addQuestion(undefined, text)}>+ {label}</button>)}</div>
        <button type="button" aria-expanded={pickerOpen} onClick={() => setPickerOpen(value => !value)}>Hỏi theo yêu cầu JD {pickerOpen ? '−' : '+'}</button>
        {pickerOpen && <div className="hr-notebook__requirement-picker">
          <label>Tìm yêu cầu JD<input type="search" value={requirementSearch} placeholder="Tìm theo từ khóa, ví dụ Node.js…" onChange={e => setRequirementSearch(e.target.value)} /></label>
          <div className="hr-notebook__requirement-results" role="region" aria-label="Yêu cầu để thêm câu hỏi" tabIndex={0}>
            {review.requirements.filter(req => req.text.toLocaleLowerCase().includes(requirementSearch.trim().toLocaleLowerCase())).map(req => <div key={req.requirementId}><p>{req.text}</p><button type="button" disabled={questions.length >= 30} aria-label={`Thêm câu hỏi: ${req.text}`} onClick={() => { addQuestion(req.requirementId, `Bạn có thể mô tả kinh nghiệm thực tế với “${req.text.slice(0, 400)}”, vai trò và kết quả của bạn?`); setPickerOpen(false) }}>+ Hỏi</button></div>)}
            {!review.requirements.some(req => req.text.toLocaleLowerCase().includes(requirementSearch.trim().toLocaleLowerCase())) && <p>Không có yêu cầu phù hợp.</p>}
          </div>
        </div>}

      </div>
      {questions.length === 0 && <p className="hr-notebook__empty">Chưa có câu hỏi. Chọn một mẫu ở trên hoặc thêm câu hỏi riêng — không bắt buộc điền biểu mẫu.</p>}
      {questions.map((q, index) => <article key={q.id}>
        <div className="hr-notebook__question-heading"><strong>Câu {index + 1}</strong><div><button type="button" disabled={index === 0} onClick={() => { setQuestions(current => { const copy = [...current]; [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]]; return copy }); changed() }} aria-label={`Đưa câu ${index + 1} lên`}>↑</button><button type="button" onClick={() => { confirmAction(`Xóa câu ${index + 1}? Câu hỏi, câu trả lời và nhận xét của câu này sẽ bị xóa khỏi phiếu khi bạn lưu.`, () => { setQuestions(current => current.filter(x => x.id !== q.id)); changed() }) }}>Xóa câu</button></div></div>
        {q.requirementId && <div className="hr-notebook__context">
          <p>{oldSources.find(r => r.requirementId === q.requirementId)?.text}</p>
          {!stale && reviewAvailable && !freshnessUnavailable && oldSources.find(r => r.requirementId === q.requirementId)?.evidence.map((hit, hitIndex) => <button key={`${hit.evidenceId}:${hitIndex}`} type="button" onClick={() => onLocate({ phrase: hit.text, snippetText: hit.text, source: hit.source, sourceSection: hit.source })}>Soi đoạn {hitIndex + 1} trên PDF</button>)}
        </div>}
        <label>Câu hỏi<textarea aria-label="Câu hỏi" rows={2} maxLength={1000} value={q.question} onChange={e => updateQuestion(q.id, { question: e.target.value })} /></label>
        <label>Câu trả lời / ghi nhận phỏng vấn<textarea rows={3} maxLength={4000} placeholder="Ghi nhanh khi trao đổi…" value={q.answer} onChange={e => updateQuestion(q.id, { answer: e.target.value })} /></label>
        <details><summary>Nhận xét thêm</summary><label>Nhận xét người phỏng vấn<textarea maxLength={2000} value={q.note} onChange={e => updateQuestion(q.id, { note: e.target.value })} /></label></details>
      </article>)}
      <button type="button" disabled={questions.length >= 30} onClick={() => addQuestion()}>+ Thêm câu hỏi riêng</button>
      <label>Trạng thái phiếu<select value={status} onChange={e => { setStatus(e.target.value as typeof status); changed() }}><option value="DRAFT">Đang chuẩn bị / bản nháp</option><option value="COMPLETED">Hoàn tất ghi nhận</option></select></label>
    </fieldset>
    {stale && questions.map(q => <article key={q.id}><h4>{q.question}</h4><p>{q.answer}</p><p>{q.note}</p></article>)}
  </section>
}
