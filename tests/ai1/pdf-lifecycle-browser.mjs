import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { createServer } from 'vite'
import { chromium } from 'playwright'
import { jsPDF } from 'jspdf'

// Synthetic streamed PDF, real PDF.js/React/browser. No backend, auth or DB.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const pdf = new jsPDF()
pdf.text('Synthetic PostgreSQL document', 20, 20)
const bytes = Buffer.from(pdf.output('arraybuffer'))
const errors = []
const warnings = []
let server, browser, reads = 0
try {
  server = await createServer({ root, server: { host: '127.0.0.1', port: 0 }, plugins: [{
    name: 'synthetic-pdf-lifecycle',
    configureServer(vite) {
      vite.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/__synthetic_pdf__')) {
          reads++
          res.setHeader('Content-Type', 'application/pdf')
          res.write(bytes.subarray(0, 100))
          const timer = setTimeout(() => res.end(bytes.subarray(100)), 250)
          res.on('close', () => clearTimeout(timer))
          return
        }
        if (req.url === '/__pdf_lifecycle__') {
          res.setHeader('Content-Type', 'text/html')
          res.end(await vite.transformIndexHtml(req.url, '<!doctype html><html><head><link rel="icon" href="data:,"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module" src="/virtual-pdf-lifecycle.tsx"></script></body></html>'))
          return
        }
        next()
      })
    },
    resolveId(id) { if (id === '/virtual-pdf-lifecycle.tsx') return '\0pdf-lifecycle.tsx' },
    load(id) {
      if (id === '\0pdf-lifecycle.tsx') return `
        import {useState,createElement as h,Fragment} from 'react';
        import {createRoot} from 'react-dom/client';
        import {PdfCvViewer} from '/src/pages/RecruiterApplicationsPage/components/PdfCvViewer.tsx';
        import '/src/styles/index.css';
        import '/src/pages/RecruiterApplicationsPage/recruiter-applications.css';
        import '/src/pages/RecruiterApplicationsPage/components/application-detail-drawer.css';
        function Harness(){const [revision,setRevision]=useState(0);const [open,setOpen]=useState(false);const [customUrl,setCustomUrl]=useState(null);window.pdfHarness={open:(url=null)=>{setCustomUrl(url);setRevision(r=>r+1);setOpen(true)},close:()=>setOpen(false)};return h(Fragment,null,h('button',{id:'open',onClick:()=>{setRevision(r=>r+1);setOpen(true)}},'Open'),h('button',{id:'close',onClick:()=>setOpen(false)},'Close'),h('aside',{className:'recruiter-application-detail-drawer',style:{position:'static',height:'auto',width:'100%'}},h('header',{className:'recruiter-application-detail-drawer__header'},h('div',null,h('p',{className:'recruiter-eyebrow'},'Application detail'),h('h2',null,'Synthetic Candidate B'),h('p',null,'Synthetic CV B')),h('div',{className:'recruiter-application-detail-drawer__header-actions'},h('button',{className:'recruiter-drawer-header-btn'},'Collapse'),h('button',{className:'recruiter-drawer-header-btn'},'Previous / Next'),h('button',{className:'recruiter-drawer-header-btn'},'Close')))),open&&h(PdfCvViewer,{key:revision,url:customUrl||('/__synthetic_pdf__?revision='+revision),searchQuery:'PostgreSQL'}))};
        createRoot(document.getElementById('root')).render(h(Harness));`
    },
  }] })
  await server.listen()
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`
  browser = await chromium.launch({ executablePath: process.env.AI1_TEST_CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  const page = await browser.newPage()
  page.on('pageerror', error => errors.push(error.stack ?? error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); if (message.type() === 'warning') warnings.push(message.text()) })
  await page.goto(`${origin}/__pdf_lifecycle__`)
  for (const width of [375, 560, 1920]) {
    await page.setViewportSize({ width, height: 1080 })
    const geometry = await page.locator('.recruiter-application-detail-drawer__header').evaluate(header => {
      const identity = header.firstElementChild.getBoundingClientRect()
      const actions = header.lastElementChild.getBoundingClientRect()
      return { stacked: identity.bottom <= actions.top, sideBySide: identity.right <= actions.left, width: identity.width }
    })
    assert.ok(width <= 560 ? geometry.stacked && geometry.width > 300 : geometry.sideBySide)
  }
  // Tear down after response headers, before body is complete.
  for (let cycle = 0; cycle < 12; cycle++) {
    const response = page.waitForResponse(r => r.url().includes('/__synthetic_pdf__'))
    await page.locator('#open').click()
    await response
    await page.locator('#close').click()
  }
  await page.locator('#open').click()
  await page.locator('.pdf-cv-text-layer').waitFor()
  assert.match(await page.locator('.pdf-cv-text-layer').innerText(), /Synthetic PostgreSQL document/)
  await page.locator('.pdf-cv-text-layer mark').first().waitFor()
  assert.equal(reads, 13)
  // Teardown immediately after the complete byte fetch, while worker setup may
  // still be pending. A real Worker/PDF.js promise is used, not a helper mock.
  for (let cycle = 0; cycle < 12; cycle++) {
    const responsePromise = page.waitForResponse(r => r.url().includes('/__synthetic_pdf__'))
    await page.evaluate(() => window.pdfHarness.close())
    await page.locator('.pdf-cv-text-layer').waitFor({ state: 'detached' })
    await page.evaluate(() => window.pdfHarness.open())
    await (await responsePromise).finished()
    await page.evaluate(() => window.pdfHarness.close())
  }
  await page.locator('#open').click()
  await page.locator('.pdf-cv-text-layer').waitFor()
  assert.equal(reads, 26)
  assert.deepEqual(warnings.filter(message => message.includes('cleanup failed')), [])
  assert.deepEqual(errors, [], 'No unhandled worker cancellation errors are allowed')
  // Signed cross-origin URLs still use CORS without cross-origin cookies.
  let signedRequest
  await page.context().addCookies([{ name: 'synthetic-cookie', value: 'must-not-send', domain: 'signed.example.test', path: '/', secure: true }])
  await page.route('https://signed.example.test/**', route => {
    signedRequest = route.request()
    return route.fulfill({ contentType: 'application/pdf', headers: { 'access-control-allow-origin': origin }, body: bytes })
  })
  await page.evaluate(() => window.pdfHarness.open('https://signed.example.test/cv.pdf?synthetic-signature=example'))
  await page.locator('.pdf-cv-text-layer').waitFor()
  assert.equal(signedRequest.headers().cookie, undefined)
  // Genuine HTTP/PDF errors remain visible and a later successful reopen works.
  await page.route(`${origin}/__http_failure__`, route => route.fulfill({ status: 403, body: 'Synthetic forbidden' }))
  await page.evaluate(() => window.pdfHarness.open('/__http_failure__'))
  await page.getByText('Unable to load PDF (HTTP 403)', { exact: true }).waitFor()
  await page.route(`${origin}/__invalid_pdf__`, route => route.fulfill({ contentType: 'application/pdf', body: 'Not a PDF' }))
  await page.evaluate(() => window.pdfHarness.open('/__invalid_pdf__'))
  await page.getByText('Invalid PDF structure.', { exact: true }).waitFor()
  await page.evaluate(() => window.pdfHarness.open())
  await page.locator('.pdf-cv-text-layer').waitFor()
  assert.deepEqual(errors.filter(message => !message.includes('403 (Forbidden)')), [])
  console.log(JSON.stringify({ passed: 10, partialStreamCycles: 12, completeByteCycles: 12, reads, errors: errors.filter(message => !message.includes('403 (Forbidden)')), expectedHttp403: true, backend: false, coverage: 'partial/full-byte teardown; reopen identity; highlight; cross-origin signed URL/no cookies; visible HTTP/invalid PDF failures; recovery' }))
} finally {
  await browser?.close()
  await server?.close()
}
