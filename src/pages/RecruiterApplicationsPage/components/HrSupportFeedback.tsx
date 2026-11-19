import { useState } from 'react'
import { z } from 'zod'
import './hr-support-feedback.css'

const hash = z.string().regex(/^[a-f0-9]{64}$/)
export const supportTarget = 'requirement-textual-support-v1' as const
export const supportLabels = { SUPPORTED: 'Có bằng chứng hỗ trợ', PARTIAL: 'Hỗ trợ một phần', CONTRADICTED: 'Có bằng chứng trái ngược', INSUFFICIENT_CONTEXT: 'Chưa đủ ngữ cảnh' } as const
export const supportJudgmentSchema = z.object({
  targetVersion: z.literal(supportTarget), label: z.enum(['SUPPORTED', 'PARTIAL', 'CONTRADICTED', 'INSUFFICIENT_CONTEXT']), evidenceIds: z.array(z.string()).max(3), rationale: z.string(), uncertain: z.boolean(),
  binding: z.object({ resultId: z.string(), jobSnapshotSha256: hash, candidateSnapshotSha256: hash, planContentSha256: hash.nullable(), retrievalModelVersion: z.string(), verifierModelVersion: z.string().nullable(), assessmentSource: z.string().nullable(), requirementTextSha256: hash, evidenceTextSha256: hash, sourceScope: z.literal('RETRIEVED_EVIDENCE_ONLY'), planStateScope: z.literal('AT_MATCHING_TIME'), currentPlanRevalidated: z.literal(false), freshness: z.literal('SNAPSHOT_AT_CHECK_TIME') }),
  submission: z.object({ submittedBy: z.string().min(1), submittedAt: z.string(), submittedRevision: z.number().int().positive(), contentSha256: hash }),
  workflow: z.object({ state: z.enum(['SUBMITTED', 'HOLD', 'REVIEWED']), holdReasons: z.array(z.string()), checkedAt: z.string(), approvalResetReason: z.literal('WORKSPACE_REVISION_CHANGED').optional(), review: z.object({ reviewedBy: z.string(), reviewedAt: z.string(), reviewedRevision: z.number().int(), submittedRevision: z.number().int(), submittedContentSha256: hash, decision: z.enum(['APPROVE', 'HOLD']), reason: z.string() }).optional() }),
})
export const readinessSchema = z.object({ success: z.literal(true), data: z.object({ schemaVersion: z.literal('support-export-readiness-v1'), targetVersion: z.literal(supportTarget), workspaceRevision: z.number().int(), checkedAt: z.string(), optIn: z.literal(true), exportAllowed: z.literal(false), rows: z.array(z.never()).length(0), isTrainingLabel: z.literal(false), hiringDecision: z.null(), bindingScope: z.literal('LATEST_MATCHING_RESULT'), planStateScope: z.literal('AT_MATCHING_TIME'), currentPlanRevalidated: z.literal(false), freshness: z.literal('SNAPSHOT_AT_CHECK_TIME'), stale: z.boolean(), freshnessUnavailable: z.boolean(), counts: z.object({ judgments: z.number(), reviewed: z.number(), reviewExcluded: z.number(), sourceExcluded: z.number(), excluded: z.number(), eligible: z.literal(0), exported: z.literal(0) }), reasons: z.array(z.string()) }) })
export type SupportJudgment = z.infer<typeof supportJudgmentSchema>
export type SupportDraft = Pick<SupportJudgment, 'label' | 'evidenceIds' | 'rationale' | 'uncertain'> & { requirementId: string }
export type SupportAction = { route: 'support-judgments'; judgments: SupportDraft[] } | { route: 'support-review'; decision: 'APPROVE' | 'HOLD'; reason: string } | { route: 'support-export-readiness' }
export type SupportReadiness = z.infer<typeof readinessSchema>['data']
type Source = { requirementId: string; text: string; evidence: { evidenceId: string; text: string; source: string }[] }

