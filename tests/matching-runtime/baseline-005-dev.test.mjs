import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
const require = createRequire(import.meta.url)
function load(file, mocks = {}, extra = '') {
  const source = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8') + extra
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2023 } }).outputText
  const exports = {}
  vm.runInNewContext(output, { exports, URLSearchParams, setTimeout, clearTimeout, require: id => id.endsWith('.css') ? {} : Object.hasOwn(mocks, id) ? mocks[id] : require(id) }, { filename: file })
  return exports
}
const statusTypes = load('src/types/matching-status.types.ts')
const { parseMatchingStatusEnvelope, InvalidMatchingStatusError } = statusTypes
const { pollMatchingStatus, validateMatchRequest } = load('src/pages/RecruiterApplicationsPage/utils/pollMatchingStatus.ts', { '../../../types/matching-status.types': statusTypes })
const identity = { applicationId: 'app-005', jobId: 'job-005', candidateId: 'candidate-005', candidateCvId: 'cv-005' }
const application = { ...identity, id: identity.applicationId, cvParseStatus: 'PARSED', matchScore: 99, matchLevel: 'EXCELLENT' }
const row = (request = 'new-request', status = 'SUCCEEDED') => ({ ...identity, schemaVersion: 'matching-status-v1', resultId: 'result-005', matchRequestId: request, status, scoringStatus: 'NOT_AVAILABLE', createdAt: '2026-10-25T10:00:00Z' })
const envelope = data => ({ success: true, data })
const options = (overrides = {}) => ({ identity, requestId: 'new-request', signal: new AbortController().signal, readApplication: async () => application, readStatus: async () => envelope(row()), pause: async () => {}, attempts: 3, ...overrides })

