import { z } from 'zod'
import type { AxiosRequestConfig } from 'axios'
import { apiClient } from '../../lib/api'

const uuid = z.string().uuid()
const sha = z.string().regex(/^[a-f0-9]{64}$/)
const status = z.enum(['ACTIVE', 'RETIRED'])
const date = z.string().datetime({ offset: true })
const snapshot = z.object({ id: uuid, name: z.string().min(1).max(120), aliases: z.array(z.string().min(1).max(120)).max(20), status, revision: z.number().int().positive(), normalizationVersion: z.literal('nfkc-whitespace-lower-v1') })
const entry = snapshot.extend({ snapshotSha256: sha, createdAt: date, updatedAt: date })
const detail = entry.extend({ reservedNames: z.array(z.object({ name: z.string().min(1).max(120), normalizedName: z.string().min(1).max(120) })) })
const meta = z.object({ total: z.number().int().nonnegative(), page: z.number().int().positive(), limit: z.number().int().min(1).max(100), totalPages: z.number().int().nonnegative() }).refine(value => value.totalPages === Math.ceil(value.total / value.limit))
const audit = z.object({ id: uuid, skillId: uuid, actorId: uuid, action: z.enum(['CREATE', 'UPDATE']), result: z.literal('APPLIED'), reason: z.string().min(1).max(500), beforeRevision: z.number().int().positive().nullable(), afterRevision: z.number().int().positive(), before: snapshot.nullable(), after: snapshot, beforeSha256: sha.nullable(), afterSha256: sha, occurredAt: date }).superRefine((row, context) => {
  if (row.after.id !== row.skillId || row.after.revision !== row.afterRevision || (row.action === 'CREATE' ? row.before !== null || row.beforeRevision !== null || row.beforeSha256 !== null || row.afterRevision !== 1 : !row.before || row.before.id !== row.skillId || row.before.revision !== row.beforeRevision || row.afterRevision !== row.beforeRevision! + 1 || !row.beforeSha256)) context.addIssue({ code: 'custom', message: 'Invalid audit revision binding' })
})
const envelope = <T extends z.ZodType>(schema: T) => z.object({ success: z.literal(true), data: schema })
export type DictionaryEntry = z.infer<typeof entry>
export type DictionaryDetail = z.infer<typeof detail>
export type DictionaryHistory = z.infer<typeof audit>
export type DictionaryPage<T> = { items: T[]; meta: z.infer<typeof meta> }
export type DictionaryInput = { name: string; aliases: string[]; reason: string }
export const normalizeDictionaryName = (value: string) => value.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase()
export function validateDictionaryInput(value: DictionaryInput): string {
  const terms = [value.name, ...value.aliases]
  if (terms.some(term => !term.trim() || term.length > 120 || normalizeDictionaryName(term).length > 120 || Array.from(term).some(char => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127))) return 'Tên và tên gọi khác cần có nội dung, tối đa 120 ký tự và không chứa ký tự điều khiển.'
  if (value.aliases.length > 20) return 'Chỉ được nhập tối đa 20 tên gọi khác.'
  if (new Set(terms.map(normalizeDictionaryName)).size !== terms.length) return 'Tên chính và tên gọi khác bị trùng sau khi chuẩn hóa khoảng trắng, chữ hoa và Unicode.'
  if (!value.reason.trim() || value.reason.length > 500) return 'Hãy nhập lý do, tối đa 500 ký tự.'
  return ''
}
function requireDictionaryVerification(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle
  if (typeof subtle?.digest !== 'function') throw new Error('Skill dictionary requires Web Crypto')
  return subtle
}
async function digest(value: z.infer<typeof snapshot>) {
  const ordered = { id: value.id, name: value.name, aliases: value.aliases, status: value.status, revision: value.revision, normalizationVersion: value.normalizationVersion }
  const bytes = await requireDictionaryVerification().digest('SHA-256', new TextEncoder().encode(JSON.stringify(ordered)))
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('')
}
async function checkedEntry<T extends DictionaryEntry>(value: T, expectedId?: string): Promise<T> {
  if (expectedId && value.id !== expectedId || await digest(value) !== value.snapshotSha256 || validateDictionaryInput({ ...value, reason: 'schema validation' })) throw new Error('Invalid dictionary snapshot')
  return value
}
function checkSaved(value: DictionaryEntry, input: DictionaryInput, expectedStatus: DictionaryEntry['status']) {
  const display = (term: string) => term.normalize('NFKC').trim().replace(/\s+/gu, ' ')
  const aliases = input.aliases.map(display).sort((a, b) => normalizeDictionaryName(a) < normalizeDictionaryName(b) ? -1 : normalizeDictionaryName(a) > normalizeDictionaryName(b) ? 1 : 0)
  if (value.name !== display(input.name) || JSON.stringify(value.aliases) !== JSON.stringify(aliases) || value.status !== expectedStatus) throw new Error('Wrong mutation content')
}
function checkPage<T>(data: DictionaryPage<T>, page: number, limit: number) {
  if (data.meta.page !== page || data.meta.limit !== limit || data.items.length > limit || data.items.length > data.meta.total) throw new Error('Invalid pagination binding')
  return data
}
const prefix = '/admin/skill-dictionary'
const noRetry = { _retry: true } as AxiosRequestConfig
export const adminSkillDictionaryService = {
  async list(page: number, filter: '' | 'ACTIVE' | 'RETIRED', signal?: AbortSignal): Promise<DictionaryPage<DictionaryEntry>> {
    const response = await apiClient.get(prefix, { params: { page, limit: 20, ...(filter ? { status: filter } : {}) }, signal })
    const data = checkPage(envelope(z.object({ items: z.array(entry), meta })).parse(response.data).data, page, 20)
    await Promise.all(data.items.map(item => checkedEntry(item)))
    if (new Set(data.items.map(item => item.id)).size !== data.items.length || filter && data.items.some(item => item.status !== filter)) throw new Error('Invalid list binding')
    return data
  },
  async detail(id: string, signal?: AbortSignal) {
    const response = await apiClient.get(`${prefix}/${uuid.parse(id)}`, { signal })
    const data = await checkedEntry(envelope(detail).parse(response.data).data, id)
    if (new Set(data.reservedNames.map(term => term.normalizedName)).size !== data.reservedNames.length || data.reservedNames.some(term => normalizeDictionaryName(term.name) !== term.normalizedName || [data.name, ...data.aliases].some(name => normalizeDictionaryName(name) === term.normalizedName))) throw new Error('Invalid reserved names')
    return data
  },
  async history(id: string, page: number, signal?: AbortSignal): Promise<DictionaryPage<DictionaryHistory>> {
    const response = await apiClient.get(`${prefix}/${uuid.parse(id)}/history`, { params: { page, limit: 20 }, signal })
    const data = checkPage(envelope(z.object({ items: z.array(audit), meta })).parse(response.data).data, page, 20)
    for (const row of data.items) if (row.skillId !== id || validateDictionaryInput({ ...row.after, reason: row.reason }) || row.before && validateDictionaryInput({ ...row.before, reason: row.reason }) || await digest(row.after) !== row.afterSha256 || row.before && await digest(row.before) !== row.beforeSha256) throw new Error('Invalid history binding')
    if (new Set(data.items.map(item => item.afterRevision)).size !== data.items.length || data.items.some((item, index) => index > 0 && item.afterRevision >= data.items[index - 1].afterRevision)) throw new Error('Duplicate audit revision')
    return data
  },
  async create(input: DictionaryInput) {
    requireDictionaryVerification()
    const { name, aliases, reason } = input
    const response = await apiClient.post(prefix, { name, aliases, reason }, noRetry)
    const data = await checkedEntry(envelope(entry).parse(response.data).data)
    checkSaved(data, input, 'ACTIVE')
    if (response.status !== 201 || data.revision !== 1 || data.status !== 'ACTIVE') throw new Error('Invalid create response')
    return data
  },
  async update(id: string, expectedRevision: number, input: DictionaryInput, status: DictionaryEntry['status'], expectedSnapshotSha256: string) {
    requireDictionaryVerification()
    const { name, aliases, reason } = input
    const response = await apiClient.patch(`${prefix}/${uuid.parse(id)}`, { name, aliases, reason, status, expectedRevision }, noRetry)
    const data = await checkedEntry(envelope(entry).parse(response.data).data, id)
    checkSaved(data, input, status)
    if (response.status !== 200 || ![expectedRevision, expectedRevision + 1].includes(data.revision) || data.revision === expectedRevision && data.snapshotSha256 !== expectedSnapshotSha256) throw new Error('Invalid update revision')
    return data
  },
}
