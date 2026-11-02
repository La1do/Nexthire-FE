export type Ai2DemoScore = {
  status: 'DISABLED' | 'UNAVAILABLE' | 'READY'
  score: number | null
  resultId: string
  modelVersion?: string
  referenceDate?: string
}

export function parseAi2DemoEnvelope(payload: unknown, applicationId: string, jobId: string): Ai2DemoScore | null {
  const envelope = payload as { success?: unknown; data?: unknown } | null
  if (!envelope || envelope.success !== true) throw new Error('Invalid AI2 envelope')
  if (envelope.data === null) return null
  const value = envelope.data as Record<string, unknown> | null
  if (!value || value.schemaVersion !== 'ai2-demo-score-v1' ||
    value.applicationId !== applicationId || value.jobId !== jobId ||
    value.experimental !== true || value.scoreMeaning !== 'RELATIVE_RANKING_SCORE' ||
    value.rankingPosition !== null || value.automaticallyReject !== false ||
    value.hiringDecision !== null || value.attributionStatus !== 'UNAVAILABLE' ||
    typeof value.resultId !== 'string' || !value.resultId ||
    !['DISABLED', 'UNAVAILABLE', 'READY'].includes(String(value.status))) {
    throw new Error('Invalid AI2 contract')
  }
  if (value.status !== 'READY') {
    if (value.score !== null) throw new Error('Unexpected AI2 score')
    return { status: value.status as 'DISABLED' | 'UNAVAILABLE', score: null, resultId: value.resultId }
  }
  if (typeof value.score !== 'number' || !Number.isFinite(value.score) ||
    value.modelVersion !== 'ai2-demo-xgb-observed-v1:5c0c5e3d4e81' ||
    typeof value.jobSnapshotSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.jobSnapshotSha256) ||
    typeof value.candidateSnapshotSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.candidateSnapshotSha256) ||
    typeof value.referenceDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value.referenceDate) ||
    !Number.isFinite(Date.parse(`${value.referenceDate}T00:00:00Z`)) ||
    new Date(`${value.referenceDate}T00:00:00Z`).toISOString().slice(0, 10) !== value.referenceDate) {
    throw new Error('Invalid AI2 score metadata')
  }
  return { status: 'READY', score: value.score, resultId: value.resultId,
    modelVersion: value.modelVersion, referenceDate: value.referenceDate }
}