test('allowlisted status parser accepts null and strips incoming historical numeric extras', () => {
  assert.equal(parseMatchingStatusEnvelope(envelope(null), identity), null)
  const parsed = parseMatchingStatusEnvelope(envelope({ ...row(), totalScore: 99, matchLevel: 'EXCELLENT', explanation: { recommendation: 'SHORTLIST' } }), identity)
  assert.equal(parsed.resultId, 'result-005')
  for (const key of ['totalScore', 'matchLevel', 'explanation']) assert.ok(!(key in parsed))
})
test('status parser rejects every foreign identity, invalid version, status, date and score availability', () => {
  for (const key of Object.keys(identity)) assert.throws(() => parseMatchingStatusEnvelope(envelope({ ...row(), [key]: 'foreign' }), identity), InvalidMatchingStatusError)
  for (const change of [{ schemaVersion: 'v2' }, { scoringStatus: 'AVAILABLE' }, { status: 'PROCESSING' }, { createdAt: 'yesterday' }, { resultId: '' }, { matchRequestId: undefined }]) assert.throws(() => parseMatchingStatusEnvelope(envelope({ ...row(), ...change }), identity), InvalidMatchingStatusError)
  for (const payload of [null, {}, { success: false, data: row() }, { success: true }]) assert.throws(() => parseMatchingStatusEnvelope(payload, identity), InvalidMatchingStatusError)
})
test('POST request identity and correlation status are required', () => {
  assert.equal(validateMatchRequest({ applicationId: identity.applicationId, id: 'r', status: 'PENDING' }, identity.applicationId).id, 'r')
  assert.equal(validateMatchRequest({ applicationId: identity.applicationId, id: 'processing-request', status: 'PROCESSING' }, identity.applicationId).id, 'processing-request')
  assert.equal(validateMatchRequest({ applicationId: identity.applicationId, id: null, status: 'WAITING_FOR_CV_PARSE' }, identity.applicationId).id, null)
  for (const change of [{ applicationId: 'foreign', id: 'r', status: 'PENDING' }, { applicationId: identity.applicationId, id: null, status: 'PENDING' }, { applicationId: identity.applicationId, id: 'r', status: 'WAITING_FOR_CV_PARSE' }]) assert.throws(() => validateMatchRequest(change, identity.applicationId), InvalidMatchingStatusError)
})
test('old succeeded/failed results and null do not complete a new request, even with historic 99%', async () => {
  for (const status of ['SUCCEEDED', 'FAILED']) assert.equal(await pollMatchingStatus(options({ readStatus: async () => envelope(row('old-request', status)) })), 'timeout')
  assert.equal(await pollMatchingStatus(options({ readStatus: async () => envelope(null) })), 'timeout')
})
test('fresh exact request result completes without any numeric score and failed job is distinct', async () => {
  let reads = 0
  assert.equal(await pollMatchingStatus(options({ readStatus: async () => envelope(++reads === 1 ? row('old-request') : row()) })), 'succeeded')
  assert.equal(reads, 2)
  assert.equal(await pollMatchingStatus(options({ readStatus: async () => envelope(row('new-request', 'FAILED')) })), 'failed')
})
test('network failures propagate instead of reporting a failed matching job', async () => {
  const network = new Error('503 network')
  await assert.rejects(pollMatchingStatus(options({ readStatus: async () => { throw network } })), error => error === network)
})
test('CV parsing prerequisite is bounded and never accepts old result with null POST ID', async () => {
  let reads = 0
  const prereq = { requestId: null, readStatus: async () => { reads++; return envelope(row('old-request')) } }
  assert.equal(await pollMatchingStatus(options({ ...prereq, readApplication: async () => ({ ...application, cvParseStatus: 'PARSING' }) })), 'timeout')
  assert.equal(await pollMatchingStatus(options(prereq)), 'parseReady')
  assert.equal(await pollMatchingStatus(options({ ...prereq, readApplication: async () => ({ ...application, cvParseStatus: 'FAILED' }) })), 'parseFailed')
  assert.equal(reads, 0)
})
test('foreign response and CV replacement fail closed during polling', async () => {
  await assert.rejects(pollMatchingStatus(options({ readStatus: async () => envelope({ ...row(), jobId: 'foreign' }) })), InvalidMatchingStatusError)
  await assert.rejects(pollMatchingStatus(options({ readApplication: async () => ({ ...application, candidateCvId: 'new-cv' }) })), InvalidMatchingStatusError)
})
test('poll budget limits reads; abort after in-flight response prevents completion', async () => {
  let reads = 0
  assert.equal(await pollMatchingStatus(options({ readStatus: async () => { reads++; return envelope(null) } })), 'timeout')
  assert.equal(reads, 3)
  const controller = new AbortController()
  const reason = new Error('unmounted')
  await assert.rejects(pollMatchingStatus(options({ signal: controller.signal, readStatus: async () => { controller.abort(reason); return envelope(row()) } })), error => error === reason)
})
const { AiMatchBadge } = load('src/pages/RecruiterApplicationsPage/components/AiMatchBadge.tsx')
const { ApplicationTable } = load('src/pages/RecruiterApplicationsPage/components/ApplicationTable.tsx', { './AiMatchBadge': { AiMatchBadge } })
const { ApplicationMobileList } = load('src/pages/RecruiterApplicationsPage/components/ApplicationMobileList.tsx', { './AiMatchBadge': { AiMatchBadge } })
const stub = () => null
const drawer = load('src/pages/RecruiterApplicationsPage/components/ApplicationDetailDrawer.tsx', { './ai1/Ai1EvidencePanel': { Ai1EvidencePanel: () => React.createElement('div', {}, 'AI1 evidence retained') }, './AiMatchBadge': { AiMatchBadge }, './ApplicationDecisionForm': { ApplicationDecisionForm: stub } })
const candidates = load('src/pages/RecruiterCandidatesPage/index.tsx', {
  'react-router-dom': { Link: ({ to, ...props }) => React.createElement('a', { href: to, ...props }) }, '../../i18n': {}, '../../lib/api/apiError': {}, '../../services/application.service': {}, '../_components': {}, '../_components/admin/AdminPagination': {}, '../_components/admin/AdminStatCard': {},
}, '\nexport { CandidateCard, CandidateDrawer }')
const mapper = load('src/pages/RecruiterApplicationsPage/utils/recruiterApplicationApi.ts')
const dashboard = load('src/pages/RecruiterHomePage/utils/recruiterDashboardMappers.ts', {}, '\nexport { mapApplications }')
const { matchingCopy } = load('src/pages/RecruiterApplicationsPage/matchingCopy.ts')
const synthetic = { ...application, candidateFullName: 'Synthetic Candidate', candidateEmail: 'synthetic@example.test', submittedAt: '2026-10-25T00:00:00Z', updatedAt: '2026-10-25T00:00:00Z', jobTitle: 'Synthetic JD', status: 'SUBMITTED', matchRecommendation: 'GOOD_FIT', matchDecision: 'SHORTLIST', matchPriority: 'HIGH', matchSummary: 'LEGACY_FIT_SENTINEL', matchNextActions: ['LEGACY_ACTION'], matchMatchedSkills: ['LEGACY_SKILL'], matchMissingSkills: [], matchRiskFlags: [] }
const html = (Component, props) => renderToStaticMarkup(React.createElement(Component, props))
const noLegacy = output => { for (const text of ['99%', 'EXCELLENT', 'LEGACY_FIT_SENTINEL', 'GOOD_FIT', 'SHORTLIST', 'LEGACY_SKILL', 'LEGACY_ACTION', '(baseline)']) assert.ok(!output.includes(text), text) }
for (const locale of ['vi', 'en', 'ja']) {
  const { recruiterApplications: labels } = load(`src/i18n/locales/${locale}/pages/recruiterApplications.ts`)
  const { recruiterCandidates: candidateLabels } = load(`src/i18n/locales/${locale}/pages/recruiterCandidates.ts`)
  test(`${locale}: incoming numeric payload hidden in badge, desktop/mobile list and full drawer`, () => {
    const mapped = mapper.createRecruiterApplicationFromApi(synthetic, { formatDate: x => x, meta: labels.meta })
    assert.equal(mapped.matchScore, null); assert.equal(mapped.matchRecommendation, null); assert.equal(mapped.skills.length, 0)
    // Bypass the mapper as well: views must stay safe for incoming historical values.
    const item = { ...mapped, ...synthetic, candidateName: synthetic.candidateFullName, timeline: [] }
    noLegacy(html(AiMatchBadge, { application: item, labels: labels.match }))
    for (const Component of [ApplicationTable, ApplicationMobileList]) noLegacy(html(Component, { applications: [item], actions: labels.results, columns: labels.results.columns, handlers: {}, statusLabels: labels.statusLabels, matchLabels: labels.match }))
    const output = html(drawer.ApplicationDetailDrawer, { application: item, isMatching: false, matchLabels: labels.match, meta: labels.meta, statusLabels: labels.statusLabels, translations: labels.drawer, matchingMessage: matchingCopy[locale].parseReady })
    noLegacy(output)
    assert.ok(output.includes('AI1 evidence retained'))
    assert.ok(output.includes(matchingCopy[locale].parseReady))
    assert.ok(output.includes(labels.match.cvParseStatus.PARSED))
    assert.ok(!output.includes('0%'))
  })
  test(`${locale}: directory card/history hide numeric best-match and all fit labels`, () => {
    const candidate = { fullName: 'Synthetic Candidate', email: 'synthetic@example.test', skills: [], bestMatchScore: 99, bestMatchLevel: 'EXCELLENT', latestJobTitle: 'Synthetic JD', latestStatus: 'SUBMITTED', lastAppliedAt: synthetic.submittedAt, applications: [synthetic] }
    const props = { candidate, locale, translations: candidateLabels, statusLabels: labels.statusLabels }
    noLegacy(html(candidates.CandidateCard, props)); noLegacy(html(candidates.CandidateDrawer, props))
  })
}
test('dashboard mapper hides historical numeric input before rendering', () => {
  const { recruiterHome } = load('src/i18n/locales/en/pages/recruiterHome.ts')
  const cards = dashboard.mapApplications([synthetic], recruiterHome, 'en')
  assert.equal(cards[0].score, '')
  assert.equal(cards[0].scoreTone, 'empty')
})

