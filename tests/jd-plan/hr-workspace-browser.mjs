import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { chromium } from 'playwright'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
let document = null, conflict = false, unavailable = false, freshnessUnavailable = false, saveDelay = 0
const backend = process.env.HR_WORKSPACE_BACKEND_URL
if (backend && (!/^http:\/\/127\.0\.0\.1:\d+$/.test(backend) || Number(new URL(backend).port) < 1024 || Number(new URL(backend).port) > 65535)) throw new Error('Only operator-owned loopback backend URL is supported')
const cacheDir = await mkdtemp(join(tmpdir(), 'nexhire-wp04-vite-'))
const requests = []
let malformedReadiness = false, malformedWorkspace = '', getDelay = 0
const sources = [{ requirementId: 'r1', text: 'Maintain PostgreSQL backups', evidence: [{ evidenceId: 'e1', text: 'Tested database restores.', source: 'project' }] }]
const targetVersion = 'requirement-textual-support-v1'
const envelope = data => ({ success: true, data })
const workspace = () => envelope({ schemaVersion: 'hr-workspace-v1', document, stale: false, freshnessUnavailable, bindingScope: 'LATEST_MATCHING_RESULT', isTrainingLabel: false, hiringDecision: null })
let server, browser
try {
server = await createServer({ configLoader: 'runner', envFile: false, envDir: false, cacheDir, server: { host: '127.0.0.1', port: 0 }, plugins: [{ name: 'hr-fixture', configureServer(vite) {
  vite.middlewares.use(async (req, res, next) => {
    if (req.url?.startsWith('/__hr_fixture__')) {
      res.setHeader('Content-Type', 'application/json')
      const chunks = []; for await (const chunk of req) chunks.push(chunk)
      const raw = Buffer.concat(chunks).toString()
      const suffix = req.url.slice('/__hr_fixture__'.length)
      const userId = req.headers['x-test-user-id']
      if (backend) {
        const allowedSuffix = ['', '/support-judgments', '/support-review', '/support-export-readiness'].includes(suffix)
        const allowedMethod = req.method === 'POST' || req.method === 'GET' && suffix === ''
        const allowedUser = ['55555555-5555-4555-8555-555555555555', '66666666-6666-4666-8666-666666666666'].includes(userId)
        if (!allowedSuffix || !allowedMethod || !allowedUser || req.headers['x-test-company-id'] !== '77777777-7777-4777-8777-777777777777' || req.headers['x-test-role'] !== 'RECRUITER') { res.statusCode = 400; res.end('{}'); return }
        try {
          const response = await fetch(`${backend}/api/v1/recruiter/applications/22222222-2222-4222-8222-222222222222/review-workspace${suffix}`, {
            method: req.method, headers: { 'Content-Type': 'application/json', 'x-user-id': userId, 'x-company-id': req.headers['x-test-company-id'], 'x-user-role': req.headers['x-test-role'] }, body: req.method === 'POST' ? raw : undefined, signal: AbortSignal.timeout(15000),
          })
          res.statusCode = response.status; res.end(await response.text())
        } catch { res.statusCode = 502; res.end('{}') }
        return
      }
      if (unavailable) { res.statusCode = 503; res.end('{}'); return }
      if (req.method === 'POST') {
        const input = JSON.parse(raw); requests.push({ suffix, input, userId })
        if (conflict) { res.statusCode = 409; res.end('{}'); return }
        if (saveDelay) await new Promise(resolve => setTimeout(resolve, saveDelay))
        assert.equal(input.expectedRevision, document?.revision ?? 0)
        const now = new Date().toISOString(), revision = input.expectedRevision + 1
        if (suffix === '/support-export-readiness') {
          assert.deepEqual(input, { expectedRevision: document.revision, optIn: true })
          const judgments = document.requirements.filter(row => row.supportJudgment)
          const reviewed = judgments.filter(row => row.supportJudgment.workflow.state === 'REVIEWED').length
          res.end(JSON.stringify(envelope({ schemaVersion: 'support-export-readiness-v1', targetVersion, workspaceRevision: document.revision, checkedAt: now, optIn: true, exportAllowed: malformedReadiness, rows: malformedReadiness ? [{ private: 'must never display' }] : [], isTrainingLabel: false, hiringDecision: null, bindingScope: 'LATEST_MATCHING_RESULT', planStateScope: 'AT_MATCHING_TIME', currentPlanRevalidated: false, freshness: 'SNAPSHOT_AT_CHECK_TIME', stale: false, freshnessUnavailable: false, counts: { judgments: judgments.length, reviewed, reviewExcluded: judgments.length - reviewed, sourceExcluded: 0, excluded: judgments.length, eligible: 0, exported: 0 }, reasons: ['CONSENT_AUTHORITY_UNKNOWN', 'RETENTION_AUTHORITY_UNKNOWN', 'SOURCE_AVAILABILITY_UNKNOWN'] }))); return
        }
        if (!suffix) {
          assert.ok(input.requirements.every(row => !Object.hasOwn(row, 'supportJudgment')))
          const requirements = input.requirements.map(row => {
            const stored = document?.requirements.find(old => old.requirementId === row.requirementId)?.supportJudgment
            return stored ? { ...row, supportJudgment: { ...stored, workflow: { state: stored.workflow.state === 'HOLD' ? 'HOLD' : 'SUBMITTED', holdReasons: stored.workflow.state === 'HOLD' ? stored.workflow.holdReasons : [], checkedAt: now, approvalResetReason: 'WORKSPACE_REVISION_CHANGED' } } } : row
          })
          document = { ...input, requirements, applicationId: '22222222-2222-4222-8222-222222222222', revision, sourceRequirements: sources, reviewerId: userId, updatedAt: now }
        } else {
          document = structuredClone(document ?? { applicationId: '22222222-2222-4222-8222-222222222222', resultId: input.resultId, jobSnapshotSha256: input.jobSnapshotSha256, candidateSnapshotSha256: input.candidateSnapshotSha256, requirements: [], questions: [], interviewStatus: 'DRAFT', sourceRequirements: sources })
          if (suffix === '/support-judgments') {
            assert.equal(input.targetVersion, targetVersion)
            for (const item of input.judgments) {
              assert.deepEqual(Object.keys(item).sort(), ['requirementId', 'label', 'evidenceIds', 'rationale', 'uncertain'].sort())
              let row = document.requirements.find(row => row.requirementId === item.requirementId)
              if (!row) { row = { requirementId: item.requirementId, status: 'UNREVIEWED', note: '', evidenceIds: [] }; document.requirements.push(row) }
              const hold = item.uncertain || item.label === 'INSUFFICIENT_CONTEXT'
              row.supportJudgment = { ...item, targetVersion, binding: { resultId: document.resultId, jobSnapshotSha256: document.jobSnapshotSha256, candidateSnapshotSha256: document.candidateSnapshotSha256, planContentSha256: 'c'.repeat(64), retrievalModelVersion: 'SYNTHETIC:wp04-ui-model-v1', verifierModelVersion: null, assessmentSource: 'M1_RETRIEVAL', requirementTextSha256: 'd'.repeat(64), evidenceTextSha256: 'e'.repeat(64), sourceScope: 'RETRIEVED_EVIDENCE_ONLY', planStateScope: 'AT_MATCHING_TIME', currentPlanRevalidated: false, freshness: 'SNAPSHOT_AT_CHECK_TIME' }, submission: { submittedBy: userId, submittedAt: now, submittedRevision: revision, contentSha256: 'f'.repeat(64) }, workflow: { state: hold ? 'HOLD' : 'SUBMITTED', holdReasons: hold ? ['UNCERTAIN_OR_INSUFFICIENT_CONTEXT'] : [], checkedAt: now } }
            }
          } else if (suffix === '/support-review') {
            for (const row of document.requirements.filter(row => row.supportJudgment)) {
              const judgment = row.supportJudgment
              assert.notEqual(judgment.submission.submittedBy, userId)
              judgment.workflow = { state: input.decision === 'APPROVE' ? 'REVIEWED' : 'HOLD', holdReasons: input.decision === 'HOLD' ? ['HR_REVIEW_HOLD'] : [], checkedAt: now, review: { reviewedBy: userId, reviewedAt: now, reviewedRevision: revision, submittedRevision: judgment.submission.submittedRevision, submittedContentSha256: judgment.submission.contentSha256, decision: input.decision, reason: input.reason } }
            }
          } else throw new Error('Unknown fixture route')
          Object.assign(document, { revision, reviewerId: userId, updatedAt: now })
        }
      } else if (getDelay) await new Promise(resolve => setTimeout(resolve, getDelay))
      const output = structuredClone(workspace())
      if (malformedWorkspace && output.data.document?.requirements[0]?.supportJudgment) {
        const judgment = output.data.document.requirements[0].supportJudgment
        if (malformedWorkspace === 'binding') judgment.binding.resultId = '99999999-9999-4999-8999-999999999999'
        if (malformedWorkspace === 'approval') judgment.workflow = { state: 'REVIEWED', holdReasons: [], checkedAt: new Date().toISOString(), review: { reviewedBy: judgment.submission.submittedBy, reviewedAt: new Date().toISOString(), reviewedRevision: output.data.document.revision, submittedRevision: judgment.submission.submittedRevision, submittedContentSha256: judgment.submission.contentSha256, decision: 'APPROVE', reason: 'Forged self approval' } }
      }
      res.end(JSON.stringify(output)); return
    }
    if (req.url === '/__hr_test__') {
      res.setHeader('Content-Type', 'text/html')
      res.end(await vite.transformIndexHtml(req.url, '<html><meta name="viewport" content="width=device-width, initial-scale=1"><body><div id="root"></div><script type="module" src="/tests/jd-plan/hr-workspace-harness.tsx"></script></body></html>')); return
    }
    next()
  })
} }] })
  await server.listen(); const port = server.httpServer.address().port
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true }); const page = await browser.newPage(); const errors = []; page.setDefaultTimeout(12000)
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(`http://127.0.0.1:${port}/__hr_test__`)
  const checks = []
  if (backend) {
    for (const [suffix, headers] of [['/unknown', {}], ['/support-judgments', { 'x-test-user-id': 'unapproved' }], ['', { 'x-test-role': 'CANDIDATE' }]]) {
      const response = await fetch(`http://127.0.0.1:${port}/__hr_fixture__${suffix}`, { method: 'POST', headers: { 'x-test-user-id': '55555555-5555-4555-8555-555555555555', 'x-test-company-id': '77777777-7777-4777-8777-777777777777', 'x-test-role': 'RECRUITER', ...headers }, body: '{}' })
      assert.equal(response.status, 400)
    }
    checks.push('external-proxy-allowlist')
  }
  if (!backend) {
  await page.getByRole('heading', { name: 'Chuẩn bị phỏng vấn' }).waitFor()
  await page.getByRole('button', { name: 'Hỏi theo yêu cầu JD', exact: false }).click()
  await page.getByLabel('Tìm yêu cầu JD').fill('missing')
  await page.getByText('Không có yêu cầu phù hợp.').waitFor()
  await page.getByLabel('Tìm yêu cầu JD').fill('PostgreSQL')
  await page.getByRole('button', { name: 'Thêm câu hỏi: Maintain PostgreSQL backups' }).click()
  await page.getByRole('button', { name: 'Soi đoạn 1 trên PDF' }).click()
  assert.equal(await page.evaluate(() => window.locatedEvidence.phrase), 'Tested database restores.')
  assert.equal(await page.evaluate(() => window.locatedEvidence.sourceSection), 'project')
  await page.getByRole('button', { name: 'Xóa câu', exact: true }).click()
  await page.getByRole('alertdialog').waitFor()
  assert.equal(await page.getByLabel('Câu hỏi', { exact: true }).count(), 1)
  await page.getByRole('button', { name: 'Quay lại chỉnh sửa' }).click()
  assert.ok((await page.getByLabel('Câu hỏi', { exact: true }).inputValue()).includes('PostgreSQL'))
  await page.getByRole('button', { name: 'Xóa câu', exact: true }).click()
  await page.getByRole('button', { name: 'Xác nhận tiếp tục' }).click()
  assert.equal(await page.getByLabel('Câu hỏi', { exact: true }).count(), 0)
  assert.equal(await page.getByRole('button', { name: 'Hoàn tác', exact: true }).count(), 0)
  await page.getByRole('button', { name: '+ Vai trò & dự án' }).click()
  await page.getByLabel('Câu trả lời / ghi nhận phỏng vấn').fill('Restored a backup in staging.')
  await page.getByLabel('Trạng thái phiếu').selectOption('COMPLETED')
  await page.getByRole('button', { name: 'Lưu phiếu', exact: true }).click()
  await page.getByText(/Đã lưu lúc/).waitFor()
  assert.equal(document.revision, 1); assert.equal(document.requirements.length, 0); assert.equal(document.interviewStatus, 'COMPLETED')
  await page.reload()
  await page.getByLabel('Câu trả lời / ghi nhận phỏng vấn').waitFor()
  assert.equal(await page.getByLabel('Câu trả lời / ghi nhận phỏng vấn').inputValue(), 'Restored a backup in staging.')
  await page.getByLabel('Câu hỏi', { exact: true }).fill('<img src=x onerror="window.printInjected=true">')
  await page.context().addInitScript(() => { window.print = () => {} })
  const popupPromise = page.waitForEvent('popup')
  await page.getByRole('button', { name: 'In / lưu PDF' }).click()
  const popup = await popupPromise
  await popup.getByRole('heading', { name: 'PHIẾU PHỎNG VẤN', exact: true }).waitFor()
  assert.ok((await popup.locator('.identity').innerText()).includes('Ứng viên kiểm thử'))
  assert.ok((await popup.locator('.identity').innerText()).includes('Backend Developer'))
  assert.equal(await popup.locator('h1').evaluate(el => getComputedStyle(el).textAlign), 'center')
  assert.ok((await popup.locator('footer').innerText()).includes('BẢN NHÁP CHƯA LƯU'))
  assert.ok(!(await popup.locator('body').innerText()).includes('22222222-2222-4222-8222-222222222222'))
  assert.ok((await popup.locator('body').innerText()).includes('<img src=x onerror="window.printInjected=true">'))
  assert.ok((await popup.locator('body').innerText()).includes('BẢN NHÁP CHƯA LƯU'))
  assert.equal(await popup.locator('img').count(), 0)
  await popup.close()
  conflict = true
  await page.getByLabel('Câu hỏi', { exact: true }).fill('Unsaved conflict note')
  await page.getByRole('button', { name: 'Lưu phiếu', exact: true }).click()
  await page.getByRole('alert').filter({ hasText: 'Dữ liệu đã thay đổi' }).waitFor()
  assert.equal(await page.getByLabel('Câu hỏi', { exact: true }).inputValue(), 'Unsaved conflict note')
  page.once('dialog', dialog => dialog.dismiss())
  await page.getByRole('link', { name: 'Leave workspace' }).click() // Router push is guarded too.
  assert.equal(await page.getByLabel('Câu hỏi', { exact: true }).inputValue(), 'Unsaved conflict note')
  await page.evaluate(() => window.history.pushState({ ...window.history.state, idx: (window.history.state?.idx ?? 0) + 1 }, '', '/__hr_test__?next'))
  page.once('dialog', dialog => dialog.dismiss())
  await page.evaluate(() => window.history.back())
  await page.waitForTimeout(200)
  assert.equal(await page.getByLabel('Câu hỏi', { exact: true }).inputValue(), 'Unsaved conflict note')
  await page.evaluate(() => window.history.replaceState(window.history.state, '', '/__hr_test__'))

  assert.ok(page.url().endsWith('/__hr_test__'))
  assert.equal(await page.evaluate(() => window.dispatchEvent(new Event('hr-workspace-before-leave', { cancelable: true }))), false)
  await page.getByRole('alertdialog').waitFor()
  await page.keyboard.press('Escape')
  assert.equal(await page.getByRole('alertdialog').count(), 0)
  assert.equal(await page.getByLabel('Câu hỏi', { exact: true }).inputValue(), 'Unsaved conflict note')
  await page.setViewportSize({ width: 390, height: 844 }); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true)
  conflict = false
  page.once('dialog', d => d.accept()); await page.reload()
  document.resultId = '33333333-3333-4333-8333-333333333333'
  await page.reload()
  await page.getByText('Phiếu thuộc kết quả đối chiếu cũ.', { exact: false }).waitFor()
  await page.getByRole('button', { name: 'Tạo phiếu cho kết quả mới' }).click()
  await page.getByRole('button', { name: 'Xác nhận tiếp tục', exact: true }).click()
  await page.getByRole('button', { name: '+ Thêm câu hỏi riêng' }).click()
  await page.getByLabel('Câu hỏi', { exact: true }).fill('Fresh interview question')
  await page.getByRole('button', { name: 'Lưu phiếu', exact: true }).click()
  await page.getByText(/Đã lưu lúc/).waitFor(); assert.equal(document.revision, 2)
  unavailable = true; await page.reload()
  await page.getByRole('alert').waitFor(); assert.equal(await page.getByRole('button', { name: 'Lưu phiếu', exact: true }).isDisabled(), true)
  assert.equal(await page.getByRole('button', { name: 'In / lưu PDF' }).isDisabled(), true)
  unavailable = false; await page.getByRole('button', { name: 'Tải lại bản đã lưu' }).click()
  await page.getByLabel('Câu hỏi', { exact: true }).waitFor()
  freshnessUnavailable = true
  await page.reload()
  await page.getByText('Chưa xác minh được độ mới', { exact: false }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Lưu phiếu', exact: true }).isDisabled(), true)
  assert.equal(await page.getByLabel('Câu hỏi', { exact: true }).isDisabled(), true)
  freshnessUnavailable = false
  await page.reload()
  await page.getByLabel('Câu hỏi', { exact: true }).waitFor()
  await page.getByLabel('Câu hỏi', { exact: true }).fill('Draft survives binding refresh')
  saveDelay = 400
  await page.getByRole('button', { name: 'Lưu phiếu', exact: true }).click()
  await page.getByText('Đang lưu…', { exact: true }).waitFor()
  await page.evaluate(() => window.changeReviewBinding())
  await page.getByText('Kết quả đối chiếu đã thay đổi.', { exact: false }).waitFor()
  assert.ok((await page.locator('.hr-notebook').innerText()).includes('Draft survives binding refresh'))
  assert.equal(await page.getByRole('button', { name: 'Lưu phiếu', exact: true }).isDisabled(), true)
  await page.waitForTimeout(500)
  await page.getByRole('button', { name: 'Tạo phiếu cho kết quả mới' }).click()
  await page.getByRole('button', { name: 'Xác nhận tiếp tục', exact: true }).click()
  assert.equal(await page.getByRole('button', { name: '+ Thêm câu hỏi riêng' }).isEnabled(), true)
  assert.equal(await page.getByRole('button', { name: 'Lưu phiếu', exact: true }).isEnabled(), true)
  await page.evaluate(() => window.reviewUnavailable())
  await page.getByText('Chưa xác minh được độ mới', { exact: false }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Lưu phiếu', exact: true }).isDisabled(), true)
  assert.deepEqual(errors, [])
  checks.push('existing-interview-regressions')
  document = null; conflict = false; unavailable = false; freshnessUnavailable = false; saveDelay = 0
  page.once('dialog', d => d.accept()); await page.reload()
  }
  await page.getByRole('heading', { name: 'Phản hồi bằng chứng từng yêu cầu' }).waitFor()
  const feedback = page.getByRole('region', { name: 'Phản hồi bằng chứng', exact: true })
  const openRow = async () => { const detail = feedback.locator('details').first(); if (!await detail.evaluate(el => el.open)) await detail.locator('summary').click() }
  const send = page.getByRole('button', { name: 'Gửi phản hồi bằng chứng', exact: true })
  const saveNotes = page.getByRole('button', { name: 'Lưu phiếu', exact: true })
  const choose = page.getByLabel('Mức hỗ trợ: Maintain PostgreSQL backups', { exact: true })
  const rationale = page.getByLabel('Lý do phản hồi: Maintain PostgreSQL backups', { exact: true })
  const uncertain = page.getByLabel('Tôi còn băn khoăn về phản hồi này', { exact: true })
  await page.getByRole('button', { name: '+ Vai trò & dự án' }).click()
  await page.getByLabel('Câu trả lời / ghi nhận phỏng vấn').fill('Synthetic interview note remains private.')
  await openRow(); assert.equal(await choose.isDisabled(), true)
  await saveNotes.click(); await page.getByText(/Đã lưu lúc/).waitFor()
  checks.push('notes-draft-blocks-feedback')
  await openRow(); await choose.selectOption('SUPPORTED'); await send.click()
  await page.getByRole('alert').filter({ hasText: 'Mỗi phản hồi cần lý do' }).waitFor()
  await rationale.fill('Synthetic private support rationale')
  await send.click(); await page.getByRole('alert').filter({ hasText: 'Chọn ít nhất một đoạn' }).waitFor()
  await feedback.getByLabel('Tested database restores.', { exact: false }).check(); await uncertain.uncheck()
  assert.equal(await page.getByLabel('Câu trả lời / ghi nhận phỏng vấn').isDisabled(), true)
  await send.click(); await feedback.getByText('Bạn đã gửi ít nhất một phản hồi', { exact: false }).waitFor()
  await openRow(); await feedback.getByText('Đã lưu: Có bằng chứng hỗ trợ', { exact: false }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Duyệt phản hồi', exact: true }).isDisabled(), true)
  assert.equal(await page.getByLabel('Câu trả lời / ghi nhận phỏng vấn').inputValue(), 'Synthetic interview note remains private.')
  checks.push('label-evidence-validation', 'submit-server-provenance', 'feedback-draft-blocks-notes', 'immutable-self-review-block')
  await page.evaluate(() => window.switchReviewer('66666666-6666-4666-8666-666666666666'))
  await page.getByLabel('Lý do xem lại', { exact: true }).fill('Synthetic independent review')
  await page.getByRole('button', { name: 'Duyệt phản hồi', exact: true }).click()
  await feedback.getByText('Đã được HR khác duyệt', { exact: false }).waitFor()
  checks.push('second-hr-approval')
  await page.getByLabel('Câu trả lời / ghi nhận phỏng vấn').fill('Updated notes invalidate approval.')
  await saveNotes.click(); await openRow()
  await feedback.getByText('Ghi chú đã thay đổi;', { exact: false }).waitFor()
  assert.equal(await feedback.getByText('Đã được HR khác duyệt', { exact: false }).count(), 0)
  assert.equal(await rationale.inputValue(), 'Synthetic private support rationale')
  checks.push('notes-revision-resets-approval-keeps-feedback')
  const readinessButton = page.getByRole('button', { name: 'Kiểm tra điều kiện', exact: true })
  assert.equal(await readinessButton.isDisabled(), true)
  await page.getByLabel('Tôi đồng ý yêu cầu kiểm tra điều kiện sử dụng phản hồi.', { exact: true }).check()
  await readinessButton.click(); await feedback.getByText('Chưa được phép xuất hoặc dùng làm dữ liệu huấn luyện.', { exact: false }).waitFor()
  assert.equal(await feedback.getByRole('link').count(), 0)
  checks.push('explicit-opt-in-readiness-denies-export')
  await page.context().addInitScript(() => { window.print = () => {} })
  const printPopup = page.waitForEvent('popup'); await page.getByRole('button', { name: 'In / lưu PDF' }).click()
  const printed = await printPopup; await printed.getByRole('heading', { name: 'PHIẾU PHỎNG VẤN', exact: true }).waitFor()
  const printedText = await printed.locator('body').innerText()
  assert.ok(!printedText.includes('Synthetic private support rationale')); assert.ok(!printedText.includes('55555555-5555'))
  await printed.close(); checks.push('print-excludes-support-private-data')
  if (!backend) {
    for (const label of ['PARTIAL', 'CONTRADICTED', 'INSUFFICIENT_CONTEXT']) {
      await openRow(); await choose.selectOption(label); await rationale.fill(`Synthetic ${label} rationale`)
      await send.click(); await openRow(); await feedback.getByText(`Đã lưu: ${label === 'PARTIAL' ? 'Hỗ trợ một phần' : label === 'CONTRADICTED' ? 'Có bằng chứng trái ngược' : 'Chưa đủ ngữ cảnh'}`, { exact: false }).waitFor()
      assert.equal(document.requirements[0].supportJudgment.label, label)
    }
    checks.push('all-four-labels')
    await page.evaluate(() => window.switchReviewer('55555555-5555-4555-8555-555555555555'))
    await page.getByLabel('Lý do xem lại', { exact: true }).fill('Need more context')
    assert.equal(await page.getByRole('button', { name: 'Duyệt phản hồi', exact: true }).isDisabled(), true)
    await page.getByRole('button', { name: 'Tạm giữ phản hồi', exact: true }).click()
    await openRow(); await feedback.getByText('HR xem lại:', { exact: false }).waitFor()
    assert.equal(document.requirements[0].supportJudgment.workflow.state, 'HOLD')
    checks.push('insufficient-context-hold-and-second-hr-hold')
    await choose.selectOption('SUPPORTED'); await rationale.fill('Draft retained on conflict')
    conflict = true; const before = requests.length; await send.click()
    await page.getByRole('alert').filter({ hasText: 'Dữ liệu đã thay đổi' }).waitFor()
    assert.equal(await rationale.inputValue(), 'Draft retained on conflict'); assert.equal(await send.isDisabled(), true)
    await page.waitForTimeout(100); assert.equal(requests.length, before + 1)
    checks.push('409-retains-draft-blocks-write-no-retry')
    conflict = false
    await page.evaluate(() => window.switchCompany('88888888-8888-4888-8888-888888888888'))
    await openRow(); assert.notEqual(await rationale.inputValue(), 'Draft retained on conflict')
    checks.push('company-switch-clears-private-draft')
    await choose.selectOption('SUPPORTED'); await rationale.fill('Account private draft')
    getDelay = 150
    await page.evaluate(() => window.switchReviewer('66666666-6666-4666-8666-666666666666'))
    await page.getByRole('heading', { name: 'Phản hồi bằng chứng từng yêu cầu' }).waitFor()
    await openRow(); assert.notEqual(await rationale.inputValue(), 'Account private draft')
    getDelay = 0; checks.push('account-switch-clears-private-draft')
    malformedReadiness = true
    await page.getByLabel('Tôi đồng ý yêu cầu kiểm tra điều kiện sử dụng phản hồi.', { exact: true }).check()
    await readinessButton.click(); await page.getByRole('alert').filter({ hasText: 'Không xác nhận được kết quả' }).waitFor()
    assert.equal(await feedback.getByText('must never display', { exact: false }).count(), 0)
    checks.push('malformed-readiness-fails-closed')
    malformedReadiness = false
    await page.evaluate(() => window.switchReviewer('55555555-5555-4555-8555-555555555555'))
    await openRow(); await choose.selectOption('SUPPORTED'); await rationale.fill('Delayed old-user feedback')
    saveDelay = 200; await send.click(); await page.getByText('Đang lưu…', { exact: true }).waitFor()
    await page.evaluate(() => window.switchReviewer('66666666-6666-4666-8666-666666666666'))
    await page.getByRole('heading', { name: 'Phản hồi bằng chứng từng yêu cầu' }).waitFor()
    await openRow(); const beforeLate = await rationale.inputValue()
    await page.waitForTimeout(300); assert.equal(await rationale.inputValue(), beforeLate)
    checks.push('delayed-write-account-fence')
    await page.setViewportSize({ width: 390, height: 844 }); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true)
    checks.push('mobile-feedback-no-overflow')
    saveDelay = 0
    await choose.selectOption('SUPPORTED'); await rationale.fill('Must clear after explicit new result')
    await page.evaluate(() => window.changeReviewBinding())
    await page.getByText('Kết quả đối chiếu đã thay đổi.', { exact: false }).waitFor()
    assert.equal(await rationale.inputValue(), 'Must clear after explicit new result')
    await page.getByRole('button', { name: 'Tạo phiếu cho kết quả mới' }).click()
    await page.getByRole('button', { name: 'Xác nhận tiếp tục', exact: true }).click()
    await openRow(); assert.equal(await rationale.inputValue(), ''); assert.equal(await send.isDisabled(), true)
    checks.push('explicit-new-result-clears-old-support-draft')
    page.once('dialog', d => d.accept()); await page.reload()
    for (const invalid of ['binding', 'approval']) {
      malformedWorkspace = invalid; await page.reload()
      await page.getByRole('alert').filter({ hasText: 'Không tải được phiếu' }).waitFor()
      assert.equal(await saveNotes.isDisabled(), true); assert.equal(await send.isDisabled(), true)
    }
    malformedWorkspace = ''; checks.push('nested-binding-and-forged-approval-fail-closed')
    await page.reload(); await openRow(); await choose.selectOption('SUPPORTED'); await rationale.fill('Different application private draft')
    await page.evaluate(() => window.switchApplication('99999999-9999-4999-8999-999999999999'))
    await page.getByRole('alert').filter({ hasText: 'Không tải được phiếu' }).waitFor()
    assert.ok(!(await page.locator('body').innerText()).includes('Different application private draft'))
    checks.push('application-switch-clears-private-draft')
    await page.evaluate(() => window.unmountNotebook()); assert.equal(await page.locator('.hr-notebook').count(), 0)
    checks.push('unmount-removes-private-workspace')
  }
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ mode: backend ? 'actual-backend' : 'synthetic-api-mock', passed: checks.length, checks, pageErrors: errors.length }))
} finally {
  await browser?.close(); await server?.close()
  const expectedParent = resolve(tmpdir())
  if (resolve(cacheDir).startsWith(`${expectedParent}\\`) || resolve(cacheDir).startsWith(`${expectedParent}/`)) await rm(cacheDir, { recursive: true, force: true })
}
