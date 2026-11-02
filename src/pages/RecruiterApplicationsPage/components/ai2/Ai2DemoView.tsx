import type { Ai2DemoScore } from '../../../../types/ai2-demo.types'

import type { Ai2Pool } from '../../../../types/ai2-pool.types'

type Props = { locale: string; loading: boolean; failed: boolean; value: Ai2DemoScore | null; pool?: Ai2Pool }

const copy = {
  vi: {
    title: 'Gợi ý thứ tự xem hồ sơ', experimental: 'Tính năng thử nghiệm',
    loading: 'Đang cập nhật dữ liệu hồ sơ…', failed: 'Chưa thể tải gợi ý. Bạn vẫn có thể xem bằng chứng CV phía trên.',
    ready: 'Chưa có thứ tự so sánh',
    explanation: 'Hệ thống chưa xác nhận được nhóm hồ sơ có thể so sánh cho tin tuyển dụng này, nên chưa đưa ra thứ tự ưu tiên xem.',
    disabled: 'Gợi ý thứ tự xem hồ sơ chưa được bật.',
    unavailable: 'Chưa đủ dữ liệu để đưa ra gợi ý thứ tự xem hồ sơ.',
    guidance: 'Hãy đối chiếu các đoạn CV với yêu cầu công việc ở phần bằng chứng phía trên. Nội dung đáp ứng, còn thiếu hoặc cần làm rõ do HR xác minh.',
    caution: 'Không phải kết luận về mức độ phù hợp và không tự động đưa ra quyết định tuyển dụng.',
    technical: 'Chi tiết kỹ thuật', score: 'Điểm thô của mô hình', date: 'Ngày tham chiếu dữ liệu', model: 'Phiên bản mô hình',
    note: 'Điểm không có thang cố định, không phải phần trăm hay xác suất tuyển dụng. Điểm dùng dữ liệu JD/CV đã lưu, có thể khác dữ liệu hiện tại. Trích dẫn CV phía trên không phải giải thích đóng góp của mô hình xếp hạng.',
  },
  en: {
    title: 'Suggested review order', experimental: 'Experimental feature',
    loading: 'Updating application data…', failed: 'Suggestions could not be loaded. You can still review the CV evidence above.',
    ready: 'No comparison order available',
    explanation: 'A comparable group of applications has not been verified for this job, so no review priority is assigned.',
    disabled: 'Review order suggestions are not enabled.', unavailable: 'There is not enough compatible data to suggest a review order.',
    guidance: 'Compare the CV passages with the job requirements in the evidence section above. HR must verify what is supported, missing or needs clarification.',
    caution: 'This is not a conclusion about suitability and does not make hiring decisions automatically.',
    technical: 'Technical details', score: 'Raw model score', date: 'Data reference date', model: 'Model version',
    note: 'The score has no fixed scale and is not a percentage or hiring probability. It uses saved JD/CV data, which may differ from current data. CV quotations above are not ranking-model attribution.',
  },
  ja: {
    title: '応募書類の確認順序', experimental: '試験的な機能',
    loading: '応募データを更新しています…', failed: '提案を読み込めませんでした。上の職務経歴書の根拠は確認できます。',
    ready: '比較順序はまだありません', explanation: 'この求人で比較可能な応募者グループが確認されていないため、確認の優先順位は表示しません。',
    disabled: '確認順序の提案は有効になっていません。', unavailable: '確認順序を提案するためのデータが不足しています。',
    guidance: '上の根拠欄で職務経歴書の記載と求人要件を照合してください。要件への対応、不足点、確認事項は採用担当者が判断してください。',
    caution: '適合性の結論ではなく、採用を自動的に決定するものではありません。',
    technical: '技術的な詳細', score: 'モデルの生スコア', date: 'データの基準日', model: 'モデルのバージョン',
    note: '固定の尺度を持つスコアではなく、割合や採用確率ではありません。保存済みの求人・応募書類を使用するため、現在のデータとは異なる場合があります。上の引用はランキングモデルの寄与の説明ではありません。',
  },
}

export function Ai2DemoView({ locale, loading, failed, value, pool }: Props) {
  const text = copy[locale as keyof typeof copy] ?? copy.en
  return (
    <section className="recruiter-application-detail-card" aria-label={text.title} aria-live="polite" aria-busy={loading}>
      <h3>{text.title}</h3>
      <p>{text.experimental}</p>
      {loading ? <p>{text.loading}</p> : failed ? <p>{text.failed}</p>
        : pool?.status === 'READY' && pool.rank !== null ? <>
          <h4>{locale === 'vi' ? `Gợi ý xem thứ ${pool.rank} trong ${pool.count} hồ sơ` : locale === 'ja' ? `${pool.count}件中の確認順序：${pool.rank}位` : `Suggested review position ${pool.rank} of ${pool.count}`}</h4>
          <p>{locale === 'vi' ? 'So sánh toàn bộ hồ sơ đang hoạt động của tin này theo cùng dữ liệu JD và ngày tham chiếu. Điểm bằng nhau có cùng thứ tự. Đây không phải xếp loại năng lực.' : locale === 'ja' ? '同じ求人データと基準日の応募書類を比較します。同点は同順位です。能力の評価ではありません。' : 'Compares all active applications using the same job data and reference date. Equal scores share a position. This is not a competence rating.'}</p>
        </> : value?.status === 'READY' ? <><h4>{text.ready}</h4><p>{pool?.reason === 'NEED_MORE_APPLICATIONS' ? (locale === 'vi' ? 'Cần ít nhất hai hồ sơ có thể so sánh cho tin này.' : locale === 'ja' ? '比較可能な応募書類が2件以上必要です。' : 'At least two comparable applications are needed for this job.') : pool?.reason === 'CONTENT_QUALITY_NOT_VALIDATED' ? (locale === 'vi' ? 'Chất lượng đánh giá nội dung chưa được xác nhận. Hệ thống tạm không đưa ra thứ tự ưu tiên.' : locale === 'ja' ? '内容評価の品質が未確認のため、優先順位を提示しません。' : 'Content assessment quality is not validated. Review priority is withheld.') : text.explanation}</p></>
          : <p>{value?.status === 'DISABLED' ? text.disabled : text.unavailable}</p>}
      <p>{text.guidance}</p>
      <p>{text.caution}</p>
      {!loading && !failed && value?.status === 'READY' ? (
        <details>
          <summary>{text.technical}</summary>
          <p>{text.note}</p>
          <dl>
            <dt>{text.score}</dt><dd>{value.score?.toFixed(4)}</dd>
            <dt>{text.date}</dt><dd>{value.referenceDate}</dd>
            <dt>{text.model}</dt><dd>{value.modelVersion}</dd>
          </dl>
        </details>
      ) : null}
    </section>
  )
}
