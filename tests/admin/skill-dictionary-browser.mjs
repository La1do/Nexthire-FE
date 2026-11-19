import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const backend = process.env.DICTIONARY_BACKEND_URL
if (backend && (!/^http:\/\/127\.0\.0\.1:\d+$/.test(backend) || +new URL(backend).port < 1024 || +new URL(backend).port > 65535)) throw new Error('Only an operator-owned loopback backend is allowed')
const admins = ['55555555-5555-4555-8555-555555555555', '66666666-6666-4666-8666-666666666666']
const company = '77777777-7777-4777-8777-777777777777'
const normalizationVersion = 'nfkc-whitespace-lower-v1'
const normalize = value => value.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase()
const display = value => value.normalize('NFKC').trim().replace(/\s+/gu, ' ')
const snapshot = value => ({ id: value.id, name: value.name, aliases: value.aliases, status: value.status, revision: value.revision, normalizationVersion })
const digest = value => createHash('sha256').update(JSON.stringify(snapshot(value))).digest('hex')
const records = new Map(), audits = new Map(), reserved = new Map(), seenIds = new Set(), createdIds = [], requests = []
let forcedStatus = 0, mutationDelay = 0, listDelay = 0, detailDelay = 0, malformed = '', refreshFailure = false
let server, browser
const cacheDir = await mkdtemp(join(tmpdir(), 'nexhire-wp05-vite-'))
function addAudit(before, after, reason, actorId) {
  const row = { id: randomUUID(), skillId: after.id, actorId, action: before ? 'UPDATE' : 'CREATE', result: 'APPLIED', reason, beforeRevision: before?.revision ?? null, afterRevision: after.revision, before: before ? snapshot(before) : null, after: snapshot(after), beforeSha256: before ? digest(before) : null, afterSha256: digest(after), occurredAt: new Date().toISOString() }
  audits.set(after.id, [row, ...(audits.get(after.id) ?? [])])
}
function namesFor(row) { return [row.name, ...row.aliases] }
function record(name, aliases = []) {
  const now = new Date().toISOString(), row = { id: randomUUID(), name, aliases, status: 'ACTIVE', revision: 1, normalizationVersion, createdAt: now, updatedAt: now }
  row.snapshotSha256 = digest(row); records.set(row.id, row)
  for (const name of namesFor(row)) reserved.set(normalize(name), { id: row.id, name })
  addAudit(null, row, 'Synthetic fixture seed', admins[0]); return row
}
if (!backend) for (let i = 0; i < 21; i++) record(`ZZ Synthetic filler ${String(i).padStart(2, '0')}`)
const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
function queryValid(url) {
  const keys = [...url.searchParams.keys()]
  return keys.every(key => ['page', 'limit', 'status'].includes(key)) && keys.every(key => url.searchParams.getAll(key).length === 1) && ['page', 'limit'].every(key => !url.searchParams.has(key) || /^[1-9]\d*$/.test(url.searchParams.get(key))) && (!url.searchParams.has('limit') || +url.searchParams.get('limit') <= 100) && (!url.searchParams.has('status') || ['ACTIVE', 'RETIRED'].includes(url.searchParams.get('status')))
}
function pageData(items, url) {
  const page = +(url.searchParams.get('page') ?? 1), limit = +(url.searchParams.get('limit') ?? 20)
  return { items: items.slice((page - 1) * limit, page * limit), meta: { total: items.length, page, limit, totalPages: Math.ceil(items.length / limit) } }
}
try {
  server = await createServer({ configLoader: 'runner', envFile: false, envDir: false, cacheDir, server: { host: '127.0.0.1', port: 0 }, plugins: [{ name: 'dictionary-fixture', configureServer(vite) {
    vite.middlewares.use(async (req, res, next) => {
      if (req.url === '/__dictionary_test__') {
        res.setHeader('Content-Type', 'text/html')
        res.end(await vite.transformIndexHtml(req.url, '<html lang="vi"><meta name="viewport" content="width=device-width, initial-scale=1"><body><div id="root"></div><script type="module" src="/tests/admin/skill-dictionary-harness.tsx"></script></body></html>')); return
      }
      if (!req.url?.startsWith('/__dictionary_fixture__')) return next()
      res.setHeader('Content-Type', 'application/json')
      const url = new URL(req.url, 'http://fixture'), suffix = url.pathname.slice('/__dictionary_fixture__'.length)
      const match = /^\/([a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})(\/history)?$/.exec(suffix)
      const id = match?.[1], isHistory = !!match?.[2], method = req.method
      const chunks = []; for await (const chunk of req) chunks.push(chunk)
      const raw = Buffer.concat(chunks).toString()
      let input
      try { input = raw ? JSON.parse(raw) : undefined } catch { res.statusCode = 400; res.end('{}'); return }
      const keys = input && typeof input === 'object' && !Array.isArray(input) ? Object.keys(input).sort() : []
      const bodyValid = method === 'GET' ? !raw : method === 'POST' ? keys.join() === ['aliases', 'name', 'reason'].join() : keys.join() === ['aliases', 'expectedRevision', 'name', 'reason', 'status'].join()
      const methodValid = !suffix ? ['GET', 'POST'].includes(method) : !!id && (method === 'GET' || method === 'PATCH' && !isHistory)
      const routeValid = methodValid && (!suffix || !!match) && queryValid(url) && (!suffix || !url.searchParams.has('status')) && (!id || isHistory || !url.search) && (method === 'GET' || !url.search) && bodyValid
      const identityValid = admins.includes(req.headers['x-test-user-id']) && req.headers['x-test-company-id'] === company && req.headers['x-test-role'] === 'ADMIN'
      const scopedBody = method === 'GET' || input && typeof input.name === 'string' && input.name.startsWith('WP05 Synthetic') && Array.isArray(input.aliases) && input.aliases.length <= 20 && input.aliases.every(alias => typeof alias === 'string' && alias.startsWith('WP05 Synthetic') && alias.length <= 120) && typeof input.reason === 'string' && input.reason.length <= 500 && (method !== 'PATCH' || ['ACTIVE', 'RETIRED'].includes(input.status) && Number.isInteger(input.expectedRevision) && input.expectedRevision > 0)
      if (!routeValid || backend && (!identityValid || !scopedBody || id && !seenIds.has(id))) { res.statusCode = 400; res.end('{}'); return }
      requests.push({ method, suffix, query: url.search, input, user: req.headers['x-test-user-id'] })
      if (backend) {
        try {
          const response = await fetch(`${backend}/api/v1/admin/skill-dictionary${suffix}${url.search}`, { method, headers: { 'Content-Type': 'application/json', 'x-user-id': req.headers['x-test-user-id'], 'x-company-id': req.headers['x-test-company-id'], 'x-user-role': req.headers['x-test-role'] }, body: method === 'GET' ? undefined : raw, signal: AbortSignal.timeout(15000) })
          const data = await response.json()
          if (response.ok && data.success === true) {
            const entries = Array.isArray(data.data?.items) ? data.data.items : [data.data]
            for (const item of entries) if (item && typeof item.id === 'string' && item.normalizationVersion === normalizationVersion && item.snapshotSha256 === digest(item)) seenIds.add(item.id)
            if (method === 'POST' && seenIds.has(data.data?.id)) createdIds.push(data.data.id)
          }
          res.statusCode = response.status; res.end(JSON.stringify(data))
        } catch { res.statusCode = 502; res.end('{}') }
        return
      }
      if (req.headers['x-test-role'] !== 'ADMIN') { res.statusCode = 403; res.end('{}'); return }
      if (forcedStatus || refreshFailure && method === 'GET' && id && !isHistory) { res.statusCode = forcedStatus || 503; res.end('{}'); return }
      let data
      if (method === 'GET') {
        if (!suffix) { const filter = url.searchParams.get('status'); data = pageData([...records.values()].filter(row => !filter || row.status === filter).sort((a, b) => a.name.localeCompare(b.name)), url); if (listDelay) await wait(listDelay) }
        else {
          const row = records.get(id)
          if (!row) { res.statusCode = 404; res.end('{}'); return }
          data = isHistory ? pageData(audits.get(id) ?? [], url) : { ...row, reservedNames: [...reserved.values()].filter(term => term.id === id && !namesFor(row).some(name => normalize(name) === normalize(term.name))).map(term => ({ name: term.name, normalizedName: normalize(term.name) })) }
          if (detailDelay) await wait(detailDelay)
        }
      } else {
        if (mutationDelay) await wait(mutationDelay)
        if (!input.name?.trim() || !input.reason?.trim() || !Array.isArray(input.aliases)) { res.statusCode = 400; res.end('{}'); return }
        const name = display(input.name), aliases = input.aliases.map(display).sort((a, b) => normalize(a) < normalize(b) ? -1 : normalize(a) > normalize(b) ? 1 : 0), terms = [name, ...aliases]
        if (terms.some(term => !term || term.length > 120 || Array.from(term).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)) || new Set(terms.map(normalize)).size !== terms.length || aliases.length > 20 || input.reason.length > 500) { res.statusCode = 400; res.end('{}'); return }
        if (terms.some(term => reserved.has(normalize(term)) && reserved.get(normalize(term)).id !== id)) { res.statusCode = 409; res.end('{}'); return }
        if (method === 'POST') {
          data = record(name, aliases); audits.set(data.id, []); addAudit(null, data, input.reason, req.headers['x-test-user-id']); createdIds.push(data.id); res.statusCode = 201
        } else {
          const row = records.get(id)
          if (!row) { res.statusCode = 404; res.end('{}'); return }
          if (row.revision !== input.expectedRevision) { res.statusCode = 409; res.end('{}'); return }
          if (malformed === 'same-revision') { data = { ...row, name, aliases, status: input.status }; data.snapshotSha256 = digest(data) }
          else if (row.name === name && JSON.stringify(row.aliases) === JSON.stringify(aliases) && row.status === input.status) data = row
          else {
            data = { ...row, name, aliases, status: input.status, revision: row.revision + 1, updatedAt: new Date().toISOString() }; data.snapshotSha256 = digest(data)
            records.set(id, data); for (const term of terms) reserved.set(normalize(term), { id, name: term }); addAudit(row, data, input.reason, req.headers['x-test-user-id'])
          }
        }
      }
      data = structuredClone(data)
      if (malformed === 'detail' && method === 'GET' && id && !isHistory) data.snapshotSha256 = '0'.repeat(64)
      if (malformed === 'history' && isHistory && data.items.length) data.items[0].after.id = randomUUID()
      res.end(JSON.stringify({ success: true, data }))
    })
  } }] })
  await server.listen(); const port = server.httpServer.address().port
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  const page = await browser.newPage(), errors = [], checks = []
  page.setDefaultTimeout(12000); page.on('pageerror', error => errors.push(error.message))
  const load = async () => { await page.goto(`http://127.0.0.1:${port}/__dictionary_test__`); await page.getByRole('heading', { name: 'Từ điển kỹ năng', exact: true }).waitFor(); await page.getByRole('region', { name: 'Danh sách kỹ năng', exact: true }).getByText(/kỹ năng$/).first().waitFor() }
  const detailRegion = page.getByRole('region', { name: 'Chi tiết kỹ năng', exact: true })
  const nameInput = page.getByLabel('Tên chính', { exact: true }), aliasesInput = page.getByLabel('Tên gọi khác (mỗi dòng một tên)', { exact: true }), reasonInput = page.getByLabel('Lý do thay đổi', { exact: true })
  const save = page.getByRole('button', { name: 'Lưu kỹ năng', exact: true })
  const reload = page.getByRole('button', { name: 'Tải lại bản đã lưu', exact: true })
  const fill = async (name, aliases, reason) => { await nameInput.fill(name); await aliasesInput.fill(aliases); await reasonInput.fill(reason) }
  const savedRevision = async revision => { await detailRegion.getByText(new RegExp(`Phiên bản đã lưu: ${revision} ·`)).waitFor(); await nameInput.isEnabled() }
  await load()
  if (backend) {
    for (const [suffix, method, headers, body] of [['/unknown', 'GET', {}, undefined], ['', 'DELETE', {}, undefined], ['?unexpected=1', 'GET', {}, undefined], ['', 'POST', { 'x-test-role': 'RECRUITER' }, '{}'], ['', 'POST', {}, '{"unexpected":true}']]) {
      const response = await fetch(`http://127.0.0.1:${port}/__dictionary_fixture__${suffix}`, { method, headers: { 'x-test-user-id': admins[0], 'x-test-company-id': company, 'x-test-role': 'ADMIN', ...headers }, body }); assert.equal(response.status, 400)
    }
    checks.push('actual-proxy-scope-allowlist')
  } else {
    const listRegion = page.getByRole('region', { name: 'Danh sách kỹ năng' })
    await listRegion.getByRole('button', { name: 'Trang sau', exact: true }).click(); await listRegion.getByText('Trang 2 / 2', { exact: true }).waitFor()
    await listRegion.getByRole('button', { name: 'Trang trước', exact: true }).click(); await listRegion.getByText('Trang 1 / 2', { exact: true }).waitFor()
    checks.push('list-pagination')
  }
  await page.getByRole('button', { name: '+ Thêm kỹ năng', exact: true }).click()
  await fill('WP05 Synthetic PostgreSQL', 'WP05 Synthetic PG\nWP05 Synthetic Postgres', '')
  await save.click(); await page.getByRole('alert').filter({ hasText: 'Hãy nhập lý do' }).waitFor()
  await fill('Ｃ++', 'C++', 'Synthetic normalization check')
  await save.click(); await page.getByRole('alert').filter({ hasText: 'bị trùng sau khi chuẩn hóa' }).waitFor()
  await fill('WP05 Synthetic PostgreSQL', 'WP05 Synthetic PG\nWP05 Synthetic Postgres', 'Synthetic creation')
  const writesBefore = requests.filter(req => req.method === 'POST').length
  await save.click(); await savedRevision(1)
  assert.equal(requests.filter(req => req.method === 'POST').length, writesBefore + 1)
  const id = createdIds.at(-1); assert.ok(id)
  checks.push('required-reason-and-nfkc-duplicate-validation', 'create-exact-dto-and-single-post')
  await fill('WP05 Synthetic PostgreSQL', 'WP05 Synthetic Postgres\nWP05 Synthetic PG', 'Alias order only')
  await save.click(); await page.getByText('Nội dung không đổi; không tạo phiên bản hoặc lịch sử mới.', { exact: true }).waitFor(); await savedRevision(1)
  checks.push('alias-permutation-noop-same-revision')
  await fill('WP05 Synthetic PostgreSQL renamed', 'WP05 Synthetic PG', 'Synthetic rename and remove alias')
  await save.click(); await savedRevision(2)
  await detailRegion.getByText('WP05 Synthetic PostgreSQL', { exact: true }).waitFor()
  await detailRegion.getByText('WP05 Synthetic Postgres', { exact: true }).waitFor()
  checks.push('rename-and-remove-alias-reservations-refreshed')
  await page.getByLabel('Trạng thái kỹ năng', { exact: true }).selectOption('RETIRED'); await reasonInput.fill('Synthetic retire'); await save.click(); await savedRevision(3)
  await page.getByLabel('Trạng thái danh sách', { exact: true }).selectOption('RETIRED'); await page.getByRole('region', { name: 'Danh sách kỹ năng' }).getByRole('button', { name: /WP05 Synthetic PostgreSQL renamed/ }).waitFor()
  await page.getByLabel('Trạng thái kỹ năng', { exact: true }).selectOption('ACTIVE'); await reasonInput.fill('Synthetic reactivate'); await save.click(); await savedRevision(4)
  await detailRegion.getByText('Kỹ năng này nằm ngoài bộ lọc hiện tại.', { exact: false }).waitFor()
  checks.push('retire-reactivate-status-filter-keeps-selected-detail')
  const historyDetails = detailRegion.locator('details')
  await historyDetails.first().locator('summary').click(); await detailRegion.getByText('Lý do: Synthetic reactivate', { exact: true }).waitFor()
  assert.equal(await historyDetails.count(), 4)
  await historyDetails.last().locator('summary').click(); await detailRegion.getByText('Lý do: Synthetic creation', { exact: true }).waitFor()
  checks.push('applied-history-before-after-no-noop-audit')
  await page.evaluate(() => window.dictionaryIdentity({ userId: '66666666-6666-4666-8666-666666666666' }))
  await page.getByLabel('Trạng thái danh sách', { exact: true }).selectOption('ACTIVE')
  await page.getByRole('region', { name: 'Danh sách kỹ năng' }).getByRole('button', { name: /WP05 Synthetic PostgreSQL renamed/ }).click()
  await savedRevision(4)
  const latestAudit = detailRegion.locator('details').filter({ has: page.locator('summary', { hasText: /^Phiên bản 4 ·/ }) })
  assert.equal(await latestAudit.count(), 1); await latestAudit.locator('summary').click(); await latestAudit.getByText('Người thực hiện: Quản trị viên khác', { exact: true }).waitFor()
  checks.push('second-admin-read-server-history')
  if (!backend) {
    await nameInput.fill('Unsaved conflict name'); await reasonInput.fill('Conflict draft')
    forcedStatus = 409; const before = requests.filter(req => req.method === 'PATCH').length
    await save.click(); await page.getByRole('alert').filter({ hasText: 'phiên bản đã thay đổi' }).waitFor()
    assert.equal(await nameInput.inputValue(), 'Unsaved conflict name'); assert.equal(await save.isDisabled(), true)
    await wait(100); assert.equal(requests.filter(req => req.method === 'PATCH').length, before + 1)
    checks.push('409-preserves-draft-locks-writes-no-auto-retry')
    page.once('dialog', dialog => dialog.dismiss()); await page.getByRole('link', { name: 'Rời từ điển' }).click(); assert.ok(page.url().includes('/__dictionary_test__'))
    checks.push('dirty-router-navigation-guard')
    forcedStatus = 0; page.once('dialog', dialog => dialog.accept()); await reload.click(); await savedRevision(4)
    await nameInput.fill('Company private draft')
    await page.evaluate(() => window.dictionaryIdentity({ companyId: '88888888-8888-4888-8888-888888888888' }))
    await page.getByRole('heading', { name: 'Từ điển kỹ năng', exact: true }).waitFor(); assert.ok(!(await page.locator('body').innerText()).includes('Company private draft'))
    checks.push('company-switch-purges-private-draft')
    await page.evaluate(() => window.dictionaryIdentity({ companyId: '77777777-7777-4777-8777-777777777777', role: 'RECRUITER' }))
    await page.getByRole('alert').filter({ hasText: 'cần tài khoản quản trị hệ thống' }).waitFor(); const beforeDenied = requests.length; await wait(100); assert.equal(requests.length, beforeDenied)
    await page.evaluate(() => window.dictionaryIdentity({ role: 'ADMIN', hydrating: true }))
    await page.getByText('Đang xác minh quyền quản trị…', { exact: true }).waitFor(); await wait(50); assert.equal(requests.length, beforeDenied)
    await page.evaluate(() => window.dictionaryIdentity({ hydrating: false }))
    await page.getByRole('region', { name: 'Danh sách kỹ năng' }).getByRole('button', { name: /WP05 Synthetic PostgreSQL renamed/ }).click(); await savedRevision(4)
    checks.push('non-admin-and-hydration-client-gate')
    await reasonInput.fill('Late old-admin write'); await nameInput.fill('WP05 Synthetic late renamed'); mutationDelay = 200
    await save.click(); await page.evaluate(() => window.dictionaryIdentity({ userId: '55555555-5555-4555-8555-555555555555' }))
    await page.getByRole('heading', { name: 'Từ điển kỹ năng', exact: true }).waitFor(); await wait(300)
    assert.equal(await nameInput.count(), 0); checks.push('late-mutation-account-fence')
    mutationDelay = 0
    await page.getByRole('region', { name: 'Danh sách kỹ năng' }).getByRole('button', { name: /WP05 Synthetic PostgreSQL renamed/ }).click(); await savedRevision(5)
    malformed = 'detail'; await reload.click(); await page.getByRole('alert').filter({ hasText: 'Chưa xác nhận được dữ liệu' }).waitFor(); assert.equal(await save.isDisabled(), true)
    malformed = 'history'; await reload.click(); await nameInput.isEnabled(); await page.getByRole('alert').filter({ hasText: 'Chưa xác nhận được dữ liệu' }).waitFor()
    assert.equal(await detailRegion.locator('details').count(), 0)
    malformed = ''; await reload.click(); await savedRevision(5)
    checks.push('malformed-snapshot-and-history-binding-fail-closed')
    await nameInput.fill('WP05 Synthetic read-refresh failure'); await reasonInput.fill('Commit then read unavailable'); refreshFailure = true
    const writeCount = requests.filter(req => req.method === 'PATCH').length
    await save.click(); await page.getByText('Đã lưu phiên bản 6.', { exact: true }).waitFor(); await page.getByRole('alert').filter({ hasText: 'Chưa xác nhận được dữ liệu' }).waitFor()
    assert.equal(await save.isDisabled(), true); assert.equal(requests.filter(req => req.method === 'PATCH').length, writeCount + 1)
    assert.ok((await detailRegion.innerText()).includes('Thông tin tên cũ chưa được xác nhận'))
    refreshFailure = false; await reload.click(); await savedRevision(6)
    checks.push('committed-save-refresh-failure-no-resend-unknown-reservations')
    for (const code of [400, 401, 403, 404, 503]) {
      forcedStatus = code; await reload.click(); await page.getByRole('alert').first().waitFor(); assert.equal(await save.isDisabled(), true)
      forcedStatus = 0; await reload.click(); await savedRevision(6)
    }
    checks.push('read-errors-400-401-403-404-503')
    malformed = 'same-revision'; await nameInput.fill('WP05 Synthetic malformed same revision'); await reasonInput.fill('Malformed same revision')
    await save.click(); await page.getByRole('alert').filter({ hasText: 'Chưa xác nhận được dữ liệu' }).waitFor()
    assert.equal(await save.isDisabled(), true); assert.equal(await nameInput.inputValue(), 'WP05 Synthetic malformed same revision')
    assert.equal(await page.getByText('Nội dung không đổi; không tạo phiên bản hoặc lịch sử mới.', { exact: true }).count(), 0)
    malformed = ''; page.once('dialog', dialog => dialog.accept()); await reload.click(); await savedRevision(6)
    checks.push('changed-content-at-same-revision-fails-closed')
    await nameInput.fill('Private draft must survive canceled switch')
    page.once('dialog', dialog => dialog.dismiss()); await page.getByLabel('Trạng thái danh sách', { exact: true }).selectOption('RETIRED')
    assert.equal(await page.getByLabel('Trạng thái danh sách', { exact: true }).inputValue(), '')
    assert.equal(await nameInput.inputValue(), 'Private draft must survive canceled switch')
    const filler = page.getByRole('region', { name: 'Danh sách kỹ năng' }).getByRole('button', { name: /ZZ Synthetic filler 00/ })
    page.once('dialog', dialog => dialog.dismiss()); await filler.click(); assert.equal(await nameInput.inputValue(), 'Private draft must survive canceled switch')
    page.once('dialog', dialog => dialog.accept()); await reload.click(); await savedRevision(6)
    checks.push('dirty-filter-and-record-switch-cancel-keeps-draft')
    detailDelay = 150; await filler.click(); await page.getByRole('button', { name: '+ Thêm kỹ năng', exact: true }).click(); await nameInput.fill('New record draft fenced')
    await wait(220); assert.equal(await nameInput.inputValue(), 'New record draft fenced'); detailDelay = 0
    checks.push('delayed-record-response-cannot-overwrite-new-draft')
    page.once('dialog', dialog => dialog.accept()); await page.getByLabel('Trạng thái danh sách', { exact: true }).selectOption('RETIRED')
    listDelay = 150; page.once('dialog', dialog => dialog.accept()); await page.getByLabel('Trạng thái danh sách', { exact: true }).selectOption('ACTIVE')
    page.once('dialog', dialog => dialog.accept()); await page.getByLabel('Trạng thái danh sách', { exact: true }).selectOption('')
    await wait(220); assert.ok(!(await page.getByRole('region', { name: 'Danh sách kỹ năng' }).innerText()).includes('Chưa xác nhận được dữ liệu'))
    listDelay = 0; checks.push('delayed-query-response-fence')
    await page.setViewportSize({ width: 390, height: 844 }); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    checks.push('mobile-no-horizontal-overflow')
    await page.evaluate(() => window.dictionaryUnmount()); assert.equal(await page.locator('.skill-dictionary').count(), 0); checks.push('unmount-clears-private-editor')
  }
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({ mode: backend ? 'actual-backend' : 'synthetic-api-mock', passed: checks.length, checks, createdIds, pageErrors: errors.length }))
} finally {
  const cleanup = await Promise.allSettled([browser?.close(), server?.close()])
  const parent = resolve(tmpdir()), target = resolve(cacheDir)
  if (target.startsWith(`${parent}\\`) || target.startsWith(`${parent}/`)) await rm(cacheDir, { recursive: true, force: true })
  for (const item of cleanup) if (item.status === 'rejected') { console.error('Cleanup failed:', item.reason); process.exitCode = 1 }
}
