export type Ai2Pool = { status: 'READY' | 'DISABLED' | 'UNAVAILABLE'; count: number; rank: number | null; resultId?: string; reason?: string }

export function parseAi2Pool(payload: unknown, applicationId: string, jobId: string): Ai2Pool {
  const envelope = payload as { success?: unknown; data?: Record<string, unknown> }
  const data = envelope?.data
  if (envelope?.success !== true || !data || data.schemaVersion !== 'ai2-demo-pool-v1' ||
    data.experimental !== true || data.automaticallyReject !== false || data.hiringDecision !== null ||
    !Array.isArray(data.items) || !Number.isInteger(data.requestedCount) ||
    (data.requestedCount as number) < 1 || (data.requestedCount as number) > 50) throw new Error('Invalid pool')
  if (data.status === 'DISABLED' || data.status === 'UNAVAILABLE') {
    if (data.items.length || data.comparedCount !== 0) throw new Error('Partial pool forbidden')
    return { status: data.status, count: data.requestedCount as number, rank: null, reason: typeof data.reason === 'string' ? data.reason : undefined }
  }
  if (data.status !== 'READY' || data.jobId !== jobId || data.items.length !== data.requestedCount ||
    data.comparedCount !== data.requestedCount || data.items.length < 2) throw new Error('Invalid ready pool')
  const seen = new Set<string>()
  let previous = 0, rank: number | null = null, resultId: string | undefined
  data.items.forEach((row: { applicationId?: unknown; rankingPosition?: unknown; resultId?: unknown }, index: number) => {
    if (!row || typeof row.applicationId !== 'string' || seen.has(row.applicationId) ||
      typeof row.rankingPosition !== 'number' || !Number.isInteger(row.rankingPosition) ||
      row.rankingPosition < 1 || (row.rankingPosition !== previous && row.rankingPosition !== index + 1)) throw new Error('Invalid pool order')
    seen.add(row.applicationId); previous = row.rankingPosition
    if (typeof row.resultId !== 'string' || !row.resultId) throw new Error('Invalid result binding')
    if (row.applicationId === applicationId) { rank = row.rankingPosition; resultId = row.resultId }
  })
  return { status: 'READY', count: data.items.length, rank, resultId }
}