export function HrSupportFeedback({ sources, rows, userId, revision, disabled, onDirty, onSubmit, readiness }: { sources: Source[]; rows: { requirementId: string; supportJudgment?: SupportJudgment }[]; userId?: string; revision: number; disabled: boolean; onDirty: (dirty: boolean) => void; onSubmit: (action: SupportAction) => Promise<void>; readiness: SupportReadiness | null }) {
  const [drafts, setDrafts] = useState<SupportDraft[]>([])
  const [reason, setReason] = useState('')
  const [optIn, setOptIn] = useState(false)
  const [error, setError] = useState('')
  const saved = rows.filter(row => row.supportJudgment)
  const selfReview = saved.some(row => row.supportJudgment!.submission.submittedBy === userId)
  const reviewBlocked = disabled || !userId || !saved.length || selfReview || drafts.length > 0
  const approveBlocked = reviewBlocked || saved.some(row => row.supportJudgment!.workflow.state !== 'SUBMITTED' || row.supportJudgment!.uncertain || row.supportJudgment!.label === 'INSUFFICIENT_CONTEXT')
  function edit(requirementId: string, update: Partial<SupportDraft>) {
    setDrafts(current => {
      const existing = current.find(row => row.requirementId === requirementId)
      const stored = rows.find(row => row.requirementId === requirementId)?.supportJudgment
      const draft: SupportDraft = existing ?? { requirementId, label: stored?.label ?? 'INSUFFICIENT_CONTEXT', evidenceIds: stored?.evidenceIds ?? [], rationale: stored?.rationale ?? '', uncertain: stored?.uncertain ?? true }
      return [...current.filter(row => row.requirementId !== requirementId), { ...draft, ...update }]
    })
    onDirty(true); setError('')
  }
  function submitDrafts() {
    if (drafts.some(row => !row.rationale.trim() || (row.label !== 'INSUFFICIENT_CONTEXT' && !row.evidenceIds.length))) {
      setError('Mỗi phản hồi cần lý do. Chọn ít nhất một đoạn bằng chứng cho nhãn hỗ trợ, một phần hoặc trái ngược.'); return
    }
    void onSubmit({ route: 'support-judgments', judgments: drafts })
  }
  return <section className="hr-support" aria-label="Phản hồi bằng chứng">
    <h3>Phản hồi bằng chứng từng yêu cầu</h3>
    <p>Chỉ ghi nhận mức hỗ trợ trong văn bản CV. Thiếu thông tin không có nghĩa ứng viên thiếu năng lực. Phản hồi không phải điểm phù hợp, quyết định tuyển dụng hay nhãn huấn luyện.</p>
    <p>Ghi chú và phản hồi dùng chung phiên bản lưu. Hãy lưu hoặc bỏ bản nháp đang sửa trước khi chuyển phần.</p>
    {error && <p role="alert">{error}</p>}
    <fieldset disabled={disabled || !!reason.trim()}><legend>Gửi phản hồi</legend>
      {sources.map(source => {
        const stored = rows.find(row => row.requirementId === source.requirementId)?.supportJudgment
        const draft = drafts.find(row => row.requirementId === source.requirementId)
        const value = draft ?? stored
        return <details key={source.requirementId} className="hr-support__requirement">
          <summary>{source.text}{stored ? ` — ${stored.workflow.state === 'HOLD' ? 'Tạm giữ' : stored.workflow.state === 'REVIEWED' && stored.workflow.review?.reviewedRevision === revision ? 'Đã được HR khác duyệt' : 'Chờ HR khác xem lại'}` : ' — Chưa gửi phản hồi'}</summary>
          {stored && <div className="hr-support__saved"><p>Đã lưu: {supportLabels[stored.label]}{stored.uncertain ? ' · Còn băn khoăn' : ''}</p><p>Lý do đã lưu: {stored.rationale}</p><p>Người gửi: {stored.submission.submittedBy === userId ? 'Bạn' : 'HR khác'} · Phiên bản gửi {stored.submission.submittedRevision} · {new Date(stored.submission.submittedAt).toLocaleString('vi-VN')}</p>{stored.workflow.approvalResetReason && <p>Ghi chú đã thay đổi; cần HR khác xem lại ở phiên bản mới.</p>}{stored.workflow.review && <p>HR xem lại: {stored.workflow.review.reviewedBy === userId ? 'Bạn' : 'HR khác'} · {stored.workflow.review.reason}</p>}<p>Đối chiếu theo dữ liệu lúc chạy; chưa kiểm tra lại JD hiện tại.</p></div>}
          <label>Mức hỗ trợ: {source.text}<select aria-label={`Mức hỗ trợ: ${source.text}`} value={value?.label ?? ''} onChange={e => edit(source.requirementId, { label: e.target.value as SupportDraft['label'] })}><option value="" disabled>Chọn mức hỗ trợ</option>{Object.entries(supportLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
          <div className="hr-support__evidence"><p>Chọn đoạn làm căn cứ (tối đa 3):</p>{source.evidence.filter((hit, i, all) => all.findIndex(item => item.evidenceId === hit.evidenceId) === i).map(hit => <label key={hit.evidenceId}><input type="checkbox" checked={value?.evidenceIds.includes(hit.evidenceId) ?? false} disabled={!value?.evidenceIds.includes(hit.evidenceId) && (value?.evidenceIds.length ?? 0) >= 3} onChange={e => edit(source.requirementId, { evidenceIds: e.target.checked ? [...(value?.evidenceIds ?? []), hit.evidenceId] : (value?.evidenceIds ?? []).filter(id => id !== hit.evidenceId) })} /><span>{hit.text} <small>({hit.source})</small></span></label>)}{!source.evidence.length && <p>Chưa có đoạn bằng chứng cho yêu cầu này. Bạn có thể ghi nhận chưa đủ ngữ cảnh.</p>}</div>
          <label>Lý do phản hồi: {source.text}<textarea aria-label={`Lý do phản hồi: ${source.text}`} maxLength={2000} value={value?.rationale ?? ''} onChange={e => edit(source.requirementId, { rationale: e.target.value })} /></label>
          <label className="hr-support__check"><input type="checkbox" checked={value?.uncertain ?? true} onChange={e => edit(source.requirementId, { uncertain: e.target.checked })} />Tôi còn băn khoăn về phản hồi này</label>
          {(value?.uncertain || value?.label === 'INSUFFICIENT_CONTEXT') && <p>Phản hồi này sẽ được tạm giữ để làm rõ thêm.</p>}
        </details>
      })}
      <button type="button" disabled={!drafts.length} onClick={submitDrafts}>Gửi phản hồi bằng chứng</button>
      <button type="button" disabled={!drafts.length} onClick={() => { setDrafts([]); onDirty(false); setError('') }}>Bỏ thay đổi phản hồi</button>
    </fieldset>
    <fieldset disabled={reviewBlocked}><legend>HR khác xem lại</legend>
      <p>Xem lại toàn bộ phản hồi đã gửi ở phiên bản {revision}. Mỗi người phải khác người gửi phản hồi.</p>
      <label>Lý do xem lại<textarea maxLength={2000} value={reason} onChange={e => { setReason(e.target.value); onDirty(!!e.target.value.trim()); setError('') }} /></label>
      <button type="button" disabled={approveBlocked || !reason.trim()} onClick={() => void onSubmit({ route: 'support-review', decision: 'APPROVE', reason })}>Duyệt phản hồi</button>
      <button type="button" disabled={!reason.trim()} onClick={() => void onSubmit({ route: 'support-review', decision: 'HOLD', reason })}>Tạm giữ phản hồi</button>
      <button type="button" disabled={!reason} onClick={() => { setReason(''); onDirty(false) }}>Bỏ lý do xem lại</button>
    </fieldset>
    {selfReview && <p>Bạn đã gửi ít nhất một phản hồi trong phiếu này. Một HR khác cần xem lại.</p>}
    {!selfReview && saved.some(row => row.supportJudgment!.workflow.state === 'HOLD') && <p>Phản hồi đang tạm giữ cần được gửi lại sau khi làm rõ trước khi duyệt.</p>}
    <fieldset disabled={disabled || !saved.length || drafts.length > 0 || !!reason.trim()}><legend>Kiểm tra điều kiện sử dụng phản hồi</legend>
      <label className="hr-support__check"><input type="checkbox" checked={optIn} onChange={e => setOptIn(e.target.checked)} />Tôi đồng ý yêu cầu kiểm tra điều kiện sử dụng phản hồi.</label>
      <button type="button" disabled={!optIn} onClick={() => void onSubmit({ route: 'support-export-readiness' })}>Kiểm tra điều kiện</button>
    </fieldset>
    {readiness && <div role="status"><p>Chưa được phép xuất hoặc dùng làm dữ liệu huấn luyện. Không có dòng dữ liệu nào được xuất.</p><p>Đã xem lại: {readiness.counts.reviewed}/{readiness.counts.judgments} phản hồi. Quyền sử dụng nguồn, thời hạn lưu và tình trạng CV chưa được xác minh đầy đủ.</p>{(readiness.stale || readiness.freshnessUnavailable) && <p>Nguồn đã thay đổi hoặc chưa xác minh được; cần tải lại.</p>}<p>Kết quả kiểm tra tại thời điểm {new Date(readiness.checkedAt).toLocaleString('vi-VN')}; chưa kiểm tra lại JD hiện tại.</p></div>}
  </section>
}
