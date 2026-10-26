import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { createServer } from 'vite'

// Real local Chrome + React interactions, mocked Axios adapter. No BE, credentials,
// provider calls, downloads, browser test framework or new dependencies.
const chrome = process.env.AI1_TEST_CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
assert.ok(existsSync(chrome), 'Set AI1_TEST_CHROME to an existing Chrome/Edge executable')
const profile = mkdtempSync(resolve('node_modules/.tmp/ai1-ui-browser-'))
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
    name: 'ai1-test-html', configureServer(server) {
      server.middlewares.use('/__ai1-ui-test__', async (_req, res) => {
        res.setHeader('Content-Type', 'text/html')
        res.end(await server.transformIndexHtml('/__ai1-ui-test__', '<!doctype html><html lang="vi"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0"><div id="root"></div><script type="module" src="/tests/ai1/ai1-browser-harness.tsx"></script></body></html>'))
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
  await cdp('Page.navigate', { url: `${origin}/__ai1-ui-test__` })
  await wait("document.body.innerText.includes('EXACT QUOTE synthetic-a')")
  assert.equal(await evaluate("window.ai1Harness.calls[0].url"), '/recruiter/applications/synthetic-a/hr-review')
  assert.equal(await evaluate("window.ai1Harness.calls[0].method"), 'get'); passed()
  assert.equal(await evaluate("document.querySelector('blockquote').textContent"), 'EXACT QUOTE synthetic-a\nNo AWS experience. <script>window.injected=true</script>')
  assert.equal(await evaluate('window.injected === true'), false); passed()
  assert.ok(await evaluate("document.body.innerText.includes(' / 100') && document.body.innerText.includes('HR chưa xác nhận')")); passed()
  // Real details expand/collapse and localized component rule.
  await evaluate("document.querySelector('.ai1-evidence__components summary').click()")
  assert.equal(await evaluate("document.querySelector('.ai1-evidence__components').open"), true); passed()
  const count = await evaluate('window.ai1Harness.calls.length')
  await evaluate("document.querySelector('.ai1-evidence__header button').click()")
  await wait(`window.ai1Harness.calls.length === ${count + 1} && document.querySelector('[aria-busy]').getAttribute('aria-busy') === 'false'`); passed()
  // Resolve old application request after new one. No old quote may overwrite new.
  await evaluate("window.ai1Harness.set('slow', 'synthetic-old')")
  await wait("window.ai1Harness.calls.some(c => c.url.includes('synthetic-old'))")
  assert.ok(await evaluate("document.querySelector('[aria-busy]').getAttribute('aria-busy') === 'true'"))
  await evaluate("window.ai1Harness.set('ready', 'synthetic-new')")
  await wait("document.body.innerText.includes('EXACT QUOTE synthetic-new')")
  await sleep(800)
  assert.equal(await evaluate("document.body.innerText.includes('EXACT QUOTE synthetic-old')"), false); passed()
  for (const [mode, expected] of [
    ['null', 'Chưa có kết quả đối chiếu'], ['unavailable', 'Bằng chứng AI1 hiện không khả dụng'],
    ['disabled', 'Kết quả này chưa thực hiện truy hồi'], ['invalid', 'Dữ liệu phản hồi không đúng contract'],
    ['forbidden', 'Bạn không có quyền xem hồ sơ này'], ['error', 'Không tải được bằng chứng'],
  ]) {
    await evaluate(`window.ai1Harness.set('${mode}')`)
    await wait(`document.body.innerText.includes(${JSON.stringify(expected)})`)
    assert.equal(await evaluate("document.body.innerText.includes('EXACT QUOTE')"), false); passed()
  }
  await evaluate("window.ai1Harness.set('warning')")
  await wait("document.body.innerText.includes('Đoạn này có dấu hiệu phủ định')")
  assert.ok(await evaluate("document.body.innerText.includes('vượt giới hạn ngữ cảnh')")); passed()
  await evaluate('window.ai1Harness.matching(true)')
  await wait("document.body.innerText.includes('Matching đang được yêu cầu/xử lý')"); passed()
  await evaluate("window.ai1Harness.matching(false); window.ai1Harness.set('plan')")
  await wait("document.body.innerText.includes('Không tải được cấu trúc JD; vẫn xem bằng chứng')")
  assert.ok(await evaluate("document.querySelector('blockquote') !== null")); passed()
  await evaluate("window.ai1Harness.set('overview')")
  await wait("document.querySelectorAll('.ai1-evidence__navigation button').length === 10")
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false })
  await sleep(150)
  const desktop = await evaluate(`(() => {
    const drawer = document.querySelector('.recruiter-application-detail-drawer').getBoundingClientRect();
    const nav = document.querySelector('.ai1-evidence__navigation').getBoundingClientRect();
    const detail = document.querySelector('.ai1-evidence__requirement').getBoundingClientRect();
    const quote = document.querySelector('blockquote').getBoundingClientRect();
    return {width: drawer.width, height: drawer.height, navWidth: nav.width, detailWidth: detail.width, sideBySide: nav.right <= detail.left + 1, quoteTop: quote.top, quoteBottom: quote.bottom, active: document.querySelectorAll('.ai1-evidence__requirement').length, bodyHeight: document.querySelector('.recruiter-application-detail-drawer__body').scrollHeight, innerScrollers: [...document.querySelectorAll('.ai1-evidence *')].filter(el => ['auto','scroll'].includes(getComputedStyle(el).overflowY)).length};
  })()`)
  assert.equal(desktop.width, 1120); assert.equal(desktop.height, 900)
  assert.ok(desktop.sideBySide && desktop.detailWidth > desktop.navWidth)
  assert.equal(desktop.active, 1); assert.equal(desktop.innerScrollers, 0)
  assert.ok(desktop.quoteTop < 650 && desktop.quoteBottom < 900, 'Initial quote must be fully visible')
  const screenshotDir = resolve('node_modules/.tmp')
  async function screenshot(name) {
    const {data} = await cdp('Page.captureScreenshot', {format: 'png', captureBeyondViewport: false})
    const path = join(screenshotDir, name); writeFileSync(path, Buffer.from(data, 'base64')); return path
  }
  const screenshots = [await screenshot('ai1-ux-002-desktop.png')]; passed()
  assert.ok(await evaluate("document.querySelector('.ai1-evidence__sources').open && document.querySelector('.ai1-evidence__sources').innerText.includes('Nguồn trong CV') && [...document.querySelectorAll('.ai1-evidence__provenance')].every(el => !el.open)")); passed()
  // Native button focus + real keyboard selection, with one active requirement.
  await evaluate("document.querySelectorAll('.ai1-evidence__navigation button')[9].focus()")
  await cdp('Input.dispatchKeyEvent', {type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13})
  await cdp('Input.dispatchKeyEvent', {type: 'char', text: '\r', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13})
  await cdp('Input.dispatchKeyEvent', {type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13})
  await wait("document.querySelector('.ai1-evidence__requirement h4').textContent === 'Triển khai dịch vụ trên AWS'")
  assert.equal(await evaluate("document.querySelectorAll('.ai1-evidence__requirement').length"), 1)
  await evaluate("document.querySelectorAll('.ai1-evidence__navigation button')[0].click()")
  await wait("document.querySelector('blockquote').textContent.startsWith('SYNTHETIC QUOTE 1.')")
  await evaluate("document.querySelector('.ai1-evidence__full summary').focus()")
  await cdp('Input.dispatchKeyEvent', {type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13})
  await cdp('Input.dispatchKeyEvent', {type: 'char', text: '\r', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13})
  await cdp('Input.dispatchKeyEvent', {type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13})
  await wait("document.querySelector('.ai1-evidence__full').open")
  assert.ok(await evaluate("document.querySelector('.ai1-evidence__full blockquote').textContent.length > 1000")); passed()
  await evaluate("document.querySelectorAll('.ai1-evidence__passage-nav button')[1].click()")
  await wait("document.body.innerText.includes('Cùng nội dung tại 2 vị trí')")
  assert.ok(await evaluate("document.body.innerText.includes('Đoạn này có dấu hiệu phủ định')"))
  assert.equal(await evaluate("document.querySelectorAll('.ai1-evidence__passages > .ai1-evidence__quote blockquote').length"), 1)
  const provenance = await evaluate("document.querySelector('.ai1-evidence__quote .ai1-evidence__provenance').textContent")
  assert.equal(await evaluate("document.querySelector('.ai1-evidence__quote .ai1-evidence__source').textContent"), 'Kỹ năng liệt kê · Dự án · công nghệ được liệt kê')
  assert.ok(provenance.includes('synthetic-0/1') && provenance.includes('uuid-0/technologies/0') && provenance.includes('72.5'))
  assert.ok(await evaluate(`(() => {
    const source = document.querySelector('.ai1-evidence__sources');
    const text = document.body.innerText;
    return source.open && source.querySelectorAll('li').length === 2 && source.innerText.includes('Kỹ năng liệt kê') && source.innerText.includes('Dự án · công nghệ được liệt kê') && source.innerText.includes('72.5') && !text.includes('uuid-0/technologies/0') && !text.includes('EXPLICIT_NEGATION_CUE') && [...document.querySelectorAll('.ai1-evidence__provenance')].every(el => !el.open);
  })()`)); passed()
  screenshots.push(await screenshot('ai1-ux-002-duplicate-warning.png')); passed()
  await cdp('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: false })
  await sleep(150)
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 375'), 'Mobile content overflows horizontally')
  assert.equal(await evaluate("document.querySelector('.recruiter-application-detail-drawer').getBoundingClientRect().width"), 375)
  assert.ok(await evaluate("getComputedStyle(document.querySelector('.ai1-evidence__navigation')).display === 'none' && document.querySelector('select').options.length === 10"))
  await evaluate("const s = document.querySelector('select'); s.value = '9'; s.dispatchEvent(new Event('change', {bubbles:true}))")
  await wait("document.querySelector('.ai1-evidence__requirement h4').textContent === 'Triển khai dịch vụ trên AWS'")
  assert.ok(await evaluate("document.querySelector('blockquote').textContent.startsWith('SYNTHETIC QUOTE 10.')"))
  screenshots.push(await screenshot('ai1-ux-002-mobile.png'))
  await evaluate("document.querySelector('.recruiter-application-detail-drawer__body').scrollTop = 290")
  screenshots.push(await screenshot('ai1-ux-002-mobile-evidence.png')); passed()
  console.log(JSON.stringify({desktop, screenshots}, null, 2))
  assert.deepEqual(failures, [])
  assert.ok(requests.every((url) => url.startsWith(origin) || url.startsWith('data:')), 'Unexpected external page request')
  passed()
  console.log(JSON.stringify({ checks, passed: checks, browser: 'local headless Chrome via CDP', api: 'mocked Axios adapter', live_backend: false, external_page_requests: 0, console_exceptions: failures.length }, null, 2))
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await cdp('Browser.close') } catch { /* process cleanup below */ } }
  socket?.close()
  if (browser && browser.exitCode === null) browser.kill()
  await server?.close()
  for (const callbacks of pending.values()) callbacks.reject(new Error('Test finished'))
  await sleep(500)
  assert.ok(profile.startsWith(resolve('node_modules/.tmp/ai1-ui-browser-')))
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }) } catch { console.warn(`Chrome profile cleanup deferred: ${profile}`) }
}
