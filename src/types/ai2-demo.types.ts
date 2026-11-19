export const AI2_DEMO_MODEL = 'ai2-demo-xgb-observed-v1:5c0c5e3d4e81'
export type Ai2SourceMetadata = {
  inputContract?: 'M1_REQUIREMENT_OBSERVATIONS_V1'
  planSchemaVersion?: 'jd-source-query-v2'
  planContentSha256?: string
  sourceFreshness?: 'STORED_MATCHING_SNAPSHOT_ONLY' | 'CURRENT_CV_REVALIDATED_AT_CHECK_TIME'
  currentCvRevalidated?: boolean
  sourceCheckedAt?: string
}
export type Ai2DemoScore = Ai2SourceMetadata & {
  status: 'DISABLED' | 'UNAVAILABLE' | 'READY'
  score: number | null
  resultId: string
  modelVersion?: string
  referenceDate?: string
  jobSnapshotSha256?: string
  candidateSnapshotSha256?: string
  reason?: string
}
const reasons = {
  DEMO_DISABLED: ['Gợi ý thử nghiệm chưa được bật.', 'Experimental suggestions are disabled.', '試験的な提案は無効です。'],
  RESULTS_NOT_READY: ['Kết quả đối chiếu của nhóm hồ sơ chưa đầy đủ.', 'Matching results for the group are not ready.', 'グループの照合結果が揃っていません。'],
  M1_NOT_READY: ['Kết quả đối chiếu bằng chứng chưa sẵn sàng.', 'Evidence matching is not ready.', '根拠の照合結果がまだありません。'],
  CURRENT_PLAN_UNAVAILABLE: ['Chưa kiểm tra được yêu cầu công việc hiện tại. Hãy thử lại sau.', 'Current job requirements could not be checked. Try again later.', '現在の求人要件を確認できません。後でもう一度お試しください。'],
  CURRENT_PLAN_NOT_READY: ['Cấu hình yêu cầu hiện tại đang thay đổi hoặc chưa sẵn sàng để dùng kết quả đã lưu.', 'The current requirement configuration is changing or is not ready for the saved result.', '現在の要件設定が変更中、または保存済み結果を利用できない状態です。'],
  STALE_PLAN_BINDING: ['Yêu cầu công việc đã thay đổi so với kết quả đã lưu. Cần đối chiếu lại trước khi so sánh.', 'Job requirements changed since the saved result. Match again before comparing.', '保存済み結果から求人要件が変わりました。比較する前に再照合が必要です。'],
  INCOMPATIBLE_PLAN_BINDINGS: ['Các kết quả không dùng cùng cấu hình yêu cầu nên chưa thể so sánh.', 'Results use different requirement configurations and cannot be compared.', '結果の要件設定が一致しないため比較できません。'],
  SOURCE_QUERY_V2_FEATURES_NOT_SUPPORTED: ['Dữ liệu từ cấu hình yêu cầu này chưa tương thích với kết quả đã lưu. Cần đối chiếu lại trước khi thử so sánh.', 'Data from this requirement configuration is incompatible with the saved result. Match again before comparing.', 'この要件設定のデータは保存済み結果に対応していません。比較する前に再照合してください。'],
  STORED_INPUT_OR_ASSESSMENT_INCOMPATIBLE: ['Dữ liệu đối chiếu đã lưu chưa tương thích với mô hình hiện tại.', 'Saved matching data is incompatible with the current model.', '保存済みの照合データが現在のモデルに対応していません。'],
  INCOMPATIBLE_SNAPSHOTS_OR_DATES: ['Các hồ sơ dùng dữ liệu JD hoặc ngày tham chiếu khác nhau nên chưa thể so sánh.', 'Applications use different job snapshots or reference dates.', '求人データまたは基準日が異なるため比較できません。'],
  INCOMPATIBLE_MODEL: ['Các kết quả không dùng cùng phiên bản mô hình.', 'Results use different model versions.', '結果のモデルバージョンが一致しません。'],
  STALE_JOB_SNAPSHOT: ['JD đã thay đổi so với dữ liệu dùng để đối chiếu. Cần đối chiếu lại.', 'The job changed since matching. A new matching result is needed.', '照合後に求人が変更されました。再照合が必要です。'],
  NEED_MORE_APPLICATIONS: ['Cần ít nhất hai hồ sơ có thể so sánh cho tin này.', 'At least two comparable applications are needed for this job.', '比較可能な応募書類が2件以上必要です。'],
  CONTENT_QUALITY_NOT_VALIDATED: ['Chất lượng đánh giá nội dung chưa được xác nhận. Hệ thống tạm không đưa ra thứ tự ưu tiên.', 'Content assessment quality is unvalidated. Review priority is withheld.', '内容評価の品質が未確認のため、優先順位を提示しません。'],
  DUPLICATE_APPLICATION_OR_CANDIDATE: ['Nhóm hồ sơ có thông tin trùng lặp nên chưa thể so sánh.', 'The application group contains duplicate entries.', '応募グループに重複があるため比較できません。'],
  POOL_SIZE_INVALID: ['Số hồ sơ nằm ngoài giới hạn so sánh.', 'The group size is outside comparison limits.', '応募件数が比較可能な範囲外です。'],
  INVALID_SCORE: ['Kết quả mô hình chưa hợp lệ để hiển thị.', 'The model result is not valid for display.', 'モデル結果を表示できません。'],
  REQUESTED_APPLICATION_NOT_ELIGIBLE: ['Hồ sơ này không còn thuộc nhóm đang được so sánh.', 'This application is no longer in the comparison group.', 'この応募書類は比較グループに含まれていません。'],
  CURRENT_CV_CHANGED: ['CV đã thay đổi so với kết quả đối chiếu đã lưu. Cần đối chiếu lại trước khi xem điểm hoặc thứ tự.', 'The CV changed since the saved matching result. Match again before viewing a score or order.', '保存済み照合結果から職務経歴書が変わりました。スコアや順序を表示する前に再照合してください。'],
  CURRENT_CV_UNAVAILABLE: ['Chưa kiểm tra được CV và bản phân tích hiện tại. Hãy thử lại sau; chưa hiển thị điểm hoặc thứ tự.', 'The current CV and saved parse could not be checked. Try again later; score and order are withheld.', '現在の職務経歴書と解析結果を確認できません。スコアと順序は表示せず、後でもう一度お試しください。'],
  CURRENT_CV_NOT_REVALIDATED: ['CV hiện tại chưa được kiểm tra lại; chỉ có dữ liệu đối chiếu đã lưu.', 'The current CV has not been revalidated; only saved matching data is available.', '現在の職務経歴書は再確認されておらず、保存済み照合データのみ利用できます。'],
} as const
export function ai2UnavailableReason(reason: unknown, locale: string): string | undefined {
  if (typeof reason !== 'string' || !Object.hasOwn(reasons, reason)) return undefined
  return reasons[reason as keyof typeof reasons][locale === 'vi' ? 0 : locale === 'ja' ? 2 : 1]
}
export function ai2ObservationWarning(locale: string): string {
  return locale === 'vi'
    ? 'Khi HR chọn hoặc tách yêu cầu, dữ liệu đầu vào phản ánh các yêu cầu đó nên điểm có thể thay đổi. Đây là thử nghiệm dùng lại mô hình hiện tại; chưa xác nhận chất lượng, tính tương đương hoặc cải thiện so với luồng mặc định.'
    : locale === 'ja'
      ? '採用担当者が要件を選択・分割すると、入力データが変わるためスコアも変わる場合があります。既存モデルを試験的に再利用しており、品質、既定の処理との同等性、改善は確認されていません。'
      : 'HR-selected or split requirements change the input observations, so scores may change. This experimentally reuses the current model; quality, equivalence and improvement over the default flow have not been validated.'
}
export function validAi2SourceCheckedAt(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|([+-])(\d{2}):(\d{2}))$/.exec(value)
  if (!parts || !Number.isFinite(Date.parse(value))) return false
  const [, year, month, day, hour, minute, second, , offsetHour, offsetMinute] = parts
  const days = new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate()
  return Number(month) >= 1 && Number(month) <= 12 && Number(day) >= 1 && Number(day) <= days && Number(hour) < 24 && Number(minute) < 60 && Number(second) < 60 && (!offsetHour || Number(offsetHour) < 24 && Number(offsetMinute) < 60)
}
export function parseAi2Freshness(value: Record<string, unknown>): Pick<Ai2SourceMetadata, 'sourceFreshness' | 'currentCvRevalidated' | 'sourceCheckedAt'> {
  const present = ['sourceFreshness', 'currentCvRevalidated', 'sourceCheckedAt'].some(key => Object.hasOwn(value, key))
  if (!present) return {}
  if (value.sourceFreshness === 'CURRENT_CV_REVALIDATED_AT_CHECK_TIME' && value.currentCvRevalidated === true && validAi2SourceCheckedAt(value.sourceCheckedAt)) return { sourceFreshness: value.sourceFreshness, currentCvRevalidated: true, sourceCheckedAt: value.sourceCheckedAt }
  if (value.sourceFreshness === 'STORED_MATCHING_SNAPSHOT_ONLY' && value.currentCvRevalidated === false && !Object.hasOwn(value, 'sourceCheckedAt')) return { sourceFreshness: value.sourceFreshness, currentCvRevalidated: false }
  throw new Error('Invalid AI2 freshness scope')
}
export function ai2FreshnessNotice(value: Ai2SourceMetadata | null | undefined, locale: string): string {
  const current = value?.sourceFreshness === 'CURRENT_CV_REVALIDATED_AT_CHECK_TIME' && value.currentCvRevalidated === true && validAi2SourceCheckedAt(value.sourceCheckedAt)
  if (current) {
    const checkedAt = new Date(value.sourceCheckedAt!).toLocaleString(locale === 'vi' ? 'vi-VN' : locale === 'ja' ? 'ja-JP' : 'en-US')
    return locale === 'vi' ? `CV và bản phân tích hiện tại đã được kiểm tra lại lúc ${checkedAt}. Đây chỉ là dữ liệu tại thời điểm kiểm tra; CV và JD có thể thay đổi sau đó, các lần đọc không diễn ra đồng thời.` : locale === 'ja' ? `${checkedAt}に現在の職務経歴書と解析結果を再確認しました。確認時点のデータであり、その後に職務経歴書や求人が変わる場合があります。各確認は同時ではありません。` : `The current CV and saved parse were revalidated at ${checkedAt}. This is a check-time snapshot; CV and job data can change afterward, and the reads are not simultaneous.`
  }
  return locale === 'vi' ? 'Chỉ dùng dữ liệu đối chiếu JD/CV đã lưu; CV hiện tại chưa được kiểm tra lại.' : locale === 'ja' ? '保存済みの求人・職務経歴書の照合データのみ使用し、現在の職務経歴書は再確認していません。' : 'Uses stored JD/CV matching snapshots only; the current CV has not been revalidated.'
}
export function parseAi2SourceMetadata(value: Record<string, unknown>): Ai2SourceMetadata {
  const planPresent = ['inputContract', 'planSchemaVersion', 'planContentSha256'].some(key => Object.hasOwn(value, key))
  if (planPresent && (value.inputContract !== 'M1_REQUIREMENT_OBSERVATIONS_V1' || value.planSchemaVersion !== 'jd-source-query-v2' || typeof value.planContentSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.planContentSha256))) throw new Error('Invalid AI2 plan binding')
  return { ...(planPresent ? { inputContract: 'M1_REQUIREMENT_OBSERVATIONS_V1' as const, planSchemaVersion: 'jd-source-query-v2' as const, planContentSha256: value.planContentSha256 as string } : {}), ...parseAi2Freshness(value) }
}
export function validAi2ReferenceDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value
}
export function parseAi2DemoEnvelope(payload: unknown, applicationId: string, jobId: string): Ai2DemoScore | null {
  const envelope = payload as { success?: unknown; data?: unknown } | null
  if (!envelope || envelope.success !== true) throw new Error('Invalid AI2 envelope')
  if (envelope.data === null) return null
  const value = envelope.data as Record<string, unknown> | null
  if (!value || value.schemaVersion !== 'ai2-demo-score-v1' || value.applicationId !== applicationId || value.jobId !== jobId || value.experimental !== true || value.scoreMeaning !== 'RELATIVE_RANKING_SCORE' || value.rankingPosition !== null || value.automaticallyReject !== false || value.hiringDecision !== null || value.attributionStatus !== 'UNAVAILABLE' || typeof value.resultId !== 'string' || !value.resultId || !['DISABLED', 'UNAVAILABLE', 'READY'].includes(String(value.status))) throw new Error('Invalid AI2 contract')
  const metadata = parseAi2SourceMetadata(value)
  if (value.status !== 'READY') {
    if (value.score !== null) throw new Error('Unexpected AI2 score')
    return { ...metadata, status: value.status as 'DISABLED' | 'UNAVAILABLE', score: null, resultId: value.resultId, ...(ai2UnavailableReason(value.reason, 'en') ? { reason: value.reason as string } : {}) }
  }
  if (metadata.currentCvRevalidated !== true || metadata.sourceFreshness !== 'CURRENT_CV_REVALIDATED_AT_CHECK_TIME') throw new Error('Current CV was not revalidated')
  if (typeof value.score !== 'number' || !Number.isFinite(value.score) || value.modelVersion !== AI2_DEMO_MODEL || typeof value.jobSnapshotSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.jobSnapshotSha256) || typeof value.candidateSnapshotSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(value.candidateSnapshotSha256) || !validAi2ReferenceDate(value.referenceDate)) throw new Error('Invalid AI2 score metadata')
  return { ...metadata, status: 'READY', score: value.score, resultId: value.resultId, modelVersion: value.modelVersion, referenceDate: value.referenceDate, jobSnapshotSha256: value.jobSnapshotSha256, candidateSnapshotSha256: value.candidateSnapshotSha256 }
}
