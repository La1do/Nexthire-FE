import type { PlanImportance, SourceSelection } from '../../../../types/requirement-plan.types'

export function SourceQueryEditor({ rows, readOnly, onChange, vi }: {
  rows: SourceSelection[]; readOnly: boolean; vi: boolean; onChange: (rows: SourceSelection[]) => void
}) {
  const update = (index: number, next: SourceSelection) => onChange(rows.map((s, i) => i === index ? next : s))
  return <div className="jd-plan__sources">
    <p>{vi ? 'Giữ nguyên toàn bộ nguồn. Chỉ các trích dẫn được chọn được dùng tìm bằng chứng. Phần dài cần tách trước khi xác nhận.' : 'All source text is retained. Only selected exact quotes retrieve evidence. Split long passages before confirming.'}</p>
    {rows.map((s, i) => <article key={s.source_id} className="jd-plan__notice">
      <p><strong>{vi ? ({ skills: 'Kỹ năng', requirements: 'Yêu cầu', description: 'Mô tả công việc', benefits: 'Phúc lợi' }[s.source_field]) : s.source_field}</strong> · {vi ? ({ heading: 'Tiêu đề mục', query: 'Nội dung đối chiếu', review: 'Cần rà soát' }[s.suggested_role]) : s.suggested_role}</p>
      <blockquote style={{ whiteSpace: 'pre-wrap' }}>{s.original_text}</blockquote>
      <label><input type="checkbox" disabled={readOnly} checked={s.selected} onChange={e => update(i, {
        ...s, selected: e.target.checked, components: e.target.checked
          ? [{ id: 'whole', query: s.original_text, source_quote: s.original_text, importance: 'unknown' }] : [],
      })} /> {vi ? 'Dùng tìm bằng chứng' : 'Retrieve evidence'}</label>
      {s.components.map((c, j) => <div key={c.id}>
        <label>{vi ? 'Trích dẫn truy hồi' : 'Retrieval quote'}
          <textarea disabled={readOnly} value={c.query} onChange={e => update(i, { ...s,
            components: s.components.map((x, k) => k === j ? { ...x, query: e.target.value, source_quote: e.target.value } : x),
          })} /></label>
        <label>{vi ? 'Mức ưu tiên' : 'Importance'} <select disabled={readOnly} value={c.importance} onChange={e => update(i, { ...s,
          components: s.components.map((x, k) => k === j ? { ...x, importance: e.target.value as PlanImportance } : x),
        })}>{(['unknown', 'core', 'preferred', 'supplementary'] as const).map(x => <option key={x} value={x}>{vi ? ({ unknown: 'Chưa xác định', core: 'Bắt buộc', preferred: 'Ưu tiên', supplementary: 'Bổ sung' }[x]) : x}</option>)}</select></label>
        <button type="button" disabled={readOnly} onClick={() => {
          const components = s.components.filter((_, k) => k !== j)
          update(i, { ...s, selected: components.length > 0, components })
        }}>{vi ? 'Bỏ trích dẫn' : 'Remove quote'}</button>
      </div>)}
      {s.selected && <button type="button" disabled={readOnly || s.components.length >= 8} onClick={() => {
        let n = 1; while (s.components.some(c => c.id === `quote${n}`)) n++
        update(i, { ...s, components: [...s.components, { id: `quote${n}`, query: '', source_quote: '', importance: 'unknown' }] })
      }}>{vi ? 'Thêm trích dẫn từ đoạn nguồn' : 'Add source quote'}</button>}
    </article>)}
  </div>
}
