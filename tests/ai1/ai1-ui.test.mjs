import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

// Existing TypeScript compiler + React SSR; no new test runner/dependencies.
const require = createRequire(import.meta.url)
function loadTs(file, mocks = {}) {
  const source = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8')
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2023 } }).outputText
  const exports = {}
  vm.runInNewContext(output, { exports, require: (id) => id.endsWith('.css') ? {} : Object.hasOwn(mocks, id) ? mocks[id] : require(id) }, { filename: file })
  return exports
}
const { parseHrReviewEnvelope } = loadTs('src/types/hr-review.types.ts')
const { ai1Copy } = loadTs('src/pages/RecruiterApplicationsPage/components/ai1/ai1Copy.ts')
const { Ai1EvidenceView } = loadTs('src/pages/RecruiterApplicationsPage/components/ai1/Ai1EvidenceView.tsx')
const fixtures = JSON.parse(readFileSync(new URL('./fixtures/ai1-hr-review.synthetic.json', import.meta.url), 'utf8'))
function parse(review) { return parseHrReviewEnvelope({ success: true, data: review }, review.applicationId, review.jobId) }
function render(state, locale = 'vi', isMatching = false) {
  return renderToStaticMarkup(React.createElement(Ai1EvidenceView, { state, copy: ai1Copy[locale], isMatching, onRefresh() {} }))
}
const ready = () => structuredClone(fixtures.find((row) => row.scenario === 'CONFIRMED_POSTGRES_AWS').review)

test('all 10 saved synthetic main-worker projections parse (actual contract fixtures)', () => {
  for (const fixture of fixtures) assert.equal(parse(fixture.review).resultId, fixture.review.resultId)
  assert.equal(parseHrReviewEnvelope({ success: true, data: null }, 'a', 'j'), null)
})
test('reject foreign application/job and invalid/safety-unsafe envelopes', () => {
  const source = ready()
  assert.throws(() => parseHrReviewEnvelope({ success: true, data: source }, 'foreign', source.jobId))
  assert.throws(() => parseHrReviewEnvelope({ success: true, data: source }, source.applicationId, 'foreign'))
  for (const mutation of [
    { candidateSupportVerified: true }, { automaticallyReject: true }, { overallFitScore: 90 },
    { hiringDecision: 'SHORTLIST' }, { schemaVersion: 'unknown' }, { baselineDiagnostics: { totalScore: 99 } },
  ]) assert.throws(() => parse({ ...source, ...mutation }))
  assert.throws(() => parseHrReviewEnvelope({ success: false, data: source }, source.applicationId, source.jobId))
})
test('reject out-of-range similarity, support assertion and corrupt component references', () => {
  let value = ready(); value.requirements[0].evidence[0].similarityScore = 101; assert.throws(() => parse(value))
  value = ready(); value.requirements[0].modelSuggestion = 'matched'; assert.throws(() => parse(value))
  value = ready(); value.requirements[0].allOf = [['missing']]; assert.throws(() => parse(value))
  value = ready(); value.assessmentStatus = 'UNAVAILABLE'; assert.throws(() => parse(value))
})
test('null support stays pending, quote/source exact, similarity never fit percent', () => {
  const review = parse(ready())
  review.requirements[0].evidence[0].text = 'Used PostgreSQL.\nNo AWS experience. <script>alert(1)</script>'
  const html = render({ status: 'loaded', review })
  assert.ok(html.includes('Used PostgreSQL.\nNo AWS experience. &lt;script&gt;alert(1)&lt;/script&gt;'))
  assert.ok(html.includes(ai1Copy.vi.pending))
  assert.ok(html.includes(review.requirements[0].evidence[0].source))
  assert.ok(html.includes(' / 100'))
  assert.ok(!html.includes('is-success') && !html.includes('<script>'))
})
test('AND groups, OR alternatives and joint-context warning render faithfully', () => {
  const review = ready(); const q = review.requirements.find((item) => item.components?.length >= 2)
  assert.ok(q)
  review.requirements = [q]
  q.allOf = [[q.components[0].componentId, q.components[1].componentId], [q.components[0].componentId]]
  q.jointContextRequired = true
  const html = render({ status: 'loaded', review: parse(review) }, 'en')
  assert.ok(html.includes(ai1Copy.en.allGroups) && html.includes(ai1Copy.en.oneOf))
  assert.equal((html.match(/One of these items:/g) ?? []).length, 2)
  for (const part of q.components) assert.ok(html.includes(part.text))
  assert.ok(html.includes(ai1Copy.en.joint))
})
test('all plan states are historical; no current confirmation or save controls', () => {
  for (const status of ['UNPREPARED', 'DRAFT', 'HR_CONFIRMED', 'STALE', null]) {
    const review = ready(); review.planStatus = status
    const html = render({ status: 'loaded', review: parse(review) })
    assert.ok(html.includes(ai1Copy.vi.historical))
    assert.ok(!html.includes('type="submit"'))
  }
})
test('loading/empty/forbidden/network/invalid/not-performed/unavailable explicit in three locales', () => {
  for (const locale of ['vi', 'en', 'ja']) {
    const copy = ai1Copy[locale]
    assert.ok(render({ status: 'loading' }, locale).includes(copy.loading))
    assert.ok(render({ status: 'loaded', review: null }, locale).includes(copy.empty))
    for (const kind of ['error', 'forbidden', 'invalid']) assert.ok(render({ status: 'error', kind }, locale).includes(copy[kind]))
    for (const [status, label] of [['NOT_PERFORMED', 'notPerformed'], ['UNAVAILABLE', 'unavailable']]) {
      const review = ready(); review.assessmentStatus = status; review.requirements = []
      assert.ok(render({ status: 'loaded', review: parse(review) }, locale).includes(copy[label]))
    }
  }
})
test('negation/truncation explanations visible as text; preserve raw unknown codes', () => {
  const review = ready(); review.retrievalWarnings = ['M1_CONTEXT_TRUNCATED', 'FUTURE_WARNING']
  review.requirements[0].evidence[0].reasonCodes = ['EXPLICIT_NEGATION_CUE']
  const html = render({ status: 'loaded', review: parse(review) }, 'en', true)
  assert.ok(html.includes(`<p class="ai1-evidence__notice">${ai1Copy.en.warningText.EXPLICIT_NEGATION_CUE}</p>`))
  assert.ok(html.includes(ai1Copy.en.warningText.M1_CONTEXT_TRUNCATED))
  assert.ok(html.includes('FUTURE_WARNING'))
  assert.ok(html.includes(ai1Copy.en.busy))
})
test('no-evidence and empty-requirements do not imply rejection', () => {
  const review = ready(); review.requirements.forEach((q) => { q.evidence = []; q.components = null; q.allOf = null })
  assert.ok(render({ status: 'loaded', review: parse(review) }).includes(ai1Copy.vi.noEvidence))
  review.requirements = []
  assert.ok(render({ status: 'loaded', review: parse(review) }).includes(ai1Copy.vi.noRequirements))
})

