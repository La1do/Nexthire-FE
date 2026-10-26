import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { createServer } from 'vite'

// Real local Chrome + React interactions, mocked Axios adapter. No BE, credentials,
// provider calls, downloads, browser test framework or new dependencies.
const chrome = process.env.AI1_TEST_CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
assert.ok(existsSync(chrome), 'Set AI1_TEST_CHROME to an existing Chrome/Edge executable')
const profile = mkdtempSync(resolve('node_modules/.tmp/jd-plan-dev-browser-'))
let browser, socket, server
const pending = new Map()
let sequence = 0
const failures = []
const requests = []
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
async function cdp(method, params = {}) {
  const id = ++sequence
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timed out: ${method}`)) }, 15000)
    pending.set(id, { resolve: (value) => { clearTimeout(timer); resolve(value) }, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  assert.ok(!response.exceptionDetails, JSON.stringify(response.exceptionDetails))
  return response.result.value
}
async function wait(expression) {
  for (let i = 0; i < 100; i++) {
    if (await evaluate(expression)) return
    await sleep(100)
  }
  throw new Error(`UI did not reach expected state: ${expression}`)
}
let checks = 0
function passed() { checks++ }
try {
  server = await createServer({ server: { host: '127.0.0.1', port: 0 }, plugins: [{
    name: 'jd-plan-test-html', configureServer(server) {
      server.middlewares.use('/__jd-plan-test__', async (_req, res) => {
        res.setHeader('Content-Type', 'text/html')
        res.end(await server.transformIndexHtml('/__jd-plan-test__', '<!doctype html><html lang="vi"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0"><div id="root"></div><script type="module" src="/tests/jd-plan/jd-plan-dev-harness.tsx"></script></body></html>'))
      })
    },
  }] })
  await server.listen()
  const address = server.httpServer.address()
  const origin = `http://127.0.0.1:${address.port}`
  browser = spawn(chrome, ['--headless=new', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync', 'about:blank'], { windowsHide: true, stdio: 'ignore' })
  browser.on('error', (error) => failures.push(error.message))
  for (let i = 0; i < 100 && !existsSync(join(profile, 'DevToolsActivePort')); i++) await sleep(100)
  const debugPort = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim()
  const tabs = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()
  socket = new WebSocket(tabs.find((tab) => tab.type === 'page').webSocketDebuggerUrl)
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    if (message.id && pending.has(message.id)) {
      const callbacks = pending.get(message.id); pending.delete(message.id)
      if (message.error) callbacks.reject(new Error(JSON.stringify(message.error)))
      else callbacks.resolve(message.result)
    }
    if (message.method === 'Runtime.exceptionThrown') failures.push(message.params.exceptionDetails.text)
    if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request.url)
  }
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  await cdp('Runtime.enable'); await cdp('Network.enable'); await cdp('Page.enable')
  await cdp('Page.navigate', { url: `${origin}/__jd-plan-test__` })
  await wait('window.jdHarness !== undefined')
  await evaluate("window.jdHarness.navigate('/recruiter/jobs/synthetic-a')")
  await wait("document.body.innerText.includes('Chưa chuẩn bị')")
  async function click(text) {
    await evaluate(`(() => { const b = [...document.querySelectorAll('.jd-plan button')].find(b => b.textContent === ${JSON.stringify(text)}); if (!b || b.disabled) throw new Error('Missing or disabled: ' + ${JSON.stringify(text)}); b.click(); })()`)
  }
  async function field(selector, value) {
    await evaluate(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(e.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set.call(e, ${JSON.stringify(value)}); e.dispatchEvent(new Event('input', {bubbles: true})); })()`)
  }
  await click('Chuẩn bị bản nháp từ JD hiện tại')
  await wait("document.querySelectorAll('.jd-plan__summary-table tbody tr').length === 1 && document.querySelector('.jd-plan').getAttribute('aria-busy') === 'false'")
  assert.equal(await evaluate("window.jdHarness.calls.find(c => c.url.endsWith('/drafts')).data.expectedLatestRevision"), 0); passed()
  assert.equal(await evaluate("document.querySelectorAll('dialog, .jd-plan__group').length"), 0); passed()
  await click('Điều chỉnh')
  await wait("document.querySelector('dialog')?.open")
  assert.equal(await evaluate("document.querySelectorAll('dialog select[aria-label^=\"Kết hợp\"]').length"), 0); passed()
  await field('dialog .jd-plan__component input', 'Use SQL')
  await click('Hủy')
  assert.equal(await evaluate("window.jdHarness.calls.filter(c => c.method === 'patch').length"), 0); passed()
  await click('Điều chỉnh')
  await wait("document.querySelector('dialog')?.open")
  await field('dialog .jd-plan__component input', 'Use SQL')
  await click('+ Thêm nội dung')
  await field('dialog .jd-plan__component:nth-of-type(2) input', 'Use AWS')
  await field('dialog .jd-plan__component:nth-of-type(2) textarea', 'AWS')
  await click('+ Thêm nội dung')
  await field('dialog .jd-plan__component:nth-of-type(3) input', 'Use Azure')
  await field('dialog .jd-plan__component:nth-of-type(3) textarea', 'Azure')
  await evaluate("(() => { const s = document.querySelector('dialog .jd-plan__component:nth-of-type(3) select'); s.value = 'or'; s.dispatchEvent(new Event('change', { bubbles: true })); })()")
  assert.ok(await evaluate("document.querySelector('dialog .jd-plan__rule').innerText.includes('Use SQL VÀ (Use AWS HOẶC Use Azure)')")); passed()
  assert.ok(await evaluate("document.querySelector('.jd-plan__confirm button').disabled")); passed()
  // Regression: repeated Tab/Shift+Tab must never escape the modal.
  for (const modifiers of [0, 8]) {
    for (let i = 0; i < 32; i++) {
      await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers })
      await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9, modifiers })
      assert.ok(await evaluate("document.querySelector('dialog').contains(document.activeElement)"))
    }
  }
  passed()
  await click('Áp dụng')
  await wait("!document.querySelector('dialog')")
  assert.ok(await evaluate("document.querySelector('.jd-plan__table-rule').innerText.includes('Use SQL VÀ (Use AWS HOẶC Use Azure)')")); passed()
  await click('Điều chỉnh')
  await wait("document.querySelector('dialog')?.open")
  await field('dialog .jd-plan__component input', 'Abandoned edit')
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
  await wait("!document.querySelector('dialog')")
  assert.ok(await evaluate("!document.querySelector('.jd-plan__table-rule').innerText.includes('Abandoned edit')")); passed()
  await click('Lưu phiên bản nháp mới')
  await wait("document.body.innerText.includes('Đã lưu bản nháp mới.')")
  assert.equal(await evaluate("JSON.stringify(window.jdHarness.calls.filter(c => c.method === 'patch').at(-1).data.requirements[0].all_of.map(g => g.map(id => window.jdHarness.calls.filter(c => c.method === 'patch').at(-1).data.requirements[0].components.find(c => c.id === id).query)))"), JSON.stringify([['Use SQL'], ['Use AWS', 'Use Azure']])); passed()
  await evaluate("document.querySelector('.jd-plan__confirm input').click()")
  await click('Xác nhận cấu trúc đã lưu')
  await wait("document.body.innerText.includes('Đã xác nhận cấu trúc đã lưu.')")
  await click('Xem')
  await wait("document.querySelector('dialog')?.open")
  assert.ok(await evaluate("document.querySelector('dialog fieldset').disabled && ![...document.querySelectorAll('dialog button')].some(b => b.textContent === 'Áp dụng')")); passed()
  await click('Đóng')
  await click('Chỉnh thành phiên bản mới')
  await click('Điều chỉnh')
  await wait("document.querySelector('dialog')?.open")
  await field('dialog .jd-plan__component input', 'SQL retained')
  await evaluate('window.confirm = () => false')
  await evaluate("document.querySelector('nav a:nth-of-type(2)').click()")
  await sleep(100)
  assert.ok(await evaluate("location.pathname.endsWith('synthetic-a') && document.querySelector('dialog .jd-plan__component input').value === 'SQL retained'")); passed()
  await evaluate('history.back()'); await sleep(400)
  assert.ok(await evaluate("location.pathname.endsWith('synthetic-a') && document.querySelector('dialog .jd-plan__component input').value === 'SQL retained'")); passed()
  await click('Áp dụng')
  await click('Bỏ chỉnh sửa và tải phiên bản mới nhất')
  assert.ok(await evaluate("document.querySelector('.jd-plan__table-rule').innerText.includes('SQL retained')")); passed()
  await evaluate('window.confirm = () => true')
  await click('Bỏ chỉnh sửa và tải phiên bản mới nhất')
  await wait("document.querySelector('.jd-plan__table-rule')?.innerText.includes('Use SQL')"); passed()

  // Race: old job GET resolves after new route GET; no old editable panel.
  await evaluate("window.jdHarness.delay('synthetic-old'); window.jdHarness.navigate('/recruiter/jobs/synthetic-old')")
  await sleep(30)
  await evaluate("window.jdHarness.navigate('/recruiter/jobs/synthetic-b')")
  await wait("document.querySelector('h1')?.textContent === 'Synthetic synthetic-b'")
  await sleep(800)
  assert.equal(await evaluate("document.querySelector('h1').textContent"), 'Synthetic synthetic-b'); passed()
  await cdp('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: false })
  await evaluate("window.jdHarness.navigate('/recruiter/jobs/synthetic-a')")
  await wait("document.querySelector('.jd-plan__table-rule') !== null")
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 375')); passed()
  const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  writeFileSync(resolve('node_modules/.tmp/jd-plan-004-mobile.png'), Buffer.from(shot.data, 'base64'))
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false })
  const desktop = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  writeFileSync(resolve('node_modules/.tmp/jd-plan-004-desktop.png'), Buffer.from(desktop.data, 'base64'))
  assert.deepEqual(failures, [])
  assert.ok(requests.every(url => url.startsWith(origin) || url.startsWith('data:')))
  console.log(JSON.stringify({ checks, passed: checks, api: 'synthetic mocked Axios', backend: false, screenshots: ['node_modules/.tmp/jd-plan-004-mobile.png', 'node_modules/.tmp/jd-plan-004-desktop.png'] }))
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await cdp('Browser.close') } catch {} }
  socket?.close()
  if (browser && browser.exitCode === null) browser.kill()
  await server?.close()
  for (const callbacks of pending.values()) callbacks.reject(new Error('Test finished'))
  await sleep(500)
  assert.ok(profile.startsWith(resolve('node_modules/.tmp/jd-plan-dev-browser-')))
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }) } catch { console.warn(`Chrome profile cleanup deferred: ${profile}`) }
}