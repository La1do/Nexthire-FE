import { useState } from 'react'
import type { HrEvidence, HrReview } from '../../../../types/hr-review.types'
import type { Ai1Copy } from './ai1Copy'
import './ai1-evidence-panel.css'

export type Ai1ViewState =
  | { status: 'loading' }
  | { status: 'error'; kind: 'error' | 'forbidden' | 'invalid' }
  | { status: 'loaded'; review: HrReview | null }
type Props = { state: Ai1ViewState; copy: Ai1Copy; isMatching: boolean; onRefresh: () => void }
const generalCodes = new Set(['RETRIEVAL_IS_NOT_ENTAILMENT', 'PAIR_THRESHOLD_NOT_RETRIEVAL_CALIBRATED'])
function Warnings({ codes, copy }: { codes: string[]; copy: Ai1Copy }) {
  const specific = [...new Set(codes)].filter(code => !generalCodes.has(code))
  if (!specific.length) return null
  return <div className="ai1-evidence__warnings">{specific.map(code => Object.hasOwn(copy.warningText, code)
    ? <p className="ai1-evidence__notice" key={code}>{copy.warningText[code as keyof Ai1Copy['warningText']]}</p>
    : <p className="ai1-evidence__notice" key={code}>{copy.unknownNotice}</p>)}</div>
}
function sourceLabel(hit: HrEvidence, copy: Ai1Copy) {
  const id = hit.evidenceId
  if ((hit.source.toLowerCase() === 'project' || /^projects?\//.test(id)) && /\/technologies\/\d+$/.test(id)) return copy.sources.technology
  if (id === 'profile/summary') return copy.sources.summary
  if (id === 'profile/headline') return copy.sources.headline
  const section = hit.source.toLowerCase()
  if (Object.hasOwn(copy.sources, section)) return copy.sources[section as keyof Ai1Copy['sources']]
  const pathSection = id.split('/')[0]
  const sections: Record<string, keyof Ai1Copy['sources']> = { profile: 'profile', skill: 'skill', skills: 'skill', experience: 'experience', experiences: 'experience', project: 'project', projects: 'project', education: 'education', educations: 'education', certification: 'certification', certifications: 'certification' }
  return copy.sources[sections[pathSection] ?? 'unknown']
}
function Evidence({ items, copy }: { items: HrEvidence[]; copy: Ai1Copy }) {
  const [selected, setSelected] = useState(0)
  const groups: Array<Array<{ hit: HrEvidence; rank: number }>> = []
  items.forEach((hit, index) => {
    const group = groups.find(group => group[0].hit.text === hit.text)
    if (group) group.push({ hit, rank: index + 1 }); else groups.push([{ hit, rank: index + 1 }])
  })
  const group = groups[selected] ?? groups[0]
  if (!group) return <p>{copy.noEvidence}</p>
  const hit = group[0].hit
  return <div className="ai1-evidence__passages">
    <h5>{copy.evidence}</h5>
    <p className="ai1-evidence__metadata">{copy.originNote}</p>
    <div className="ai1-evidence__passage-nav" aria-label={copy.evidence}>{groups.map((group, index) =>
      <button type="button" key={group[0].rank} aria-pressed={selected === index} onClick={() => setSelected(index)}>{copy.passage} {group.map(item => item.rank).join(' / ')}{group.some(item => item.hit.reasonCodes?.some(code => !generalCodes.has(code))) && <span className="ai1-evidence__warning-badge"> · {copy.warnings}</span>}</button>)}</div>
    <div className="ai1-evidence__quote" key={group[0].rank}>
      <div className="ai1-evidence__quote-heading"><span className="ai1-evidence__source">{[...new Set(group.map(item => sourceLabel(item.hit, copy)))].join(' · ')}</span><span className="ai1-evidence__metadata">{copy.similarity} <strong>{hit.similarityScore.toFixed(1)} / 100</strong></span></div>
      {group.length > 1 && <p className="ai1-evidence__duplicate">{copy.duplicate} {group.length} {copy.positions}</p>}
      <Warnings codes={group.flatMap(item => item.hit.reasonCodes ?? [])} copy={copy} />
      {hit.text.length > 650 ? <><blockquote>{hit.text.slice(0, 650)}…</blockquote><details className="ai1-evidence__full"><summary>{copy.fullQuote}</summary><blockquote>{hit.text}</blockquote></details></> : <blockquote>{hit.text}</blockquote>}
      <details className="ai1-evidence__sources" open><summary>{copy.cvSources}</summary><ul>{group.map(({ hit, rank }) => <li key={`${rank}:${hit.evidenceId}`}>{group.length > 1 && <strong>{sourceLabel(hit, copy)}</strong>}<span>{copy.rank}: {rank}{group.length > 1 && <> · {copy.similarity}: {hit.similarityScore.toFixed(1)} / 100</>}</span></li>)}</ul></details>
      <details className="ai1-evidence__provenance"><summary>{copy.technical}</summary>{group.map(({ hit, rank }) => <dl key={`${rank}:${hit.evidenceId}`}><dt>{copy.passage} {rank} · {sourceLabel(hit, copy)}</dt><dd>{copy.source}: {hit.source}</dd><dd>ID: {hit.evidenceId}</dd><dd>{copy.similarity}: {hit.similarityScore} / 100</dd><dd>{(hit.reasonCodes ?? []).join(' · ')}</dd></dl>)}</details>
    </div>
  </div>
}
function RetrievalState({ status, copy }: { status?: string | null; copy: Ai1Copy }) {
  const label = status && Object.hasOwn(copy.retrieval, status) ? copy.retrieval[status as keyof Ai1Copy['retrieval']] : copy.pending
  return <span className="ai1-evidence__status">{label}</span>
}
function Requirement({ requirement, copy, index }: { requirement: HrReview['requirements'][number]; copy: Ai1Copy; index: number }) {
  const part = requirement.components?.length === 1 ? requirement.components[0] : null
  const sameEvidence = (items: HrEvidence[]) => JSON.stringify(items) === JSON.stringify(requirement.evidence)
  const wholeDuplicate = Boolean(part && part.text === requirement.text
    && requirement.allOf?.length === 1 && requirement.allOf[0].length === 1 && requirement.allOf[0][0] === part.componentId
    && part.modelSuggestion === requirement.modelSuggestion && part.retrievalStatus === requirement.retrievalStatus
    && JSON.stringify(part.reasonCodes ?? []) === JSON.stringify(requirement.reasonCodes ?? [])
    && sameEvidence(part.evidence))
  return <article className="ai1-evidence__requirement" aria-label={`${copy.selected} ${index + 1}`}>
    <p className="ai1-evidence__eyebrow">{copy.selected} · {index + 1}</p><h4>{requirement.text}</h4>
    <RetrievalState status={requirement.retrievalStatus} copy={copy} />
    {requirement.modelSuggestion !== null && <p>{copy.proposal}: {copy[requirement.modelSuggestion]}</p>}
    {requirement.jointContextRequired && <p className="ai1-evidence__notice">{copy.joint}</p>}
    <Warnings codes={requirement.reasonCodes ?? []} copy={copy} />
    <Evidence items={requirement.evidence} copy={copy} />
    {wholeDuplicate && part && part.importance !== "unknown" && <p className="ai1-evidence__metadata">{copy.importance[part.importance as keyof Ai1Copy["importance"]] ?? copy.importance.unknown}</p>}
    <details className="ai1-evidence__provenance"><summary>{copy.technical}</summary><p>{requirement.requirementId}</p>{wholeDuplicate && part && <p>{part.componentId} · {part.importance}</p>}<p>{(requirement.reasonCodes ?? []).join(' · ')}</p></details>
    {wholeDuplicate ? null : requirement.componentAnalysis !== 'NOT_PERFORMED' && requirement.components?.length ? <details className="ai1-evidence__components"><summary>{copy.components} ({requirement.components.length})</summary>
      {requirement.components.length > 1 && requirement.allOf?.length ? <div className="ai1-evidence__logic"><p>{copy.rule} · {copy.allGroups}:</p><ol>{requirement.allOf.map((group, groupIndex) => <li key={groupIndex}>{copy.oneOf}: <ul>{group.map(id => <li key={id}>{requirement.components?.find(part => part.componentId === id)?.text ?? copy.unknown}</li>)}</ul></li>)}</ol></div> : null}
      {requirement.components.map(part => <section className="ai1-evidence__component" key={part.componentId}><h5>{part.text}</h5><p className="ai1-evidence__metadata">{copy.importance[part.importance as keyof Ai1Copy['importance']] ?? copy.importance.unknown}</p><RetrievalState status={part.retrievalStatus} copy={copy} />
        {part.modelSuggestion !== null && <p>{copy.proposal}: {copy[part.modelSuggestion]}</p>}
        <Warnings codes={part.reasonCodes ?? []} copy={copy} />{sameEvidence(part.evidence) ? (part.evidence.length ? <p className="ai1-evidence__metadata">{copy.sharedEvidence}</p> : null) : <Evidence items={part.evidence} copy={copy} />}
        <details><summary>{copy.technical}</summary><p>{part.importance} · {part.componentId}</p><p>{(part.reasonCodes ?? []).join(' · ')}</p></details>
      </section>)}
    </details> : <p className="ai1-evidence__metadata">{copy.missingComponents}</p>}
  </article>
}
function Review({ review, copy }: { review: HrReview; copy: Ai1Copy }) {
  const [selected, setSelected] = useState(0)
  const requirement = review.requirements[selected] ?? review.requirements[0]
  const plans: Record<string, string> = { UNPREPARED: copy.unprepared, DRAFT: copy.draft, HR_CONFIRMED: copy.confirmed, STALE: copy.stale, UNAVAILABLE: copy.planUnavailable }
  return <>
    <div className="ai1-evidence__overview">{review.assessmentStatus === 'PENDING_REVIEW' && <span className="ai1-evidence__status">{copy.pending}</span>}<span>{copy.plan}: {plans[review.planStatus ?? ''] ?? copy.unknown}</span></div>
    <Warnings codes={review.retrievalWarnings ?? []} copy={copy} />
    {review.assessmentSource === 'VERIFIER_DIAGNOSTIC' && <p className="ai1-evidence__notice">{copy.diagnostic}</p>}
    {review.assessmentStatus === 'NOT_PERFORMED' ? <p>{copy.notPerformed}</p> : review.assessmentStatus === 'UNAVAILABLE' ? <p role="status">{copy.unavailable}</p> : !requirement ? <p>{copy.noRequirements}</p> : <>
      <label className="ai1-evidence__mobile-select">{copy.navigation} ({review.requirements.length})<select value={selected} onChange={event => setSelected(Number(event.target.value))}>{review.requirements.map((q, i) => <option key={q.requirementId} value={i}>{i + 1}. {q.text}</option>)}</select></label>
      <div className="ai1-evidence__workspace"><nav className="ai1-evidence__navigation" aria-label={copy.navigation}><h4>{copy.navigation} <span>{review.requirements.length}</span></h4>{review.requirements.map((q, i) => <button type="button" key={q.requirementId} aria-current={selected === i ? 'true' : undefined} onClick={() => setSelected(i)}><span className="ai1-evidence__number">{i + 1}</span><span>{q.text}</span></button>)}</nav>
        <Requirement key={requirement.requirementId} requirement={requirement} index={selected} copy={copy} /></div>
    </>}
    <details className="ai1-evidence__provenance"><summary>{copy.technical}</summary><p>{copy.historical}</p><dl><dt>{copy.model}</dt><dd>AI1 · {review.retrievalModelVersion ?? '—'}</dd><dt>Result</dt><dd>{review.resultId}</dd><dt>JD snapshot</dt><dd>{review.jobSnapshotSha256 ?? '—'}</dd><dt>CV snapshot</dt><dd>{review.candidateSnapshotSha256 ?? '—'}</dd><dt>Reason</dt><dd>{review.reason}</dd></dl><p>{(review.retrievalWarnings ?? []).join(' · ')}</p></details>
  </>
}
export function Ai1EvidenceView({ state, copy, isMatching, onRefresh }: Props) {
  return <section className="recruiter-application-detail-card ai1-evidence" aria-label={copy.title} aria-busy={state.status === 'loading'}>
    <div className="ai1-evidence__header"><h3>{copy.title}</h3><button type="button" onClick={onRefresh} disabled={state.status === 'loading'}>{copy.refresh}</button></div>
    <p className="ai1-evidence__guidance">{copy.disclaimer}</p>
    <details className="ai1-evidence__help"><summary>{copy.how}</summary><p>{copy.warningText.RETRIEVAL_IS_NOT_ENTAILMENT}</p><p>{copy.warningText.PAIR_THRESHOLD_NOT_RETRIEVAL_CALIBRATED}</p></details>
    {isMatching && <p role="status">{copy.busy}</p>}
    {state.status === 'loading' ? <p role="status">{copy.loading}</p> : state.status === 'error' ? <p role="alert">{copy[state.kind]}</p> : state.review === null ? <p role="status">{copy.empty}</p> : <Review key={`${state.review.applicationId}:${state.review.resultId}`} review={state.review} copy={copy} />}
  </section>
}