test('new copy preserves Unicode, source semantics and plan-unavailable evidence', () => {
  assert.equal(ai1Copy.vi.navigation, 'Yêu cầu JD')
  assert.equal(ai1Copy.vi.sources.profile, 'Giới thiệu')
  assert.equal(ai1Copy.ja.navigation, '求人要件')
  for (const locale of ['vi', 'en', 'ja']) for (const value of Object.values(ai1Copy[locale].sources)) assert.ok(!value.includes('?') && !value.includes('\ufffd'))
  for (const [source, evidenceId, expected] of [['project','uuid-opaque/technologies/2',ai1Copy.vi.sources.technology], ['unknown','opaque',ai1Copy.vi.sources.unknown]]) {
    const value = ready(); Object.assign(value.requirements[0].evidence[0], {source, evidenceId})
    assert.ok(render({status:'loaded', review:parse(value)}).includes(expected))
  }
  const review = ready(); review.planStatus = 'UNAVAILABLE'
  const html = render({ status: 'loaded', review: parse(review) })
  assert.ok(html.includes(ai1Copy.vi.planUnavailable) && html.includes('<blockquote>'))
  for (const status of ['NOT_PERFORMED', 'UNAVAILABLE']) {
    review.assessmentStatus = status; review.requirements = []
    assert.ok(!render({ status: 'loaded', review: parse(review) }).includes(ai1Copy.vi.pending))
  }
})
test('identical quotes combine only visually and preserve every rank score and ID', () => {
  const review = ready(); const q = review.requirements[0]
  q.evidence.forEach((hit, i) => { hit.text = 'Identical exact text'; hit.similarityScore = 90 - i; hit.evidenceId = `source-${i}` })
  q.evidence[2].reasonCodes = ['EXPLICIT_NEGATION_CUE']
  q.reasonCodes = ['RETRIEVAL_IS_NOT_ENTAILMENT']; q.components = null; q.allOf = null
  const html = render({ status: 'loaded', review: parse(review) })
  assert.equal((html.match(/<blockquote>/g) ?? []).length, 1)
  assert.ok(html.includes('Cùng nội dung tại') && html.includes('3 vị trí'))
  for (let i = 0; i < 3; i++) assert.ok(html.includes(`source-${i}`) && html.includes(`${90-i} / 100`))
  assert.ok(html.includes(ai1Copy.vi.warningText.EXPLICIT_NEGATION_CUE))
  assert.ok(html.includes('RETRIEVAL_IS_NOT_ENTAILMENT'))
})

