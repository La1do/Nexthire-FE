import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
const require = createRequire(import.meta.url)
function load(file, mocks = {}) {
  const output = ts.transpileModule(readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2023 } }).outputText
  const exports = {}
  vm.runInNewContext(output, { exports, require: id => Object.hasOwn(mocks, id) ? mocks[id] : require(id) }, { filename: file })
  return exports
}
const types = load('src/types/requirement-plan.types.ts')
const { planCopy } = load('src/pages/RecruiterJobsPage/components/requirement-plan/planCopy.ts')
const { RequirementEditor } = load('src/pages/RecruiterJobsPage/components/requirement-plan/RequirementEditor.tsx', { '../../../../types/requirement-plan.types': types })
const row = () => ({ requirement_id: 'requirements/0', original_text: 'Use SQL and AWS or Azure.', components: [
  { id: 'sql', query: 'Use SQL', source_quote: 'SQL', importance: 'core' },
  { id: 'aws', query: 'Use AWS', source_quote: 'AWS', importance: 'core' },
  { id: 'azure', query: 'Use Azure', source_quote: 'Azure', importance: 'preferred' },
], all_of: [['sql'], ['aws', 'azure']], joint_context_required: false })
function inspection() { return { status: 'DRAFT', current_job_snapshot_sha256: 'a'.repeat(64), content_sha256: 'b'.repeat(64), publishing_blocked: false, candidate_support_verified: false, matching_mode: 'unverified', plan: { schema_version: 'jd-fixed-requirements-v1', job_id: 'synthetic-job', job_snapshot_sha256: 'a'.repeat(64), revision: 1, requirements: [row()], approval: null } } }
const issues = value => types.validatePlanEdits([value], [row()])
test('SQL AND (AWS OR Azure) is valid; original source/order preserved', () => {
  assert.equal(issues(row()).length, 0)
  const second = { ...row(), requirement_id: 'skills/0', original_text: 'SQL' }
  assert.ok(types.validatePlanEdits([row(), second], [second, row()]).includes('source'))
  assert.ok(types.validatePlanEdits([], [row()]).includes('source'))
})
test('reject empty/duplicate/dangling/unused groups and duplicate IDs/queries', () => {
  for (const groups of [[[]], [['missing']], [['sql']], [['sql'], ['azure', 'aws'], ['aws', 'azure']], [['sql', 'sql'], ['aws', 'azure']]]) {
    const r = row(); r.all_of = groups; assert.ok(issues(r).includes('groups'))
  }
  let r = row(); r.components[1].id = 'sql'; assert.ok(issues(r).includes('query'))
  r = row(); r.components[1].query = r.components[0].query; assert.ok(issues(r).includes('query'))
})
test('case-sensitive exact quotes; no multiline/HTML/list/block queries', () => {
  for (const quote of ['', 'sql', 'NOT IN ORIGINAL', ' '.repeat(5001)]) { const r = row(); r.components[0].source_quote = quote; assert.ok(issues(r).includes('quote')) }
  for (const query of ['', ' Use SQL ', 'SQL\nAWS', '- SQL', '1. SQL', '<b>SQL</b>', 'SQL &amp; AWS', 'x'.repeat(5001)]) { const r = row(); r.components[0].query = query; assert.ok(issues(r).includes('query'), query) }
})
test('component removal prunes references and empty groups without reordering source', () => {
  const r = types.removePlanComponent(row(), 'sql')
  assert.equal(JSON.stringify(r.all_of), JSON.stringify([['aws', 'azure']]))
  assert.equal(r.original_text, row().original_text)
  assert.equal(issues(r).length, 0)
})
test('enforce component/group bounds', () => {
  let r = row(); r.components = Array.from({ length: 9 }, (_, n) => ({ ...r.components[0], id: `i${n}`, query: `query ${n}` })); assert.ok(issues(r).includes('bounds'))
  r = row(); r.all_of = Array.from({ length: 9 }, () => ['sql']); assert.ok(issues(r).includes('bounds'))
})
test('response binding fails closed for wrong job, foreign confirmation and stale current snapshot', () => {
  assert.equal(types.parsePlanInspection(inspection(), 'synthetic-job').status, 'DRAFT')
  assert.throws(() => types.parsePlanInspection(inspection(), 'foreign-job'))
  for (const mutation of [{ publishing_blocked: true }, { candidate_support_verified: true }, { status: 'HR_CONFIRMED' }, { current_job_snapshot_sha256: 'c'.repeat(64) }]) assert.throws(() => types.parsePlanInspection({ ...inspection(), ...mutation }, 'synthetic-job'))
  assert.equal(types.parsePlanInspection({ ...inspection(), status: 'STALE', current_job_snapshot_sha256: 'c'.repeat(64) }, 'synthetic-job').status, 'STALE')
})
test('readable groups and source quote form in three locales; escaped content, no ID titles', () => {
  for (const locale of ['vi', 'en', 'ja']) {
    const copy = planCopy[locale]
    const html = renderToStaticMarkup(React.createElement(RequirementEditor, { rows: [row()], readOnly: false, copy, onChange() {} }))
    for (const text of [copy.requirement, copy.importanceLabel, copy.editCriteria, 'Use SQL', 'Use AWS', 'Use Azure']) assert.ok(html.includes(text))
    assert.ok(!html.includes('>sql</') && !html.includes('requirement_id'))
    const r = row(); r.original_text = '<script>synthetic</script>'
    assert.ok(!renderToStaticMarkup(React.createElement(RequirementEditor, { rows: [r], readOnly: true, copy, onChange() {} })).includes('<script>'))
  }
})
test('client writes send only hash/revision and requirements through existing namespace', async () => {
  const calls = []
  const apiClient = Object.fromEntries(['get', 'post', 'patch'].map(method => [method, async (...args) => { calls.push({ method, args }); return { data: { success: true, data: inspection() } } }]))
  const { requirementPlanService: api } = load('src/services/requirement-plan.service.ts', { '../lib/api': { apiClient }, '../types/requirement-plan.types': types })
  await api.inspect('synthetic-job'); await api.draft('synthetic-job', 2); await api.save('synthetic-job', 'b'.repeat(64), [row()]); await api.confirm('synthetic-job', 'b'.repeat(64))
  assert.equal(calls[0].args[0], '/recruiter/jobs/synthetic-job/requirement-plan')
  assert.equal(calls[1].args[1].expectedLatestRevision, 2)
  assert.deepEqual(Object.keys(calls[2].args[1]).sort(), ['expectedContentSha256', 'requirements'])
  assert.deepEqual(Object.keys(calls[3].args[1]), ['expectedContentSha256'])
})
test('single requirement is compact and grouping matrix is absent; disclosures do not edit source', () => {
  for (const locale of ['vi', 'en', 'ja']) {
    const c = { id: 'whole', query: 'Node.js', source_quote: 'Node.js', importance: 'unknown' }
    const r = { requirement_id: 'skills/0', original_text: 'Node.js', components: [c], all_of: [['whole']], joint_context_required: false }
    const before = JSON.stringify(r)
    for (const readOnly of [false, true]) {
      let edits = 0
      const html = renderToStaticMarkup(React.createElement(RequirementEditor, { rows: [r], readOnly, copy: planCopy[locale], onChange() { edits++ } }))
      assert.ok(!html.includes('<dialog') && !html.includes('jd-plan__group'))
      assert.ok(!html.includes('<details open') && !html.includes('type="checkbox" checked'))
      assert.ok(html.includes('Node.js'))
      assert.equal(edits, 0)
      assert.equal(JSON.stringify(r), before)
    }
  }
})

test('readable rule preserves nested logic and overlapping clauses without rewriting data', () => {
  for (const groups of [[['sql'], ['aws', 'azure']], [['sql', 'aws'], ['sql', 'azure']]]) {
    const r = row(); r.all_of = groups
    const before = JSON.stringify(r)
    const html = renderToStaticMarkup(React.createElement(RequirementEditor, { rows: [r], readOnly: true, copy: planCopy.en, onChange() { throw new Error('Unexpected edit') } }))
    assert.ok(html.includes('AND') && html.includes('OR'))
    assert.equal(JSON.stringify(r), before)
    assert.ok(!html.includes('<select') && !html.includes('jd-plan__group'))
  }
})