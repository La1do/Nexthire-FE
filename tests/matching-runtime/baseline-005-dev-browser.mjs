import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { createServer } from 'vite'

// Real local Chrome + React interactions, mocked Axios adapter. No BE, credentials,
// provider calls, downloads, browser test framework or new dependencies.
const chrome = process.env.AI1_TEST_CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
assert.ok(existsSync(chrome), 'Set AI1_TEST_CHROME to an existing Chrome/Edge executable')
const profile = mkdtempSync(resolve('node_modules/.tmp/baseline-005-dev-browser-'))
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
    name: 'baseline-005-test-html', configureServer(server) {
      server.middlewares.use('/__baseline-005-test__', async (_req, res) => {
        res.setHeader('Content-Type', 'text/html')
        res.end(await server.transformIndexHtml('/__baseline-005-test__', '<!doctype html><html lang="vi"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0"><div id="root"></div><script type="module" src="/tests/matching-runtime/baseline-005-dev-harness.tsx"></script></body></html>'))
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
  await cdp('Page.navigate', { url: `${origin}/__baseline-005-test__` })
  await wait('window.baselineHarness !== undefined && !!document.querySelector(".recruiter-ai-match-panel button")')
  const button = "document.querySelector('.recruiter-ai-match-panel button')"
  const message = "document.querySelector('.recruiter-ai-match-panel [role=status]')?.textContent || ''"
  const noLegacy = async () => assert.ok(await evaluate("!/(99%|EXCELLENT|LEGACY_FIT_SENTINEL|GOOD_FIT|SHORTLIST|LEGACY_SKILL)/.test(document.body.innerText)"))
  await noLegacy(); passed()
  assert.ok(await evaluate("window.baselineHarness.calls.filter(c => c.url === '/recruiter/applications').every(c => c.params?.sortBy !== 'matchScore')")); passed()
  async function run(mode, expected) {
    await evaluate(`window.baselineHarness.set(${JSON.stringify(mode)})`)
    await wait(`!!${button}`)
    await evaluate(`${button}.click()`)
    await wait(`(${message}).includes(${JSON.stringify(expected)})`)
    await wait(`!${button}.disabled`)
    await noLegacy()
    assert.equal(await evaluate("window.baselineHarness.calls.filter(c => c.method === 'post').length"), 1)
    passed()
  }
  await run('success', 'New evidence retrieval result')
  await run('processing', 'New evidence retrieval result')
  await run('stale-first', 'New evidence retrieval result')
  assert.equal(await evaluate("window.baselineHarness.calls.filter(c => c.url?.endsWith('/matching-status')).length"), 3); passed()
  await run('old', 'Automatic checks stopped')
  await run('null', 'Automatic checks stopped')
  await run('failed', 'matching job failed')
  await run('transient', 'New evidence retrieval result')
  assert.equal(await evaluate("window.baselineHarness.calls.filter(c => c.url?.endsWith('/matching-status')).length"), 2); passed()
  await run('network', 'Unable to check matching status')
  assert.ok(await evaluate("window.baselineHarness.calls.filter(c => c.url?.endsWith('/matching-status')).length <= 22")); passed()
  await run('foreign', 'does not identify this application')
  await run('denied', 'Access to this application is unavailable')
  assert.equal(await evaluate("window.baselineHarness.calls.filter(c => c.url?.endsWith('/matching-status')).length"), 1); passed()
  await run('parse-ready', 'completion has not been confirmed')
  assert.equal(await evaluate("window.baselineHarness.calls.filter(c => c.url?.endsWith('/matching-status')).length"), 0); passed()
  await run('parse-failed', 'CV parsing failed')
  await run('parse-wait', 'Automatic checks stopped')
  // Real language switch keeps lifecycle copy and hides all legacy fields.
  await evaluate("window.baselineHarness.locale('vi')")
  await wait("document.body.innerText.includes('Đối chiếu bằng chứng CV')"); await wait(`(${message}).includes('Đã dừng kiểm tra tự động')`); await noLegacy(); passed()
  await evaluate("window.baselineHarness.locale('ja')")
  await wait("document.body.innerText.includes('CVの根拠確認')"); await wait(`(${message}).includes('自動確認を終了')`); await noLegacy(); passed()
  await cdp('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: false })
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 375')); passed()
  const shot = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
  writeFileSync(resolve('node_modules/.tmp/baseline-005-mobile.png'), Buffer.from(shot.data, 'base64'))
  assert.deepEqual(failures, [])
  assert.ok(requests.every(url => url.startsWith(origin) || url.startsWith('data:')))
  console.log(JSON.stringify({ checks, passed: checks, api: 'synthetic mocked Axios; real React lifecycle', timers: '4000ms => 10ms, 90000ms => 1200ms only in harness', backend: false }))
} finally {
  if (socket?.readyState === WebSocket.OPEN) { try { await cdp('Browser.close') } catch {} }
  socket?.close()
  if (browser && browser.exitCode === null) browser.kill()
  await server?.close()
  for (const callbacks of pending.values()) callbacks.reject(new Error('Test finished'))
  await sleep(500)
  assert.ok(profile.startsWith(resolve('node_modules/.tmp/baseline-005-dev-browser-')))
  try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }) } catch { console.warn(`Chrome profile cleanup deferred: ${profile}`) }
}