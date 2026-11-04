import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import { createRequire } from 'node:module'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const source = readFileSync(new URL('../../src/types/ai2-demo.types.ts', import.meta.url), 'utf8')
const exports = {}
vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports })
const { parseAi2DemoEnvelope: parse } = exports
const ready = () => ({ schemaVersion: 'ai2-demo-score-v1', applicationId: 'a', jobId: 'j',
  resultId: 'r', status: 'READY', score: -1.2, experimental: true,
  scoreMeaning: 'RELATIVE_RANKING_SCORE', rankingPosition: null, automaticallyReject: false,
  hiringDecision: null, attributionStatus: 'UNAVAILABLE', modelVersion: 'ai2-demo-xgb-observed-v1:5c0c5e3d4e81',
  jobSnapshotSha256: 'a'.repeat(64), candidateSnapshotSha256: 'b'.repeat(64), referenceDate: '2026-10-18' })
const wrap = (data) => ({ success: true, data })
const poolExports = {}
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../../src/types/ai2-pool.types.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: poolExports })
test('pool parser rejects partial pools, foreign job and invalid order', () => {
  const base = { schemaVersion: 'ai2-demo-pool-v1', experimental: true, automaticallyReject: false,
    hiringDecision: null, requestedCount: 2, comparedCount: 2, status: 'READY', jobId: 'j',
    items: [{ applicationId: 'a', rankingPosition: 1, resultId: 'ra' }, { applicationId: 'b', rankingPosition: 2, resultId: 'rb' }] }
  assert.equal(poolExports.parseAi2Pool(wrap(base), 'b', 'j').rank, 2)
  assert.throws(() => poolExports.parseAi2Pool(wrap(base), 'b', 'foreign'))
  assert.throws(() => poolExports.parseAi2Pool(wrap({ ...base, items: base.items.slice(0, 1) }), 'a', 'j'))
  assert.throws(() => poolExports.parseAi2Pool(wrap({ ...base, items: [{ applicationId: 'a', rankingPosition: 2 }, base.items[1]] }), 'a', 'j'))
})
const viewExports = {}
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../../src/pages/RecruiterApplicationsPage/components/ai2/Ai2DemoView.tsx', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText, { exports: viewExports, require: createRequire(import.meta.url) })
test('verified pool position renders without raw score', () => {
  const html = renderToStaticMarkup(React.createElement(viewExports.Ai2DemoView, { locale: 'vi', loading: false, failed: false,
    value: null, pool: { status: 'READY', count: 3, rank: 2 } }))
  assert.ok(html.includes('Gợi ý xem thứ 2 trong 3 hồ sơ'))
  assert.ok(!html.includes('1.2586'))
})
for (const locale of ['vi', 'en', 'ja']) {
  test(`${locale}: HR copy avoids invented rank and technical data is in a closed disclosure`, () => {
    const html = renderToStaticMarkup(React.createElement(viewExports.Ai2DemoView, { locale, loading: false, failed: false, value: parse(wrap(ready()), 'a', 'j') }))
    assert.ok(html.includes('<details>'))
    assert.ok(!html.includes('<details open'))
    const visible = html.replace(/<details>[\s\S]*?<\/details>/g, '')
    assert.ok(!visible.includes('-1.2000') && !visible.includes('ai2-demo-xgb'))
    assert.ok(!visible.includes('1 / 1') && !visible.includes('Top 1'))
    assert.ok(!visible.includes('only 1') && !visible.includes('chỉ có 1'))
  })
}
test('accept finite relative scores including negative; disabled has no score', () => {
  assert.equal(parse(wrap(ready()), 'a', 'j').score, -1.2)
  assert.equal(parse(wrap({ ...ready(), status: 'DISABLED', score: null }), 'a', 'j').score, null)
  assert.equal(parse(wrap(null), 'a', 'j'), null)
})
test('reject foreign identities, unsafe semantics and malformed metadata', () => {
  for (const mutation of [{ applicationId: 'foreign' }, { jobId: 'foreign' },
    { score: Infinity }, { score: '1' }, { scoreMeaning: 'PERCENT_FIT' },
    { rankingPosition: 1 }, { automaticallyReject: true }, { modelVersion: 'other' },
    { jobSnapshotSha256: '' }, { referenceDate: '2026-02-30' }, { referenceDate: 'bad' },
    { resultId: '' }, { attributionStatus: 'VERIFIED' }, { status: 'UNAVAILABLE' }]) {
    assert.throws(() => parse(wrap({ ...ready(), ...mutation }), 'a', 'j'))
  }
})
test('content-quality withholding never invents rank, fit percentage or support', () => {
  for (const locale of ['vi', 'en', 'ja']) {
    const html = renderToStaticMarkup(React.createElement(viewExports.Ai2DemoView, {
      locale, loading: false, failed: false, value: parse(wrap({ ...ready(), score: 98.5 }), 'a', 'j'),
      pool: { status: 'UNAVAILABLE', count: 3, rank: null, reason: 'CONTENT_QUALITY_NOT_VALIDATED' },
    }))
    const visible = html.replace(/<details>[\s\S]*?<\/details>/g, '')
    assert.ok(!visible.includes('98.5') && !visible.includes('%'))
    assert.ok(!visible.includes('Suggested review position') && !visible.includes('Gợi ý xem thứ') && !visible.includes('確認順序：'))
    assert.ok(html.includes('98.5000') && !html.includes('<details open'))
    assert.ok(visible.includes(locale === 'vi' ? 'Chất lượng đánh giá nội dung chưa được xác nhận' : locale === 'ja' ? '内容評価の品質が未確認' : 'Content assessment quality is not validated'))
  }
})

test('AI2 stays development-only, explicitly opt-in, and binds ready pool to the current score result', () => {
  const panel = readFileSync(new URL('../../src/pages/RecruiterApplicationsPage/components/ai2/Ai2DemoPanel.tsx', import.meta.url), 'utf8')
  assert.ok(panel.includes("import.meta.env.DEV && import.meta.env.VITE_AI2_DEMO_ENABLED === 'true'"))
  assert.ok(panel.includes('if (!enabled || isMatching) return'))
  assert.ok(panel.includes('if (!enabled) return null'))
  assert.ok(panel.includes("value.status !== 'READY' || pool.resultId !== value.resultId"))
})

test('allowlist excludes arbitrary downstream content', () => {
  assert.equal(parse(wrap({ ...ready(), privateSource: 'secret' }), 'a', 'j').privateSource, undefined)
})