test('transient application/status GET 503 recover within finite budget without retrying POST', async () => {
  const transient = Object.assign(new Error('503'), { response: { status: 503 } })
  let appReads = 0, statusReads = 0
  assert.equal(await pollMatchingStatus(options({
    readApplication: async () => { if (++appReads === 1) throw transient; return application },
    readStatus: async () => { if (++statusReads === 1) throw transient; return envelope(row()) },
  })), 'succeeded')
  assert.equal(appReads, 3); assert.equal(statusReads, 2)
})
test('repeated transient failures exhaust finite budget as network failure, not failed job', async () => {
  let reads = 0
  const error = Object.assign(new Error('503'), { response: { status: 503 } })
  await assert.rejects(pollMatchingStatus(options({ readStatus: async () => { reads++; throw error } })), e => e === error)
  assert.equal(reads, 3)
})
test('401/403/404 stop on first GET while malformed identity also fails promptly', async () => {
  for (const status of [401, 403, 404]) {
    let reads = 0
    const error = Object.assign(new Error(String(status)), { response: { status } })
    await assert.rejects(pollMatchingStatus(options({ readStatus: async () => { reads++; throw error } })), e => e === error)
    assert.equal(reads, 1)
  }
  let reads = 0
  await assert.rejects(pollMatchingStatus(options({ readStatus: async () => { reads++; return envelope({ ...row(), candidateId: 'foreign' }) } })), InvalidMatchingStatusError)
  assert.equal(reads, 1)
})