test('selected source disclosure opens readable occurrence labels; technical disclosures remain closed', () => {
  const review = ready(); const q = review.requirements[0]; q.components = null; q.allOf = null
  q.evidence.forEach((hit, i) => { hit.text = 'Same quote'; hit.evidenceId = `opaque-${i}`; hit.reasonCodes = ['NEW_UNKNOWN_CODE'] })
  for (const locale of ['vi','en','ja']) {
    const html = render({status:'loaded', review:parse(review)}, locale)
    const sources = html.match(/<details class="ai1-evidence__sources" open="">(.*?)<\/details>/s)?.[1]
    assert.ok(sources?.includes(ai1Copy[locale].cvSources))
    assert.equal((sources.match(/<li>/g) ?? []).length, 3)
    assert.ok(!sources.includes('opaque-') && !sources.includes('NEW_UNKNOWN_CODE'))
    assert.ok(html.includes(ai1Copy[locale].unknownNotice) && html.includes('NEW_UNKNOWN_CODE'))
    assert.ok(!/<details class="ai1-evidence__provenance" open/.test(html))
  }
})
test('source paths and importance map without guessing unknown values in all locales', () => {
  const paths = [['profile/summary','summary'],['profile/headline','headline'],['skills/uuid','skill'],['experiences/0','experience'],['projects/0','project'],['projects/0/technologies/1','technology'],['educations/0','education'],['certifications/0','certification'],['opaque-uuid','unknown']]
  for (const locale of ['vi','en','ja']) {
    for (const [id,label] of paths) {
      const review=ready(); Object.assign(review.requirements[0].evidence[0],{source:'FUTURE_SECTION',evidenceId:id})
      const html=render({status:'loaded',review:parse(review)},locale)
      assert.ok(html.includes(ai1Copy[locale].sources[label]))
    }
    for (const importance of ['core','preferred','supplementary','FUTURE_IMPORTANCE']) {
      const review=ready(); review.requirements[0].components[0].importance=importance
      const html=render({status:'loaded',review:parse(review)},locale)
      assert.ok(html.includes(ai1Copy[locale].importance[importance] ?? ai1Copy[locale].importance.unknown))
    }
    for (const code of ['UNREVIEWED_DESCRIPTION_FALLBACK','INCOMPLETE_SEMANTIC_SCORING']) {
      const review=ready(); review.requirements[0].reasonCodes=[code]
      assert.ok(render({status:'loaded',review:parse(review)},locale).includes(ai1Copy[locale].warningText[code]))
    }
  }
})

test('whole Node.js component and its identical evidence render once, with no one-item logic UI', () => {
  const review = ready(); const q = review.requirements[0]
  const part = structuredClone(q.components[0])
  q.text = part.text = 'Node.js'
  q.evidence = [q.evidence[0]]
  q.evidence[0].text = 'Built a Node.js API.'
  q.evidence[0].similarityScore = 99.99999403953552
  part.evidence = structuredClone(q.evidence)
  part.modelSuggestion = q.modelSuggestion
  part.retrievalStatus = q.retrievalStatus
  part.reasonCodes = structuredClone(q.reasonCodes ?? [])
  part.importance = 'core'
  q.components = [part]; q.allOf = [[part.componentId]]
  review.requirements = [q]
  for (const locale of ['vi', 'en', 'ja']) {
    const html = render({ status: 'loaded', review: parse(review) }, locale)
    assert.equal((html.match(/ai1-evidence__passages/g) ?? []).length, 1)
    assert.equal((html.match(/<blockquote>/g) ?? []).length, 1)
    assert.ok(!html.includes('ai1-evidence__components') && !html.includes('ai1-evidence__logic'))
    assert.ok(html.includes(ai1Copy[locale].importance.core))
    const sourceBody = html.match(/<details class="ai1-evidence__sources" open="">(.*?)<\/details>/s)?.[1]
    assert.ok(sourceBody && !sourceBody.includes('99.99999403953552'))
    assert.ok(html.includes('100.0 / 100'))
  }
})

test('same passages are referenced without repeating quotes; distinct evidence and warning differences remain', () => {
  const review = ready(); const q = review.requirements[0]
  const part = structuredClone(q.components[0])
  q.evidence = [q.evidence[0]]; q.evidence[0].text = 'Parent evidence.'
  part.text = 'Different scoped criterion'
  part.evidence = structuredClone(q.evidence); part.reasonCodes = ['EXPLICIT_NEGATION_CUE']
  q.components = [part]; q.allOf = [[part.componentId]]; review.requirements = [q]
  let html = render({ status: 'loaded', review: parse(review) })
  assert.equal((html.match(/ai1-evidence__passages/g) ?? []).length, 1)
  assert.ok(html.includes(ai1Copy.vi.sharedEvidence) && html.includes(ai1Copy.vi.warningText.EXPLICIT_NEGATION_CUE))
  assert.ok(html.includes(part.text))
  part.evidence = [{ ...q.evidence[0], evidenceId: 'distinct-evidence', text: 'Different component evidence.' }]
  q.components = [part]
  html = render({ status: 'loaded', review: parse(review) })
  assert.equal((html.match(/ai1-evidence__passages/g) ?? []).length, 2)
  assert.ok(html.includes('Parent evidence.') && html.includes('Different component evidence.'))
  q.evidence = []; part.evidence = []; q.components = [part]
  html = render({ status: 'loaded', review: parse(review) })
  assert.ok(!html.includes(ai1Copy.vi.sharedEvidence))
  assert.ok(html.includes(ai1Copy.vi.noEvidence))
})
