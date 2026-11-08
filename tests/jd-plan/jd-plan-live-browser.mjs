import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createServer } from 'vite'
import { chromium } from 'playwright'

// Invoked only by the BE disposable DB/worker fixture. Never accepts deployed origins.
const jobOrigin = process.env.PLAN_LIVE_JOB_ORIGIN
const matchingOrigin = process.env.PLAN_LIVE_MATCHING_ORIGIN
for (const value of [jobOrigin, matchingOrigin]) {
  const u = new URL(value)
  assert.equal(u.hostname, '127.0.0.1')
}
const jobId = process.env.PLAN_LIVE_JOB_ID
const identity = { 'x-user-id': process.env.PLAN_LIVE_HR_ID, 'x-user-role': 'RECRUITER', 'x-company-id': process.env.PLAN_LIVE_COMPANY_ID }
const internal = { 'x-internal-service-token': process.env.PLAN_LIVE_TOKEN, 'Content-Type': 'application/json' }
let server, browser
let matchingReview
async function readBody(req) { let body = ''; for await (const chunk of req) body += chunk; return body }
try {
  server = await createServer({ server: { host: '127.0.0.1', port: 0 }, plugins: [{
    name: 'live-jd-test', configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        try {
          if (req.url.startsWith('/__live__')) {
            const path = req.url.slice('/__live__'.length)
            assert.ok(path.startsWith(`/recruiter/jobs/${jobId}/requirement-plan`))
            const response = await fetch(jobOrigin + '/api/v1' + path, { method: req.method,
              headers: { ...identity, 'Content-Type': 'application/json' },
              body: req.method === 'GET' ? undefined : await readBody(req) })
            res.statusCode = response.status; res.setHeader('Content-Type', 'application/json'); res.end(await response.text()); return
          }
          if (req.url === '/__run_matching__') {
            const application = randomUUID()
            const response = await fetch(`${matchingOrigin}/api/v1/matching/applications/${application}/requests`, {
              method: 'POST', headers: internal, body: JSON.stringify({ applicationId: application, jobId,
                candidateId: randomUUID(), candidateCvId: randomUUID(), parsedResume: {
                  profile: { headline: 'Database engineer', summary: 'Administered PostgreSQL databases.' },
                  skills: [{ name: 'PostgreSQL' }], experiences: [{ position: 'Database engineer', companyName: 'Synthetic only',
                    description: 'Administered PostgreSQL databases and maintained backup restores.', startYear: 2022, startMonth: 1, endYear: 2025, endMonth: 1, isCurrent: false }],
                } }) })
            assert.ok(response.ok, 'enqueue must succeed')
            for (let i = 0; i < 300; i++) {
              await new Promise(r => setTimeout(r, 100))
              const result = await fetch(`${matchingOrigin}/api/v1/matching/applications/${application}/latest-hr-review`, { headers: internal })
              if (result.status === 404) continue
              assert.ok(result.ok)
              const value = (await result.json()).data
              if (value.assessmentStatus === 'PENDING_REVIEW') {
                assert.equal(value.candidateSupportVerified, false)
                assert.deepEqual(value.requirements.map(r => r.text), ['PostgreSQL'])
                assert.ok(value.requirements[0].evidence.some(e => e.text.includes('PostgreSQL')))
                matchingReview = value
                res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); return
              }
              if (value.assessmentStatus === 'UNAVAILABLE') throw new Error('Matching review unavailable')
            }
            throw new Error('Worker result timeout')
          }
          if (req.url.startsWith('/__jd_live__')) {
            res.setHeader('Content-Type', 'text/html')
            res.end(await vite.transformIndexHtml('/__jd_live__', '<html lang="vi"><body><div id="root"></div><script type="module" src="/tests/jd-plan/jd-plan-live-harness.tsx"></script></body></html>')); return
          }
          next()
        } catch { res.statusCode = 500; res.end('Synthetic live fixture failed') }
      })
    },
  }] })
  await server.listen()
  browser = await chromium.launch({ executablePath: process.env.AI1_TEST_CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  const page = await browser.newPage({ locale: 'vi-VN' })
  const errors = []; page.on('pageerror', e => errors.push(e.message))
  await page.goto(`http://127.0.0.1:${server.httpServer.address().port}/__jd_live__?job=${jobId}`)
  await page.getByRole('button', { name: 'Chỉnh thành phiên bản mới', exact: true }).click()
  const text = page.locator('.jd-plan__sources textarea').first()
  await text.fill('PostgreSQL')
  await page.getByRole('button', { name: 'Lưu phiên bản nháp mới', exact: true }).click()
  await page.getByText('Đã lưu bản nháp mới. Hãy rà soát rồi xác nhận.', { exact: true }).waitFor()
  await page.locator('.jd-plan__confirm input').check()
  await page.getByRole('button', { name: 'Xác nhận cấu trúc đã lưu', exact: true }).click()
  await page.getByText('Đã xác nhận cấu trúc đã lưu.', { exact: true }).waitFor()
  await page.locator('#run-live-matching').click()
  await page.waitForFunction(() => document.querySelector('.ai1-evidence__requirement h4')?.textContent === 'PostgreSQL', undefined, { timeout: 60000 }).catch(async error => {
    console.error(JSON.stringify({ browserErrors: errors, matchingReviewReady: Boolean(matchingReview), visibleText: (await page.locator('body').innerText()).slice(-3500) }))
    throw error
  })
  assert.ok(matchingReview)
  const shownQuotes = await page.locator('.ai1-evidence__requirement blockquote').allTextContents()
  assert.ok(shownQuotes.length > 0)
  assert.ok(shownQuotes.every(text => matchingReview.requirements[0].evidence.some(e => e.text === text)))
  const experienceIndex = matchingReview.requirements[0].evidence.findIndex(e => e.text.includes('maintained backup restores'))
  assert.ok(experienceIndex >= 0, 'Expected direct experience must be in retrieved Top3')
  await page.getByRole('button', { name: `Đoạn ${experienceIndex + 1}`, exact: true }).click()
  await page.waitForFunction(expected => [...document.querySelectorAll('.ai1-evidence__requirement blockquote')].some(e => e.textContent === expected), matchingReview.requirements[0].evidence[experienceIndex].text)
  assert.ok((await page.locator('.ai1-evidence__requirement').innerText()).includes('PostgreSQL'))
  assert.ok(await page.locator('.ai1-evidence__requirement').count() === 1)
  assert.deepEqual(errors, [])
  await page.screenshot({ path: 'node_modules/.tmp/jd-plan-v2-live.png', fullPage: true })
  console.log(JSON.stringify({ live_browser_worker: true, source_query: 'PostgreSQL', evidence_validated: true,
    synthetic_identity: true, jwt_login: false, admin_moderation: false, provider_calls: 0 }))
} finally { await browser?.close(); await server?.close() }
