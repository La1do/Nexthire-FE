import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { chromium } from 'playwright'
let document = null, conflict = false, unavailable = false, freshnessUnavailable = false, saveDelay = 0
const server = await createServer({ server: { host: '127.0.0.1', port: 0 }, plugins: [{ name: 'hr-fixture', configureServer(vite) {
  vite.middlewares.use(async (req, res, next) => {
    if (req.url === '/__hr_fixture__') {
      res.setHeader('Content-Type', 'application/json')
      if (unavailable) { res.statusCode = 503; res.end('{}'); return }
      if (req.method === 'POST') {
        if (conflict) { res.statusCode = 409; res.end('{}'); return }
        const chunks = []; for await (const chunk of req) chunks.push(chunk)
        const input = JSON.parse(Buffer.concat(chunks).toString())
        if (saveDelay) await new Promise(resolve => setTimeout(resolve, saveDelay))
        assert.equal(input.expectedRevision, document?.revision ?? 0)
        document = { ...input, applicationId: '22222222-2222-4222-8222-222222222222', revision: input.expectedRevision + 1,
          sourceRequirements: [{ requirementId: 'r1', text: 'Maintain PostgreSQL backups', evidence: [{ evidenceId: 'e1', text: 'Tested database restores.', source: 'project' }] }], reviewerId: 'hr', updatedAt: new Date().toISOString() }
      }
      res.end(JSON.stringify({ success: true, data: { schemaVersion: 'hr-workspace-v1', document, stale: false, freshnessUnavailable, bindingScope: 'LATEST_MATCHING_RESULT', isTrainingLabel: false, hiringDecision: null } })); return
    }
    if (req.url === '/__hr_test__') {
      res.setHeader('Content-Type', 'text/html')
      res.end(await vite.transformIndexHtml(req.url, '<html><meta name="viewport" content="width=device-width, initial-scale=1"><body><div id="root"></div><script type="module" src="/tests/jd-plan/hr-workspace-harness.tsx"></script></body></html>')); return
    }
    next()
  })
} }] })
let browser
try {
  await server.listen(); const port = server.httpServer.address().port
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true }); const page = await browser.newPage(); const errors = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto(`http://127.0.0.1:${port}/__hr_test__`)
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
  await popup.screenshot({ path: `${process.env.TEMP}/nexhire-interview-print-layout.png`, fullPage: true })
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
  await page.screenshot({ path: `${process.env.TEMP ?? process.env.TMP ?? '.'}/nexhire-hr-workspace-mobile.png`, fullPage: true })
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
  console.log(JSON.stringify({ passed: true, checks: ['template-question', 'completion', 'save', 'reload', 'conflict-retains-input', 'unsaved-navigation', 'mobile-width', 'stale-readonly', 'fresh-revision', 'load-failure-blocks-save-print', 'retry', 'print-draft-label', 'print-html-escaping'], pageErrors: errors.length }))
} finally { await browser?.close(); await server.close() }
