import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import { createServer } from 'vite'

// No environment variables: deterministic fixtures only. Existing live invocation stays opt-in.
const origin = process.env.CANDIDATE_TEST_ORIGIN
const live = Boolean(origin)
const job = process.env.CANDIDATE_TEST_JOB
const cv = process.env.CANDIDATE_TEST_CV
if (live) {
  const url = new URL(origin)
  assert.equal(url.hostname, '127.0.0.1')
  assert.equal(url.protocol, 'http:')
  assert.ok(job && cv && process.env.CANDIDATE_TEST_USER, 'Live mode requires synthetic job, CV and user IDs')
}
const parsedCvs = [
  { id: 'cv-a', title: 'Synthetic CV A', parseStatus: 'PARSED' },
  { id: 'cv-b', title: 'Synthetic CV B', parseStatus: 'PARSED' },
  { id: 'cv-unparsed', title: 'Synthetic unparsed CV', parseStatus: 'NOT_PARSED' },
]
let profileFailures = 0
let profileCvs = parsedCvs
let profileRequests = 0
let plans = []
const requests = []
const pending = []
let server, browser
const checkName = 'Kiểm tra CV với công việc này'
const resultName = 'Có đoạn tham chiếu để bạn kiểm tra'
function resultFor(cvId, jobId, marker) {
  return {
    schemaVersion: 'candidate-preparation-v1', status: 'READY', jobId, candidateCvId: cvId,
    private: true, applicationCreated: false, candidateSupportVerified: false,
    jobSnapshotSha256: 'a'.repeat(64), cvSnapshotSha256: 'b'.repeat(64),
    warnings: ['NO_EXPERIENCE_OR_PROJECT_RECORDS', 'CV_EVIDENCE_CONTEXT_TRUNCATED', 'FUTURE_WARNING'],
    requirements: [
      { requirement: 'PostgreSQL', importance: 'MUST_HAVE', status: 'REVIEW_REFERENCES',
        evidence: [{ id: 'e1', source: 'experience', text: marker }], prompt: 'Reference only' },
      { requirement: 'Kubernetes', importance: 'NICE_TO_HAVE', status: 'NO_REFERENCE_FOUND', evidence: [], prompt: 'No reference' },
    ],
  }
}
function json(res, status, value) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(value))
}
try {
  server = await createServer({ server: { host: '127.0.0.1', port: 0 }, plugins: [{ name: 'candidate-preparation-test', configureServer(vite) {
    vite.middlewares.use(async (req, res, next) => {
      try {
        if (req.url.startsWith('/__candidate_fixture__')) {
          const path = req.url.slice('/__candidate_fixture__'.length)
          if (path === '/candidates/me') {
            assert.equal(req.method, 'GET')
            profileRequests++
            if (profileFailures-- > 0) { json(res, 503, { success: false }); return }
            json(res, 200, { success: true, data: { cvs: profileCvs, defaultCv: profileCvs[0] ?? null } })
            return
          }
          assert.equal(req.method, 'POST')
          const match = path.match(/^\/candidates\/me\/cvs\/([^/]+)\/jobs\/([^/]+)\/preparation$/)
          assert.ok(match, 'Only private preparation endpoint is allowed')
          const [, cvId, jobId] = match
          requests.push({ cvId, jobId })
          const plan = plans.shift() ?? {}
          if (plan.hold) await new Promise(resolve => pending.push(resolve))
          const data = { ...resultFor(cvId, jobId, plan.marker ?? `Reference ${cvId} ${jobId}`), ...plan.overrides }
          json(res, plan.status ?? 200, { success: plan.success ?? true, data })
          return
        }
        if (req.url.startsWith('/__candidate_live__')) {
          assert.ok(live, 'Live requests require explicit opt-in')
          const path = req.url.slice('/__candidate_live__'.length)
          if (path === '/candidates/me') {
            json(res, 200, { success: true, data: { cvs: [{ id: cv, title: 'Synthetic CV', parseStatus: 'PARSED' }], defaultCv: { id: cv } } })
            return
          }
          assert.equal(path, `/candidates/me/cvs/${encodeURIComponent(cv)}/jobs/${encodeURIComponent(job)}/preparation`)
          const response = await fetch(origin + '/api/v1' + path, { method: 'POST', headers: { 'x-user-id': process.env.CANDIDATE_TEST_USER, 'x-user-role': 'CANDIDATE' } })
          res.statusCode = response.status
          res.setHeader('Content-Type', 'application/json')
          res.end(await response.text())
          return
        }
        if (req.url.startsWith('/__candidate_test__')) {
          res.setHeader('Content-Type', 'text/html')
          res.end(await vite.transformIndexHtml('/__candidate_test__', '<html><meta name="viewport" content="width=device-width, initial-scale=1"><body><div id="root"></div><script type="module" src="/tests/jd-plan/candidate-preparation-harness.tsx"></script></body></html>'))
          return
        }
        next()
      } catch (error) {
        console.error(error)
        json(res, 500, { success: false })
      }
    })
  } }] })
  await server.listen()
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  const page = await browser.newPage()
  page.setDefaultTimeout(15000)
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  const base = `http://127.0.0.1:${server.httpServer.address().port}/__candidate_test__`
  const check = page.getByRole('button', { name: checkName, exact: true })
  const select = page.getByLabel('Chọn CV', { exact: true })
  const ready = () => page.getByText(resultName, { exact: true }).first().waitFor({ timeout: live ? 95000 : 15000 })
  const rendered = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  let checks = 0
  if (live) {
    await page.goto(`${base}?job=${encodeURIComponent(job)}`)
    await check.click()
    await ready()
    assert.ok((await page.locator('blockquote').allTextContents()).some(x => x.includes('PostgreSQL')))
    assert.ok((await page.locator('body').innerText()).includes('không tạo đơn ứng tuyển'))
    await check.click()
    await ready()
    await page.setViewportSize({ width: 375, height: 812 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= 375))
    await page.screenshot({ path: 'node_modules/.tmp/candidate-preparation-live.png', fullPage: true })
    checks = 5
  } else {
    // The linked route is the real candidate editor, not a placeholder or application route.
    const routes = await readFile(new URL('../../src/app/routes/routeObjects.tsx', import.meta.url), 'utf8')
    assert.match(routes, /path: '\/profile',[\s\S]*?element: <ProfilePage \/>,[\s\S]*?access: candidateAccess/)
    const editor = await readFile(new URL('../../src/pages/ProfilePage/index.tsx', import.meta.url), 'utf8')
    assert.ok(editor.includes('candidateService.updateMyProfile(') && editor.includes('ResumeLinksForm'))
    profileFailures = 1
    await page.goto(`${base}?mode=fixture&job=job-a`)
    await page.getByRole('alert').waitFor()
    assert.equal(await check.isDisabled(), true)
    await page.getByRole('button', { name: 'Tải lại danh sách CV', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('select')?.value === 'cv-a')
    assert.equal(await page.getByRole('alert').count(), 0)
    assert.equal(await page.getByRole('link', { name: 'Kiểm tra/chỉnh hồ sơ và CV' }).getAttribute('href'), '/profile')
    checks++

    plans.push({ status: 503 })
    await check.click()
    await page.getByRole('alert').waitFor()
    assert.ok((await page.getByRole('alert').innerText()).includes('CV và đơn ứng tuyển không bị thay đổi'))
    assert.equal(await check.isEnabled(), true)
    await check.click()
    await ready()
    assert.equal(await page.getByRole('alert').count(), 0)
    const text = await page.locator('body').innerText()
    for (const code of ['NO_EXPERIENCE_OR_PROJECT_RECORDS', 'CV_EVIDENCE_CONTEXT_TRUNCATED', 'FUTURE_WARNING']) assert.ok(!text.includes(code))
    for (const message of ['chưa có kinh nghiệm làm việc hoặc dự án', 'chỉ một phần được dùng để đối chiếu', 'chưa được mô tả cụ thể', 'không đồng nghĩa bạn thiếu năng lực', 'không tạo đơn ứng tuyển']) assert.ok(text.includes(message))
    checks++

    await select.selectOption('cv-b')
    assert.equal(await page.locator('blockquote').count(), 0)
    assert.equal(await page.getByRole('status').count(), 0)
    await check.click()
    await ready()
    assert.deepEqual(await page.locator('blockquote').allTextContents(), ['Reference cv-b job-a'])
    checks++

    // A new request must hide the previous successful result immediately, including on failure.
    plans.push({ hold: true, status: 503 })
    const started = page.waitForRequest(r => r.url().endsWith('/preparation'))
    await check.click()
    await started
    assert.equal(await page.locator('blockquote').count(), 0)
    assert.equal(await page.getByRole('button', { name: 'Đang đối chiếu…', exact: true }).isDisabled(), true)
    const failed = page.waitForResponse(r => r.url().endsWith('/preparation'))
    pending.shift()()
    await failed
    await page.getByRole('alert').waitFor()
    await check.click()
    await ready()
    checks++

    // Switch CV while an old request is pending; its late result cannot replace the new CV's result.
    plans.push({ hold: true, marker: 'STALE CV A' }, { marker: 'CURRENT CV B' })
    await select.selectOption('cv-a')
    const oldCvStarted = page.waitForRequest(r => r.url().includes('/cvs/cv-a/'))
    await check.click()
    await oldCvStarted
    await select.selectOption('cv-b')
    await check.click()
    await ready()
    const oldCvFinished = page.waitForResponse(r => r.url().includes('/cvs/cv-a/'))
    pending.shift()()
    await oldCvFinished
    await rendered()
    assert.deepEqual(await page.locator('blockquote').allTextContents(), ['CURRENT CV B'])
    checks++

    // Job prop changes without remounting: clear results, reload CVs and ignore late failures.
    plans.push({ hold: true, status: 503 })
    const oldJobStarted = page.waitForRequest(r => r.url().includes('/jobs/job-a/'))
    await check.click()
    await oldJobStarted
    await page.getByRole('button', { name: 'Harness: switch job' }).click()
    await page.waitForFunction(() => document.querySelector('select')?.value === 'cv-a')
    assert.equal(await page.locator('blockquote').count(), 0)
    await check.click()
    await ready()
    const oldJobFinished = page.waitForResponse(r => r.url().includes('/jobs/job-a/'))
    pending.shift()()
    await oldJobFinished
    await rendered()
    assert.deepEqual(await page.locator('blockquote').allTextContents(), ['Reference cv-a job-b'])
    assert.equal(await page.getByRole('alert').count(), 0)
    checks++

    // Fail closed on invalid schemas, cross-source responses and unsuccessful envelopes.
    for (const plan of [{ overrides: { applicationCreated: true } }, { overrides: { candidateCvId: 'other-cv' } }, { overrides: { jobId: 'other-job' } }, { success: false }]) {
      plans.push(plan)
      await check.click()
      await page.getByRole('alert').waitFor()
      assert.equal(await page.locator('blockquote').count(), 0)
      assert.equal(await check.isEnabled(), true)
    }
    await select.selectOption('cv-unparsed')
    assert.equal(await check.isDisabled(), true)
    assert.equal(await page.getByRole('alert').count(), 0)
    checks++

    await select.selectOption('cv-a')
    // A fresh route also verifies that completed results reset when the job changes.
    await page.goto(`${base}?mode=fixture&job=job-a`)
    await check.click()
    await ready()
    await page.getByRole('button', { name: 'Harness: switch job' }).click()
    await page.waitForFunction(() => document.querySelector('select')?.value === 'cv-a')
    assert.equal(await page.locator('blockquote').count(), 0)
    await check.click()
    await ready()
    await page.setViewportSize({ width: 375, height: 812 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= 375))
    assert.ok(await page.locator('.job-detail-card').evaluate(el => getComputedStyle(el).borderRadius === '12px'))
    assert.ok(!(await page.locator('body').evaluate(el => getComputedStyle(el).fontFamily)).includes('Times New Roman'))
    await page.screenshot({ path: 'node_modules/.tmp/candidate-preparation-fixture-mobile.png', fullPage: true })
    checks++

    profileCvs = []
    await page.goto(`${base}?mode=fixture&job=job-a`)
    await page.getByText('Bạn chưa có CV.', { exact: false }).waitFor()
    assert.equal(await check.isDisabled(), true)
    const beforeProfile = profileRequests
    const beforePreparation = requests.length
    await page.goto(`${base}?mode=fixture&job=job-a&role=HR`)
    await rendered()
    assert.equal(await page.getByRole('region', { name: 'Chuẩn bị CV cho công việc này' }).count(), 0)
    assert.equal(profileRequests, beforeProfile)
    assert.equal(requests.length, beforePreparation)
    assert.equal(plans.length, 0)
    assert.equal(pending.length, 0)
    checks++
  }
  assert.deepEqual(errors, [])
  console.log(JSON.stringify(live
    ? { browser: true, realCandidateService: true, realMatchingModel: true, fixtureOwnershipAndParseStorage: true, jwt: false, checks }
    : { browser: true, fixtureOnly: true, paidCalls: false, checks, preparationRequests: requests.length, pageErrors: errors.length }))
} finally {
  for (const release of pending) release()
  await browser?.close()
  await server?.close()
}
