import axios from 'axios'
import { useEffect, useRef, useState } from 'react'
import { useLocale } from '../../../../i18n'
import { requirementPlanService as api } from '../../../../services/requirement-plan.service'
import type { PlanHistory, PlanInspection, PlannedRequirement } from '../../../../types/requirement-plan.types'
import { samePlanSources, validatePlanEdits } from '../../../../types/requirement-plan.types'
import { planCopy } from './planCopy'
import { RequirementEditor } from './RequirementEditor'
import { usePlanNavigationGuard } from './usePlanNavigationGuard'
import './requirement-plan.css'

// Parent keys this component by jobId. Every request is aborted and invalidated
// on unmount; response parsing independently checks the server job binding.
export function RequirementPlanPanel({ jobId }: { jobId: string }) {
  const { locale } = useLocale()
  const copy = planCopy[locale]
  const [inspection, setInspection] = useState<PlanInspection | null>(null)
  const [rows, setRows] = useState<PlannedRequirement[]>([])
  const [original, setOriginal] = useState<PlannedRequirement[]>([])
  const [recovery, setRecovery] = useState<PlannedRequirement[]>([])
  const [editing, setEditing] = useState(false)
  const [stagedDirty, setStagedDirty] = useState(false)
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<'error' | 'denied' | null>(null)
  const [conflict, setConflict] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const [message, setMessage] = useState<'saved' | 'confirmed' | null>(null)
  const [history, setHistory] = useState<PlanHistory | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyError, setHistoryError] = useState(false)
  const [historyBusy, setHistoryBusy] = useState(false)
  const active = useRef(false)
  const request = useRef<AbortController | null>(null)
  const historyRequest = useRef<AbortController | null>(null)
  const dirty = JSON.stringify(rows) !== JSON.stringify(original)
  const issues = validatePlanEdits(rows, original)
  const blocked = busy || Boolean(error) || conflict || inspection?.status === 'STALE'
  const canEdit = inspection?.status === 'DRAFT' || inspection?.status === 'HR_CONFIRMED'

  function install(next: PlanInspection) {
    setInspection(next)
    const source = structuredClone(next.plan?.requirements ?? [])
    setRows(source); setOriginal(structuredClone(source))
    setEditing(next.status === 'DRAFT'); setReviewed(false); setConflict(false)
  }
  useEffect(() => {
    active.current = true
    const controller = new AbortController()
    request.current = controller
    setBusy(true)
    api.inspect(jobId, controller.signal).then(next => {
      if (active.current && !controller.signal.aborted) install(next)
    }).catch(e => {
      if (active.current && !controller.signal.aborted) setError(axios.isAxiosError(e) && [401, 403, 404].includes(e.response?.status ?? 0) ? 'denied' : 'error')
    }).finally(() => { if (active.current && !controller.signal.aborted) setBusy(false) })
    return () => { active.current = false; controller.abort(); request.current?.abort(); historyRequest.current?.abort() }
  }, [jobId])
  usePlanNavigationGuard(dirty || stagedDirty || recovery.length > 0, copy.leave)

  async function run(action: 'reload' | 'discard' | 'draft' | 'save' | 'confirm') {
    if (busy || (action !== 'reload' && action !== 'discard' && (error || (conflict && action !== 'draft')))) return
    if (action === 'discard' && !window.confirm(copy.leave)) return
    if (action === 'draft' && !['UNPREPARED', 'STALE', 'ASSISTANT_REVIEWED'].includes(inspection?.status ?? '')) return
    if (action === 'draft' && dirty) setRecovery(structuredClone(rows))
    if (action === 'save' && (stagedDirty || !editing || !canEdit || !dirty || issues.length || !inspection?.content_sha256)) return
    if (action === 'confirm' && (stagedDirty || inspection?.status !== 'DRAFT' || dirty || !reviewed || issues.length || !inspection.content_sha256)) return
    const controller = new AbortController()
    request.current?.abort(); request.current = controller
    const alive = () => active.current && !controller.signal.aborted
    setBusy(true); setError(null); setMessage(null); setReviewed(false)
    try {
      const next = (action === 'reload' || action === 'discard') ? await api.inspect(jobId, controller.signal)
        : action === 'draft' ? await api.draft(jobId, inspection?.plan?.revision ?? 0, controller.signal)
        : action === 'save' ? await api.save(jobId, inspection!.content_sha256!, rows, controller.signal)
        : await api.confirm(jobId, inspection!.content_sha256!, controller.signal)
      if (!alive()) return
      if (action === 'reload' && dirty) { setInspection(next); setConflict(true) }
      else { install(next); if (action === 'discard') setRecovery([]) }
      if (action === 'save' || action === 'confirm') setMessage(action === 'save' ? 'saved' : 'confirmed')
      // History is a separate read and must not display a previous revision's log.
      setHistory(null); setHistoryOpen(false); historyRequest.current?.abort(); setHistoryBusy(false)
    } catch (e) {
      if (!alive()) return
      if (axios.isAxiosError(e) && e.response?.status === 409) {
        setConflict(true)
        try { const next = await api.inspect(jobId, controller.signal); if (alive()) setInspection(next) }
        catch { if (alive()) setError('error') }
      } else setError(axios.isAxiosError(e) && [401, 403, 404].includes(e.response?.status ?? 0) ? 'denied' : 'error')
    } finally { if (alive()) setBusy(false) }
  }
  async function showHistory() {
    setHistoryOpen(true); setHistoryBusy(true); setHistoryError(false)
    const controller = new AbortController()
    historyRequest.current?.abort(); historyRequest.current = controller
    try { const value = await api.history(jobId, controller.signal); if (active.current && !controller.signal.aborted) setHistory(value) }
    catch { if (active.current && !controller.signal.aborted) setHistoryError(true) }
    finally { if (active.current && !controller.signal.aborted) setHistoryBusy(false) }
  }
  const sourceCompatible = Boolean(inspection?.plan && samePlanSources(rows, inspection.plan.requirements))
  const readOnly = !editing || blocked || !canEdit
  return <section className="jd-plan recruiter-panel" id="requirement-plan" aria-labelledby="jd-plan-title" aria-busy={busy}>
    <header className="jd-plan__header"><div><p className="jd-plan__eyebrow">{copy.intro}</p><h2 id="jd-plan-title">{copy.title}</h2></div>
      {inspection && <span className={`jd-plan__status jd-plan__status--${inspection.status.toLowerCase()}`}>{copy.states[inspection.status]}</span>}
    </header>
    <details className="jd-plan__guidance"><summary>{copy.helpCriteria}</summary><p>{copy.note}</p><p>{copy.fresh}</p><p className="jd-plan__core-hint">{copy.coreHint}</p></details>
    {inspection?.plan && <p><strong>{copy.revision} {inspection.plan.revision}</strong>{inspection.plan.approval && <span> · {new Date(inspection.plan.approval.approved_at).toLocaleString(locale)}</span>}</p>}
    {busy && <p role="status">{inspection ? copy.busy : copy.loading}</p>}
    {error && <div role="alert" className="jd-plan__notice"><p>{copy[error]}</p><button type="button" disabled={busy} onClick={() => void run('reload')}>{copy.retry}</button></div>}
    {inspection?.status === 'STALE' && <p className="jd-plan__notice" role="status">{copy.stale}</p>}
    {conflict && <div className="jd-plan__notice" role="alert"><p>{copy.conflict}</p>
      {inspection?.plan && <details><summary>{copy.latest}</summary>{inspection.plan.requirements.map(r => <div key={r.requirement_id}><blockquote>{r.original_text}</blockquote>{r.components.map(c => <p key={c.id}>{c.query} — {c.source_quote}</p>)}<p>{copy.all}</p>{r.all_of.map((g, i) => <p key={i}>{copy.group} {i + 1}: {g.map(id => r.components.find(c => c.id === id)?.query).join(' / ')}</p>)}</div>)}</details>}
      {sourceCompatible && canEdit && <button type="button" disabled={busy || Boolean(error)} onClick={() => { setOriginal(structuredClone(inspection!.plan!.requirements)); setEditing(true); setConflict(false); setReviewed(false) }}>{copy.rebase}</button>}
    </div>}
    {message && <p role="status" className="jd-plan__success">{copy[message]}</p>}
    {dirty && <p role="status" className="jd-plan__notice">{copy.unsaved}</p>}
    {editing && !readOnly && issues.length > 0 && <ul className="jd-plan__validation" aria-live="polite">{issues.map(issue => <li key={issue}>{copy.errors[issue]}</li>)}</ul>}
    <div className="jd-plan__actions">
      {(editing || conflict || recovery.length > 0) && <button type="button" disabled={busy} onClick={() => void run('discard')}>{copy.discard}</button>}
      {inspection && ['UNPREPARED', 'STALE', 'ASSISTANT_REVIEWED'].includes(inspection.status) && <button type="button" disabled={busy || Boolean(error)} onClick={() => void run('draft')}>{copy.draft}</button>}
      {inspection?.status === 'HR_CONFIRMED' && !editing && !conflict && <button type="button" disabled={blocked} onClick={() => { setEditing(true); setReviewed(false); setMessage(null) }}>{copy.edit}</button>}
      {editing && canEdit && <button type="button" disabled={blocked || stagedDirty || !dirty || issues.length > 0} onClick={() => void run('save')}>{copy.save}</button>}
    </div>
    {rows.length > 0 && <RequirementEditor onStagedChange={setStagedDirty} rows={rows} readOnly={readOnly} copy={copy} onChange={next => { setRows(next); setReviewed(false); setMessage(null) }} />}
    {inspection?.status === 'DRAFT' && !conflict && <div className="jd-plan__confirm"><label className="jd-plan__check"><input type="checkbox" checked={reviewed} disabled={blocked || stagedDirty || dirty || issues.length > 0} onChange={e => setReviewed(e.target.checked)} /><span>{copy.review}</span></label><button type="button" disabled={blocked || stagedDirty || dirty || !reviewed || issues.length > 0} onClick={() => void run('confirm')}>{copy.confirm}</button></div>}
    {recovery.length > 0 && <details><summary>{copy.retained}</summary>{recovery.map(r => <div key={r.requirement_id}><blockquote>{r.original_text}</blockquote>{r.components.map(c => <p key={c.id}>{c.query} — {c.source_quote} · {copy.importance[c.importance]}</p>)}{r.all_of.map((g, i) => <p key={i}>{copy.group} {i + 1}: {g.map(id => r.components.find(c => c.id === id)?.query).join(' / ')}</p>)}</div>)}</details>}
    {inspection && <details className="jd-plan__technical"><summary>{copy.technical}</summary><p>{inspection.plan?.job_id}</p><p>{inspection.content_sha256}</p>{rows.map(r => <p key={r.requirement_id}>{r.requirement_id}: {r.components.map(c => c.id).join(', ')}</p>)}</details>}
    <div className="jd-plan__history"><button type="button" disabled={busy || historyBusy || error === 'denied'} onClick={() => void showHistory()}>{copy.history}</button>
      {historyOpen && <div>{historyBusy ? <p role="status">{copy.loading}</p> : historyError ? <p role="alert">{copy.error}</p> : history && <><ul>{history.revisions.map(row => <li key={row.id}>{copy.revision} {row.revision} · {new Date(row.createdAt).toLocaleString(locale)} · {row.document.approval ? copy.states.HR_CONFIRMED : copy.states.DRAFT}</li>)}</ul><ul>{history.events.map(e => <li key={e.id}>{copy.events[e.action]} · {new Date(e.createdAt).toLocaleString(locale)}</li>)}</ul>{!history.revisions.length && <p>{copy.historyEmpty}</p>}</>}</div>}
    </div>
  </section>
}