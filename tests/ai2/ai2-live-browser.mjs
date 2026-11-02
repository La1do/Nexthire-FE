import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { createServer } from 'vite'

let input = ''
for await (const chunk of process.stdin) input += chunk
const config = JSON.parse(input)
input = ''
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
assert.ok(existsSync(chrome))
const profile = mkdtempSync(join(process.env.TEMP, 'ai2-live-'))
let server, browser, socket
const pending = new Map()
const errors = []
let sequence = 0
const delay = ms => new Promise(r => setTimeout(r, ms))
function cdp(method, params = {}) {
  const id = ++sequence
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout ${method}`)) }, 15000)
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value) }, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const response = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  assert.ok(!response.exceptionDetails, 'Browser script exception')
  return response.result.value
}
async function wait(expression) {
  for (let i = 0; i < 120; i++) { if (await evaluate(expression)) return; await delay(150) }
  throw new Error('Panel did not reach expected state')
}
try {
  server = await createServer({ define: { 'import.meta.env.VITE_AI2_DEMO_ENABLED': JSON.stringify(config.frontendEnabled === false ? 'false' : 'true') }, server: { host: '127.0.0.1', port: 15173, strictPort: true }, plugins: [{
    name: 'ai2-live-entry', configureServer(vite) {
      vite.middlewares.use('/__ai2-live__', async (_req, res) => {
        res.setHeader('Content-Type', 'text/html')
        res.end(await vite.transformIndexHtml('/__ai2-live__', '<!doctype html><html><body><div id="root"></div><script type="module" src="/tests/ai2/ai2-live-harness.tsx"></script></body></html>'))
      })
    },
  }] })
  await server.listen()
  browser = spawn(chrome, ['--headless=new', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-sync', 'about:blank'], { windowsHide: true, stdio: 'ignore' })
  for (let i = 0; i < 100 && !existsSync(join(profile, 'DevToolsActivePort')); i++) await delay(100)
  const port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0].trim()
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  socket = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl)
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    if (pending.has(message.id)) { const p = pending.get(message.id); pending.delete(message.id); message.error ? p.reject(new Error('CDP failure')) : p.resolve(message.result) }
    if (message.method === 'Runtime.exceptionThrown') errors.push('runtime exception')
  }
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
  let ai2Requests = 0
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data)
    if (message.method === 'Network.requestWillBeSent' && /\/ai2-demo(?:\?|$)/.test(message.params.request.url)) ai2Requests++
  })
  await cdp('Runtime.enable'); await cdp('Page.enable'); await cdp('Network.enable')
  // JWT remains in renderer memory; no browser auth storage or exported state.
  await cdp('Page.addScriptToEvaluateOnNewDocument', { source: `window.ai2LiveConfig=${JSON.stringify({ ...config, output: undefined })}` })
  await cdp('Page.navigate', { url: 'http://127.0.0.1:15173/__ai2-live__' })
  if (config.frontendEnabled === false) {
    await wait("document.body.innerText.includes('Local AI2 E2E')")
    await delay(800)
    assert.equal(await evaluate("document.querySelector('[aria-label=\"AI2 experimental\"]') === null"), true)
    assert.equal(ai2Requests, 0, 'Default-off UI must make no AI2 request')
  } else {
  await wait("document.querySelector('[aria-label=\"AI2 experimental\"]') && !document.body.innerText.includes('Waiting for matching data') && !document.body.innerText.includes('Đang chờ dữ liệu')")
  const text = await evaluate('document.body.innerText')
  assert.ok(!text.includes('Experimental score unavailable.') && !text.includes('Không thể đọc điểm thử nghiệm.'))
  if (config.expectedStatus === 'READY') assert.ok(text.includes('Relative ranking score') || text.includes('Điểm ranking tương đối'))
  else assert.ok(text.includes('No compatible stored inputs') || text.includes('Chưa có dữ liệu tương thích'))
  assert.ok(text.includes('not AI2 model attribution') || text.includes('không phải giải thích đóng góp'))
  assert.ok(ai2Requests >= 1, 'Opt-in panel must call live API')
  }
  assert.equal(errors.length, 0)
  const shot = await cdp('Page.captureScreenshot', { format: 'png' })
  writeFileSync(join(config.output, config.frontendEnabled === false ? 'ai2-default-off.png' : 'ai2-live-panel.png'), Buffer.from(shot.data, 'base64'))
  console.log('Live panel rendered with real gateway response; no runtime exceptions')
} finally {
  socket?.close()
  if (browser && browser.exitCode === null) {
    browser.kill()
    await Promise.race([new Promise(r => browser.once('exit', r)), delay(3000)])
  }
  await server?.close()
  rmSync(profile, { recursive: true, force: true, maxRetries: 8, retryDelay: 300 })
}
