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
  return (
    <div className="ai1-evidence__warnings">
      {specific.map(code => Object.hasOwn(copy.warningText, code)
        ? <p className="ai1-evidence__notice" key={code}>{copy.warningText[code as keyof Ai1Copy['warningText']]}</p>
        : <p className="ai1-evidence__notice" key={code}>{copy.unknownNotice}</p>)}
    </div>
  )
}

function sourceLabel(hit: HrEvidence, copy: Ai1Copy) {
  const id = hit.evidenceId
  if ((hit.source.toLowerCase() === 'project' || /^projects?\//.test(id)) && /\/technologies\/\d+$/.test(id)) return copy.sources.technology
  if (id === 'profile/summary') return copy.sources.summary
  if (id === 'profile/headline') return copy.sources.headline
  const section = hit.source.toLowerCase()
  if (Object.hasOwn(copy.sources, section)) return copy.sources[section as keyof Ai1Copy['sources']]
  const pathSection = id.split('/')[0]
  const sections: Record<string, keyof Ai1Copy['sources']> = {
    profile: 'profile', skill: 'skill', skills: 'skill',
    experience: 'experience', experiences: 'experience',
    project: 'project', projects: 'project',
    education: 'education', educations: 'education',
    certification: 'certification', certifications: 'certification',
  }
  return copy.sources[sections[pathSection] ?? 'unknown']
}

function isShortSkillQuery(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  const words = trimmed.split(/\s+/)
  return words.length <= 4 && trimmed.length <= 40 && !/[.;\n]/.test(trimmed)
}

function passageRelatesToSkill(passageText: string, reqText: string): boolean {
  const normPassage = passageText.toLowerCase()
  const normReq = reqText.trim().toLowerCase()
  if (normPassage.includes(normReq)) return true
  const strip = (s: string) => s.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  const cleanPassage = strip(normPassage)
  const cleanReq = strip(normReq)
  if (cleanPassage.includes(cleanReq)) return true
  const reqWords = cleanReq.split(' ').filter(w => w.length > 2)
  if (reqWords.length > 0 && reqWords.some(w => cleanPassage.includes(w))) {
    return true
  }
  return false
}

function filterEvidenceForRequirement(items: HrEvidence[], reqText: string): HrEvidence[] {
  if (!items || items.length === 0) return []
  if (!isShortSkillQuery(reqText)) return items
  const directMatches = items.filter(item => passageRelatesToSkill(item.text, reqText))
  return directMatches
}

function isExactSkillMatch(hit: HrEvidence, reqText: string): boolean {
  if (hit.similarityScore < 80) return false
  const cleanHit = hit.text.trim().toLowerCase()
  const cleanReq = reqText.trim().toLowerCase()
  return (
    cleanHit === cleanReq ||
    cleanHit.startsWith(cleanReq + ' ') ||
    cleanHit.endsWith(' ' + cleanReq) ||
    cleanHit.includes(cleanReq)
  )
}

function getRelevanceTier(score: number): 'high' | 'medium' | 'low' {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

function getRelevanceLabel(score: number, copy: Ai1Copy): string {
  if (score >= 80) return copy.relevanceHigh
  if (score >= 60) return copy.relevanceMedium
  return copy.relevanceLow
}

function hasEvidence(q: HrReview['requirements'][number]): boolean {
  if (!q.evidence || q.evidence.length === 0) return false
  if (q.retrievalStatus === 'NO_EVIDENCE' || q.retrievalStatus === 'INSUFFICIENT_SIGNAL') return false
  if (isShortSkillQuery(q.text)) {
    return q.evidence.some(item => passageRelatesToSkill(item.text, q.text))
  }
  return true
}

function Evidence({ items, copy, requirementText }: { items: HrEvidence[]; copy: Ai1Copy; requirementText?: string }) {
  const [selected, setSelected] = useState(0)
  if (!items || items.length === 0) {
    return <p className="ai1-evidence__no-evidence">{copy.noEvidence}</p>
  }
  const effectiveItems = requirementText ? filterEvidenceForRequirement(items, requirementText) : items

  if (effectiveItems.length === 0) {
    return (
      <div className="ai1-evidence__not-found">
        <div className="ai1-evidence__not-found-badge">
          <span>{copy.skillNotFound}</span>
        </div>
        <p className="ai1-evidence__not-found-desc">
          {copy.skillNotFoundDesc.replace('{skill}', requirementText || '')}
        </p>
      </div>
    )
  }

  const groups: Array<Array<{ hit: HrEvidence; rank: number }>> = []
  effectiveItems.forEach((hit, index) => {
    const group = groups.find(group => group[0].hit.text === hit.text)
    if (group) group.push({ hit, rank: index + 1 }); else groups.push([{ hit, rank: index + 1 }])
  })
  const group = groups[selected] ?? groups[0]
  if (!group) return <p className="ai1-evidence__no-evidence">{copy.noEvidence}</p>
  const hit = group[0].hit

  const topHit = effectiveItems[0]
  const showSkillMatch = Boolean(requirementText && topHit && isExactSkillMatch(topHit, requirementText))
  const tier = getRelevanceTier(hit.similarityScore)
  const relevanceText = getRelevanceLabel(hit.similarityScore, copy)

  return (
    <div className="ai1-evidence__passages">
      {showSkillMatch && (
        <div className="ai1-evidence__skill-highlight" role="status">
          <span className="ai1-evidence__skill-highlight-text">{copy.foundInSkills}</span>
        </div>
      )}
      <h5>{copy.evidence}</h5>
      <p className="ai1-evidence__metadata">{copy.originNote}</p>
      <div className="ai1-evidence__passage-nav" aria-label={copy.evidence}>
        {groups.map((grp, index) => (
          <button
            type="button"
            key={grp[0].rank}
            aria-pressed={selected === index}
            onClick={() => setSelected(index)}
          >
            {copy.passage} {grp.map(item => item.rank).join(' / ')}
            {grp.some(item => item.hit.reasonCodes?.some(code => !generalCodes.has(code))) && (
              <span className="ai1-evidence__warning-badge"> · {copy.warnings}</span>
            )}
          </button>
        ))}
      </div>
      <div className="ai1-evidence__quote" key={group[0].rank}>
        <div className="ai1-evidence__quote-heading">
          <span className="ai1-evidence__source">
            {[...new Set(group.map(item => sourceLabel(item.hit, copy)))].join(' · ')}
          </span>
          <span className={`ai1-evidence__relevance-pill ai1-evidence__relevance-pill--${tier}`}>
            <span className="ai1-evidence__relevance-dot" />
            <span>{relevanceText} · <strong>{hit.similarityScore.toFixed(1)} / 100</strong></span>
          </span>
        </div>
        {group.length > 1 && <p className="ai1-evidence__duplicate">{copy.duplicate} {group.length} {copy.positions}</p>}
        <Warnings codes={group.flatMap(item => item.hit.reasonCodes ?? [])} copy={copy} />
        {hit.text.length > 650 ? (
          <>
            <blockquote>{hit.text.slice(0, 650)}…</blockquote>
            <details className="ai1-evidence__full"><summary>{copy.fullQuote}</summary><blockquote>{hit.text}</blockquote></details>
          </>
        ) : (
          <blockquote>{hit.text}</blockquote>
        )}
        <details className="ai1-evidence__sources" open>
          <summary>{copy.cvSources}</summary>
          <ul>
            {group.map(({ hit: h, rank }) => (
              <li key={`${rank}:${h.evidenceId}`}>
                {group.length > 1 && <strong>{sourceLabel(h, copy)}</strong>}
                <span>{copy.rank}: {rank}{group.length > 1 && <> · {copy.similarity}: {h.similarityScore.toFixed(1)} / 100</>}</span>
              </li>
            ))}
          </ul>
        </details>
        <details className="ai1-evidence__provenance">
          <summary>{copy.technical}</summary>
          {group.map(({ hit: h, rank }) => (
            <dl key={`${rank}:${h.evidenceId}`}>
              <dt>{copy.passage} {rank} · {sourceLabel(h, copy)}</dt>
              <dd>{copy.source}: {h.source}</dd>
              <dd>ID: {h.evidenceId}</dd>
              <dd>{copy.similarity}: {h.similarityScore} / 100</dd>
              <dd>{(h.reasonCodes ?? []).join(' · ')}</dd>
            </dl>
          ))}
        </details>
      </div>
    </div>
  )
}

function getEffectiveRetrievalStatus(
  requirement: HrReview['requirements'][number],
): string | null | undefined {
  if (requirement.retrievalStatus === 'CANDIDATE_EVIDENCE' && !hasEvidence(requirement)) {
    return 'INSUFFICIENT_SIGNAL'
  }
  return requirement.retrievalStatus
}

function getEffectiveComponentStatus(
  compPart: NonNullable<HrReview['requirements'][number]['components']>[number],
): string | null | undefined {
  if (compPart.retrievalStatus === 'CANDIDATE_EVIDENCE') {
    if (!compPart.evidence || compPart.evidence.length === 0) return 'INSUFFICIENT_SIGNAL'
    if (isShortSkillQuery(compPart.text) && !compPart.evidence.some(item => passageRelatesToSkill(item.text, compPart.text))) {
      return 'INSUFFICIENT_SIGNAL'
    }
  }
  return compPart.retrievalStatus
}

function RetrievalState({ status, copy }: { status?: string | null; copy: Ai1Copy }) {
  const label = status && Object.hasOwn(copy.retrieval, status) ? copy.retrieval[status as keyof Ai1Copy['retrieval']] : copy.pending
  const isFound = status === 'CANDIDATE_EVIDENCE'
  const isMissing = status === 'INSUFFICIENT_SIGNAL' || status === 'NO_EVIDENCE'
  const className = `ai1-evidence__status ${isFound ? 'ai1-evidence__status--matched' : isMissing ? 'ai1-evidence__status--missing' : ''}`
  return <span className={className}>{label}</span>
}

function Requirement({ requirement, copy, index }: { requirement: HrReview['requirements'][number]; copy: Ai1Copy; index: number }) {
  const part = requirement.components?.length === 1 ? requirement.components[0] : null
  const sameEvidence = (items: HrEvidence[]) => JSON.stringify(items) === JSON.stringify(requirement.evidence)
  const wholeDuplicate = Boolean(part && part.text === requirement.text
    && requirement.allOf?.length === 1 && requirement.allOf[0].length === 1 && requirement.allOf[0][0] === part.componentId
    && part.modelSuggestion === requirement.modelSuggestion && part.retrievalStatus === requirement.retrievalStatus
    && JSON.stringify(part.reasonCodes ?? []) === JSON.stringify(requirement.reasonCodes ?? [])
    && sameEvidence(part.evidence))
  const effectiveStatus = getEffectiveRetrievalStatus(requirement)

  return (
    <article className="ai1-evidence__requirement" aria-label={`${copy.selected} ${index + 1}`}>
      <div className="ai1-evidence__requirement-header">
        <p className="ai1-evidence__eyebrow">{copy.selected} · {index + 1}</p>
        <h4>{requirement.text}</h4>
        <div className="ai1-evidence__requirement-badges">
          <RetrievalState status={effectiveStatus} copy={copy} />
          {wholeDuplicate && part && part.importance !== "unknown" && (
            <span className="ai1-evidence__importance-badge">
              {copy.importance[part.importance as keyof Ai1Copy["importance"]] ?? copy.importance.unknown}
            </span>
          )}
        </div>
      </div>
      {requirement.modelSuggestion !== null && <p className="ai1-evidence__proposal">{copy.proposal}: {copy[requirement.modelSuggestion]}</p>}
      {requirement.jointContextRequired && <p className="ai1-evidence__notice">{copy.joint}</p>}
      <Warnings codes={requirement.reasonCodes ?? []} copy={copy} />
      <Evidence items={requirement.evidence} copy={copy} requirementText={requirement.text} />
      {wholeDuplicate && part && part.importance !== "unknown" && <p className="ai1-evidence__metadata">{copy.importance[part.importance as keyof Ai1Copy["importance"]] ?? copy.importance.unknown}</p>}
      <details className="ai1-evidence__provenance">
        <summary>{copy.technical}</summary>
        <p>{requirement.requirementId}</p>
        {wholeDuplicate && part && <p>{part.componentId} · {part.importance}</p>}
        <p>{(requirement.reasonCodes ?? []).join(' · ')}</p>
      </details>
      {wholeDuplicate ? null : requirement.componentAnalysis !== 'NOT_PERFORMED' && requirement.components?.length ? (
        <details className="ai1-evidence__components">
          <summary>{copy.components} ({requirement.components.length})</summary>
          {requirement.components.length > 1 && requirement.allOf?.length ? (
            <div className="ai1-evidence__logic">
              <p>{copy.rule} · {copy.allGroups}:</p>
              <ol>
                {requirement.allOf.map((group, groupIndex) => (
                  <li key={groupIndex}>
                    {copy.oneOf}:
                    <ul>
                      {group.map(id => (
                        <li key={id}>{requirement.components?.find(p => p.componentId === id)?.text ?? copy.unknown}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          {requirement.components.map(compPart => (
            <section className="ai1-evidence__component" key={compPart.componentId}>
              <h5>{compPart.text}</h5>
              <p className="ai1-evidence__metadata">{copy.importance[compPart.importance as keyof Ai1Copy['importance']] ?? copy.importance.unknown}</p>
              <RetrievalState status={getEffectiveComponentStatus(compPart)} copy={copy} />
              {compPart.modelSuggestion !== null && <p className="ai1-evidence__proposal">{copy.proposal}: {copy[compPart.modelSuggestion]}</p>}
              <Warnings codes={compPart.reasonCodes ?? []} copy={copy} />
              {sameEvidence(compPart.evidence) ? (
                compPart.evidence.length ? <p className="ai1-evidence__metadata">{copy.sharedEvidence}</p> : null
              ) : (
                <Evidence items={compPart.evidence} copy={copy} requirementText={compPart.text} />
              )}
              <details className="ai1-evidence__provenance">
                <summary>{copy.technical}</summary>
                <p>{compPart.importance} · {compPart.componentId}</p>
                <p>{(compPart.reasonCodes ?? []).join(' · ')}</p>
              </details>
            </section>
          ))}
        </details>
      ) : <p className="ai1-evidence__metadata">{copy.missingComponents}</p>}
    </article>
  )
}

function Review({ review, copy }: { review: HrReview; copy: Ai1Copy }) {
  const [selected, setSelected] = useState(0)
  const requirement = review.requirements[selected] ?? review.requirements[0]
  const plans: Record<string, string> = {
    UNPREPARED: copy.unprepared,
    DRAFT: copy.draft,
    HR_CONFIRMED: copy.confirmed,
    STALE: copy.stale,
    UNAVAILABLE: copy.planUnavailable,
  }

  const withEvidenceList = review.requirements.map((q, index) => ({ q, index })).filter(item => hasEvidence(item.q))
  const needReviewList = review.requirements.map((q, index) => ({ q, index })).filter(item => !hasEvidence(item.q))

  return (
    <>
      <div className="ai1-evidence__overview">
        <div className="ai1-evidence__summary-pills">
          <span className="ai1-evidence__pill ai1-evidence__pill--total">
            <span className="ai1-evidence__pill-badge">{review.requirements.length}</span>
            <span>{copy.criteriaReview}</span>
          </span>
          {withEvidenceList.length > 0 && (
            <span className="ai1-evidence__badge-indicator ai1-evidence__badge-indicator--green">
              <span className="ai1-evidence__badge-dot ai1-evidence__badge-dot--green" />
              <span>{withEvidenceList.length} {copy.hasEvidenceCount}</span>
            </span>
          )}
          {needReviewList.length > 0 && (
            <span className="ai1-evidence__badge-indicator ai1-evidence__badge-indicator--amber">
              <span className="ai1-evidence__badge-dot ai1-evidence__badge-dot--amber" />
              <span>{needReviewList.length} {copy.needReviewCount}</span>
            </span>
          )}
          {review.assessmentStatus === 'PENDING_REVIEW' && (
            <span className="ai1-evidence__badge-indicator ai1-evidence__badge-indicator--pending">
              {copy.pending}
            </span>
          )}
          {review.planStatus === 'UNAVAILABLE' && (
            <span className="ai1-evidence__badge-indicator ai1-evidence__badge-indicator--warning">
              {copy.planUnavailable}
            </span>
          )}
        </div>
      </div>
      <Warnings codes={review.retrievalWarnings ?? []} copy={copy} />
      {review.assessmentSource === 'VERIFIER_DIAGNOSTIC' && <p className="ai1-evidence__notice">{copy.diagnostic}</p>}
      {review.assessmentStatus === 'NOT_PERFORMED' ? (
        <p>{copy.notPerformed}</p>
      ) : review.assessmentStatus === 'UNAVAILABLE' ? (
        <p role="status">{copy.unavailable}</p>
      ) : !requirement ? (
        <p>{copy.noRequirements}</p>
      ) : (
        <>
          <label className="ai1-evidence__mobile-select">
            {copy.navigation} ({review.requirements.length})
            <select value={selected} onChange={event => setSelected(Number(event.target.value))}>
              {review.requirements.map((q, i) => (
                <option key={q.requirementId} value={i}>
                  {i + 1}. {q.text}
                </option>
              ))}
            </select>
          </label>
          <div className="ai1-evidence__workspace">
            <nav className="ai1-evidence__navigation" aria-label={copy.navigation}>
              <div className="ai1-evidence__nav-header">
                <h4>{copy.navigation} <span>{review.requirements.length}</span></h4>
              </div>
              <div className="ai1-evidence__nav-group">
                <div className="ai1-evidence__nav-group-title">
                  <span className="ai1-evidence__nav-group-title--green">
                    <span className="ai1-evidence__nav-group-dot ai1-evidence__nav-group-dot--green" />
                    {copy.hasEvidenceGroup} ({withEvidenceList.length})
                  </span>
                  <span className="ai1-evidence__nav-group-title--amber" style={{ marginLeft: 'auto' }}>
                    <span className="ai1-evidence__nav-group-dot ai1-evidence__nav-group-dot--amber" />
                    {copy.needReviewGroup} ({needReviewList.length})
                  </span>
                </div>
                {review.requirements.map((q, i) => {
                  const itemHasEvidence = hasEvidence(q)
                  return (
                    <button
                      type="button"
                      key={q.requirementId}
                      aria-current={selected === i ? 'true' : undefined}
                      onClick={() => setSelected(i)}
                      className={`ai1-evidence__nav-btn ${selected === i ? 'ai1-evidence__nav-btn--active' : ''}`}
                    >
                      <span className={`ai1-evidence__number ${itemHasEvidence ? 'ai1-evidence__number--green' : 'ai1-evidence__number--amber'}`}>
                        {i + 1}
                      </span>
                      <span className="ai1-evidence__nav-btn-text">{q.text}</span>
                    </button>
                  )
                })}
              </div>
            </nav>
            <Requirement key={requirement.requirementId} requirement={requirement} index={selected} copy={copy} />
          </div>
        </>
      )}
      <details className="ai1-evidence__provenance">
        <summary>{copy.technical}</summary>
        <p>{copy.historical}</p>
        <dl>
          <dt>{copy.model}</dt><dd>AI1 · {review.retrievalModelVersion ?? '—'}</dd>
          <dt>{copy.plan}</dt><dd>{plans[review.planStatus ?? ''] ?? copy.unknown}</dd>
          <dt>Result</dt><dd>{review.resultId}</dd>
          <dt>JD snapshot</dt><dd>{review.jobSnapshotSha256 ?? '—'}</dd>
          <dt>CV snapshot</dt><dd>{review.candidateSnapshotSha256 ?? '—'}</dd>
          <dt>Reason</dt><dd>{review.reason}</dd>
        </dl>
        <p>{(review.retrievalWarnings ?? []).join(' · ')}</p>
      </details>
    </>
  )
}

export function Ai1EvidenceView({ state, copy, isMatching, onRefresh }: Props) {
  return (
    <section className="recruiter-application-detail-card ai1-evidence" aria-label={copy.title} aria-busy={state.status === 'loading'}>
      <div className="ai1-evidence__header">
        <h3>{copy.title}</h3>
        <button type="button" onClick={onRefresh} disabled={state.status === 'loading'}>{copy.refresh}</button>
      </div>
      <p className="ai1-evidence__guidance">{copy.disclaimer}</p>
      <details className="ai1-evidence__help">
        <summary>{copy.how}</summary>
        <p>{copy.warningText.RETRIEVAL_IS_NOT_ENTAILMENT}</p>
        <p>{copy.warningText.PAIR_THRESHOLD_NOT_RETRIEVAL_CALIBRATED}</p>
      </details>
      {isMatching && <p role="status">{copy.busy}</p>}
      {state.status === 'loading' ? (
        <p role="status">{copy.loading}</p>
      ) : state.status === 'error' ? (
        <p role="alert">{copy[state.kind]}</p>
      ) : state.review === null ? (
        <p role="status">{copy.empty}</p>
      ) : (
        <Review key={`${state.review.applicationId}:${state.review.resultId}`} review={state.review} copy={copy} />
      )}
    </section>
  )
}
