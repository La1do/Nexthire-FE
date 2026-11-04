import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const root = new URL('../../', import.meta.url)
const compile = path => ts.transpileModule(readFileSync(new URL(path, root), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText
const parser = {}
vm.runInNewContext(compile('src/types/ai2-pool.types.ts'), { exports: parser })
const apps = Array.from({ length: 8 }, (_, i) => ({ id: `app-${i}`, jobId: 'job', candidateId: `c-${i}`, candidateCvId: `cv-${i}`, status: 'SUBMITTED', submittedAt: `2026-10-${String(20 - i).padStart(2, '0')}T00:00:00Z` }))
const pool = () => ({ success: true, data: { schemaVersion: 'ai2-demo-pool-v1', experimental: true, automaticallyReject: false, hiringDecision: null, jobId: 'job', status: 'READY', requestedCount: 8, comparedCount: 8,
  items: apps.slice().reverse().map((app, index) => ({ applicationId: app.id, candidateId: app.candidateId, candidateCvId: app.candidateCvId, resultId: `r-${app.id}`, rankingPosition: index < 2 ? 1 : index + 1 })) } })
function mount(overrides = {}) {
  const applied = [], resets = [], calls = [], cleanup = []
  const service = {
    async getRecruiterApplicationAi2Pool() { return pool() },
    async getRecruiterApplications(params) {
      calls.push(params)
      return { data: apps.slice((params.page - 1) * 6, params.page * 6), meta: { total: 8, totalPages: 2, page: params.page, limit: 6 } }
    }, ...overrides,
  }
  const exports = {}
  vm.runInNewContext(compile('src/pages/RecruiterApplicationsPage/components/ai2/Ai2ReviewOrder.tsx'), {
    exports, AbortController, Map, setTimeout, clearTimeout, window: { setTimeout, clearTimeout },
    require(id) {
      if (id === 'react') return { useState: value => [value, () => {}], useRef: value => ({ current: value }), useEffect: effect => cleanup.push(effect()) }
      if (id.endsWith('application.service')) return { applicationService: service }
      if (id.endsWith('ai2-pool.types')) return parser
      if (id.endsWith('.css')) return {}
      return require(id)
    },
  })
  const tree = exports.Ai2ReviewOrder({ applicationId: 'app-0', jobId: 'job', locale: 'en', applied: true, disabled: false, onApply: order => applied.push(order), onReset: () => resets.push(true) })
  const controls = tree.props.children[0].props.children
  return { apply: controls[1].props.onClick, reset: controls[2].props.onClick, applied, resets, calls, unmount: () => cleanup.forEach(fn => fn?.()) }
}
const tick = () => new Promise(resolve => setTimeout(resolve, 0))
test('READY loads both server pages before applying eight identities; equal positions keep newest order', async () => {
  const mounted = mount()
  mounted.apply(); await tick()
  assert.deepEqual(mounted.calls.map(call => call.page), [1, 2])
  assert.equal(mounted.applied.length, 1)
  assert.equal(mounted.applied[0].applications.length, 8)
  assert.deepEqual(Array.from(mounted.applied[0].applications, row => row.id), ['app-6', 'app-7', 'app-5', 'app-4', 'app-3', 'app-2', 'app-1', 'app-0'])
  assert.equal(mounted.applied[0].ranks['app-6'], 1)
  mounted.unmount()
})
test('missing authorized rows and unavailable pools never apply a partial order', async () => {
  for (const overrides of [
    { async getRecruiterApplications() { return { data: apps.slice(0, 6), meta: { total: 8, totalPages: 1, page: 1, limit: 100 } } } },
    { async getRecruiterApplicationAi2Pool() { return { ...pool(), data: { ...pool().data, status: 'UNAVAILABLE', items: [], comparedCount: 0 } } } },
  ]) {
    const mounted = mount(overrides); mounted.apply(); await tick()
    assert.equal(mounted.applied.length, 0); assert.ok(mounted.resets.length >= 2); mounted.unmount()
  }
})
test('reset and unmount prevent a late READY request from applying', async () => {
  for (const operation of ['reset', 'unmount']) {
    let release
    const mounted = mount({ getRecruiterApplicationAi2Pool: () => new Promise(resolve => { release = resolve }) })
    mounted.apply(); mounted[operation](); release(pool()); await tick()
    assert.equal(mounted.applied.length, 0)
    mounted.unmount()
  }
})
test('changed second pool check clears the order', async () => {
  let calls = 0
  const mounted = mount({ async getRecruiterApplicationAi2Pool() { const value = pool(); if (++calls > 1) value.data.items[0].resultId = 'changed'; return value } })
  mounted.apply(); await tick(); assert.equal(mounted.applied.length, 0); mounted.unmount()
})
