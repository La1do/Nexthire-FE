import { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getApiErrorCode } from '../../../lib/api/apiError'
import { AuthContext } from '../../../context/authContextValue'
import { candidateService, type CandidateJobRecommendations as Recommendations, type RecommendationCv } from '../../../services/candidate.service'
import { Button } from '../../_components'
import { createJobDetailHrefById } from '../../_utils/jobRoutes'
import './candidate-job-recommendations.css'

const sourceLabels: Record<string, string> = { HEADLINE: 'Tiêu đề CV', SUMMARY: 'Tóm tắt CV', SKILLS: 'Kỹ năng', EXPERIENCE: 'Kinh nghiệm', EDUCATION: 'Học vấn', PROJECTS: 'Dự án', CERTIFICATIONS: 'Chứng chỉ', TITLE: 'Tên vị trí', REQUIREMENTS: 'Yêu cầu công việc', DESCRIPTION: 'Mô tả công việc' }
const workingTypes: Record<string, string> = { ONSITE: 'Tại văn phòng', REMOTE: 'Từ xa', HYBRID: 'Kết hợp' }
const experienceLevels: Record<string, string> = { INTERN: 'Thực tập', FRESHER: 'Mới tốt nghiệp', JUNIOR: 'Junior', MIDDLE: 'Middle', SENIOR: 'Senior', LEAD: 'Trưởng nhóm' }
const emptyReasons = {
  NO_PUBLIC_JOBS: 'Chưa có việc làm công khai đủ điều kiện trong lần kiểm tra này.',
  NO_JOBS_ABOVE_THRESHOLD: 'Chưa tìm thấy việc làm phù hợp với CV này trong nhóm tin đã kiểm tra.',
  NO_KEYWORD_OVERLAP: 'Chưa tìm thấy từ khóa chung với CV trong nhóm việc làm đã kiểm tra.',
  CV_TEXT_EMPTY: 'Bản phân tích CV chưa có nội dung văn bản để đối chiếu.',
}
function readError(cause: unknown) {
  const status = (cause as { response?: { status?: number } }).response?.status
  if (status === 409) {
    const code = getApiErrorCode(cause)
    return code === 'RECOMMENDATIONS_PARSE_REQUIRED' || code === 'RECOMMENDATIONS_PARSE_MISSING' ? 'CV này chưa có bản phân tích đã lưu để đối chiếu. Hãy kiểm tra CV rồi tải lại danh sách.' : 'CV hoặc tin tuyển dụng đã thay đổi trong lúc tải. Hãy tải lại danh sách CV hoặc thử xem gợi ý lần nữa.'
  }
  return status === 404 ? 'Không tìm thấy CV thuộc tài khoản hiện tại. Hãy tải lại danh sách CV.' : status === 401 || status === 403 ? 'Phiên đăng nhập hoặc quyền ứng viên chưa hợp lệ. Hãy đăng nhập lại.' : status === 503 ? 'Dịch vụ chưa cung cấp được dữ liệu CV hoặc việc làm. Bạn có thể thử lại sau.' : 'Không tải được dữ liệu hợp lệ. Bạn có thể thử lại; kết quả cũ đã được ẩn.'
}
const cvParseStatusLabels: Record<RecommendationCv['parseStatus'], string> = {
  NOT_PARSED: 'Chưa đọc',
  PARSING: 'Đang đọc',
  PARSED: 'Đã đọc',
  FAILED: 'Đọc thất bại',
}
const cvBinding = (cv: RecommendationCv) => `${cv.id}:${cv.parsedAt ?? ''}:${cv.updatedAt}`

export function CandidateJobRecommendations() {
  const auth = useContext(AuthContext)
  const identity = `${auth?.user?.id ?? ''}:${auth?.user?.companyId ?? ''}:${auth?.user?.role ?? ''}:${auth?.isHydratingUser ?? true}`
  const liveIdentity = useRef(identity)
  liveIdentity.current = identity
  if (!auth || auth.isHydratingUser) return <section className="candidate-recommendations"><p role="status">Đang xác minh tài khoản để xem gợi ý theo CV…</p></section>
  if (auth.user?.role !== 'CANDIDATE') return null
  return <RecommendationSelector key={identity} userId={auth.user.id} isCurrent={() => liveIdentity.current === identity} />
}

function RecommendationSelector({ userId, isCurrent }: { userId: string; isCurrent: () => boolean }) {
  const [cvs, setCvs] = useState<RecommendationCv[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [startingCvId, setStartingCvId] = useState('')
  const [parseFeedback, setParseFeedback] = useState<{ cvId: string; message: string } | null>(null)
  const generation = useRef(0)
  const parseRequest = useRef<AbortController | null>(null)
  const currentIdentity = useRef(isCurrent)
  currentIdentity.current = isCurrent
  const currentSelection = useRef(selectedId)
  currentSelection.current = selectedId
  const selected = cvs.find(cv => cv.id === selectedId)
  const readyCv = !loading && !error && selected?.parseStatus === 'PARSED' ? selected : null
  const parsingCvId = !loading && !error && selected?.parseStatus === 'PARSING' ? selected.id : ''
  const binding = readyCv ? cvBinding(readyCv) : ''
  const liveBinding = useRef(binding)
  liveBinding.current = binding

  useEffect(() => {
    const run = ++generation.current, controller = new AbortController()
    setLoading(true); setError('')
    candidateService.getRecommendationCvs(userId, controller.signal).then(data => {
      if (controller.signal.aborted || !currentIdentity.current() || generation.current !== run) return
      setCvs(data); setSelectedId(id => data.some(cv => cv.id === id) ? id : '')
    }).catch(cause => {
      if (!controller.signal.aborted && currentIdentity.current() && generation.current === run) { setCvs([]); setError(readError(cause)) }
    }).finally(() => { if (!controller.signal.aborted && currentIdentity.current() && generation.current === run) setLoading(false) })
    return () => controller.abort()
  }, [userId, attempt])

  useEffect(() => () => parseRequest.current?.abort(), [])

  useEffect(() => {
    if (!parsingCvId) return
    const controller = new AbortController()
    const run = generation.current
    const active = () => !controller.signal.aborted && currentIdentity.current() &&
      currentSelection.current === parsingCvId && generation.current === run
    let timer: number | undefined
    const deadline = window.setTimeout(() => {
      if (active()) {
        setParseFeedback({ cvId: parsingCvId, message: 'CV vẫn đang được đọc. Bạn có thể tải lại danh sách để kiểm tra trạng thái.' })
      }
      controller.abort()
    }, 90_000)

    async function poll() {
      if (!active()) return
      try {
        const list = await candidateService.getRecommendationCvs(userId, controller.signal)
        if (!active()) return
        const updated = list.find(cv => cv.id === parsingCvId)
        if (!updated) {
          setCvs(list)
          setSelectedId(id => id === parsingCvId ? '' : id)
          return
        }
        if (updated.parseStatus !== 'PARSING') {
          setCvs(rows => rows.map(cv => cv.id === parsingCvId ? updated : cv))
          return
        }
      } catch (cause) {
        if (!active()) return
        const status = (cause as { response?: { status?: number } }).response?.status
        if (status === 401 || status === 403) {
          setParseFeedback({ cvId: parsingCvId, message: readError(cause) })
          window.clearTimeout(deadline)
          controller.abort()
          return
        }
      }
      if (active()) timer = window.setTimeout(poll, 2500)
    }

    timer = window.setTimeout(poll, 2500)
    return () => {
      controller.abort()
      window.clearTimeout(timer)
      window.clearTimeout(deadline)
    }
  }, [parsingCvId, userId])

  function refreshCvs() {
    generation.current += 1
    liveBinding.current = ''
    setParseFeedback(null)
    setLoading(true)
    setAttempt(value => value + 1)
  }

  function selectCv(id: string) {
    currentSelection.current = id
    liveBinding.current = ''
    setParseFeedback(null)
    setSelectedId(id)
  }

  async function startCvParse() {
    if (!selected || !currentIdentity.current() || parseRequest.current ||
      (selected.parseStatus !== 'NOT_PARSED' && selected.parseStatus !== 'FAILED')) return
    const cvId = selected.id
    const controller = new AbortController()
    parseRequest.current = controller
    setParseFeedback(null)
    setStartingCvId(cvId)

    try {
      const cv = await candidateService.parseCvForRecommendations(cvId, controller.signal)
      if (!controller.signal.aborted && currentIdentity.current()) {
        setCvs(rows => rows.map(row => row.id === cvId ? cv : row))
      }
    } catch (cause) {
      if (!controller.signal.aborted && currentIdentity.current()) {
        const status = (cause as { response?: { status?: number } }).response?.status
        const message = status === 401 || status === 403 || status === 404
          ? readError(cause)
          : 'Chưa thể bắt đầu đọc CV này. Hãy tải lại danh sách để kiểm tra trạng thái hoặc thử lại.'
        setParseFeedback({ cvId, message })
      }
    } finally {
      if (parseRequest.current === controller) parseRequest.current = null
      if (!controller.signal.aborted && currentIdentity.current()) setStartingCvId('')
    }
  }

  const starting = selectedId !== '' && startingCvId === selectedId
  const canStart = selected?.parseStatus === 'NOT_PARSED' || selected?.parseStatus === 'FAILED'
  const feedback = parseFeedback?.cvId === selectedId ? parseFeedback.message : ''

  return <section className="candidate-recommendations" aria-label="Gợi ý việc làm theo CV">
    <header>
      <div>
        <h2>Gợi ý việc làm theo CV</h2>
        <p>Chọn CV bạn muốn dùng để xem việc làm liên quan.</p>
      </div>
      <Button size="sm" variant="secondary" disabled={loading || Boolean(startingCvId)} onClick={refreshCvs}>Tải lại danh sách CV</Button>
    </header>
    <p>Mỗi lần chỉ xem tối đa 100 việc làm công khai mới nhất đủ điều kiện; kết quả không bao quát toàn bộ thị trường.</p>
    {loading && <p role="status">Đang tải danh sách CV…</p>}
    {error && <p role="alert">{error}</p>}
    {!loading && !error && !cvs.length && <p>Bạn chưa có CV. <Link to="/profile/cvs">Mở CV của bạn</Link> để tải lên.</p>}
    {!loading && !error && cvs.length > 0 && (
      <label className="candidate-recommendations__selector">
        CV dùng để đối chiếu
        <select aria-label="CV dùng để đối chiếu" value={selectedId} onChange={event => selectCv(event.target.value)}>
          <option value="">Chọn CV</option>
          {cvs.map((cv, index) => <option key={cv.id} value={cv.id}>{cv.title?.trim() || `CV ${index + 1}`} — {cvParseStatusLabels[cv.parseStatus]}</option>)}
        </select>
      </label>
    )}
    {!loading && !error && selected && (
      <>
        {canStart && <Button size="sm" disabled={Boolean(startingCvId)} onClick={() => void startCvParse()}>
          {starting ? 'Đang gửi yêu cầu…' : selected.parseStatus === 'FAILED' ? 'Thử đọc lại' : 'Đọc CV này'}
        </Button>}
        {Boolean(parsingCvId) && <p role="status">Đang đọc CV. Bạn có thể xem gợi ý khi CV đã được đọc.</p>}
        {selected.parseStatus === 'FAILED' && !starting && !feedback && <p role="alert">Chưa thể đọc CV này. Bạn có thể thử đọc lại.</p>}
        {feedback && <p role={parsingCvId ? 'status' : 'alert'}>{feedback}</p>}
      </>
    )}
    {binding && readyCv && <RecommendationResults key={binding} cv={readyCv} isCurrent={() => currentIdentity.current() && liveBinding.current === binding} />}
  </section>
}

function RecommendationResults({ cv, isCurrent }: { cv: RecommendationCv; isCurrent: () => boolean }) {
  const [data, setData] = useState<Recommendations | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkedAt, setCheckedAt] = useState('')
  const request = useRef<{ id: number; busy: boolean; controller: AbortController | null }>({ id: 0, busy: false, controller: null })
  const mounted = useRef(true)
  const current = useRef(isCurrent)
  current.current = isCurrent
  useEffect(() => { mounted.current = true; const pending = request.current; return () => { mounted.current = false; pending.controller?.abort() } }, [])
  async function fetchRecommendations() {
    if (!current.current() || request.current.busy) return
    const pending = request.current
    pending.controller?.abort(); const controller = new AbortController(), run = ++pending.id
    pending.controller = controller; pending.busy = true
    setLoading(true); setData(null); setError(''); setCheckedAt('')
    const active = () => mounted.current && current.current() && !controller.signal.aborted && request.current.id === run
    try {
      const response = await candidateService.getJobRecommendations(cv.id, controller.signal)
      if (active()) { setData(response); setCheckedAt(new Date(response.sourceCheckedAt ?? Date.now()).toLocaleString('vi-VN')) }
    } catch (cause) { if (active()) setError(readError(cause)) }
    finally { if (request.current.id === run) request.current.busy = false; if (active()) setLoading(false) }
  }
  const isWarming = data?.status === 'INDEX_WARMING'
  const hasSemanticResults = data?.schemaVersion === 'candidate-job-recommendations-v2'
  return <div className="candidate-recommendations__results">
    <Button size="sm" disabled={loading} onClick={() => void fetchRecommendations()}>{loading ? 'Đang tìm việc làm…' : isWarming || error ? 'Thử lại gợi ý' : data ? 'Làm mới gợi ý' : 'Xem gợi ý theo CV này'}</Button>
    {loading && <p role="status">Đang đối chiếu CV với việc làm công khai…</p>}
    {error && <p role="alert">{error}</p>}
    {data && <>
      {hasSemanticResults ? (
        <p role="status">
          Đã lập chỉ mục {data.pool.indexed}/{data.pool.considered} việc làm được đưa vào lượt xem này. Cập nhật lúc {checkedAt}.
        </p>
      ) : (
        <p role="status">Đã xem {data.pool.considered} việc làm. Cập nhật lúc {checkedAt}.</p>
      )}
      {data.status === 'INDEX_WARMING' && <p>Một số tin đang được chuẩn bị để đối chiếu với CV. Bạn có thể thử lại sau.</p>}
      {data.status === 'READY_PARTIAL' && <p>Danh sách hiện dựa trên các tin đã lập chỉ mục. Một số tin đang được chuẩn bị.</p>}
      {data.warnings?.includes('SHORTLIST_CHANGED_DURING_READ') && <p>Một số tin đã thay đổi hoặc không còn công khai trong lúc tải và đã được loại khỏi kết quả.</p>}
      {data.status === 'EMPTY' && data.reason && data.reason !== 'JD_INDEX_PENDING' && <p>{emptyReasons[data.reason]} Bạn vẫn có thể <Link to="/search">tìm việc làm</Link> theo tiêu chí riêng.</p>}
      <ol className="candidate-recommendations__list">{data.items.map(item => <li key={item.job.id}>
        <article><div className="candidate-recommendations__job-heading"><div><span>Thứ tự {item.rank}</span><h3><Link to={createJobDetailHrefById(item.job.id)}>{item.job.title}</Link></h3><p>{item.job.companyName || 'Chưa có tên doanh nghiệp'}</p></div>{'semanticScore' in item ? <strong>Điểm tương đồng {item.semanticScore.toFixed(3)}</strong> : <strong>Điểm từ khóa: {item.keywordScore}</strong>}</div>
          <p>{[item.job.location, item.job.workingType ? workingTypes[item.job.workingType] || item.job.workingType : null, item.job.experienceLevel ? experienceLevels[item.job.experienceLevel] || item.job.experienceLevel : null].filter(Boolean).join(' · ') || 'Chưa có thông tin địa điểm và hình thức làm việc'}</p>
          {'evidence' in item ? (
            item.evidence.length > 0 && <details>
              <summary>Đoạn CV và yêu cầu liên quan</summary>
              <ul>{item.evidence.map(hit => <li key={JSON.stringify([hit.cvSource, hit.cvText, hit.jobText])}>
                <span><strong>CV · {sourceLabels[hit.cvSource]}</strong> {hit.cvText}</span>
                <span><strong>Tin tuyển dụng</strong> {hit.jobText}</span>
              </li>)}</ul>
            </details>
          ) : (
            <details>
              <summary>Từ khóa chung và nguồn ({item.matchedTerms.length}{item.keywordScore > item.matchedTerms.length ? ` / ${item.keywordScore}` : ''})</summary>
              {item.keywordScore > item.matchedTerms.length && <p>Chỉ hiển thị tối đa 20 từ khóa chung; điểm đếm toàn bộ từ khóa chung được tìm thấy.</p>}
              <ul>{item.matchedTerms.map(hit => <li key={hit.term}><strong>{hit.term}</strong><span>Trong CV: {hit.cvSources.map(source => sourceLabels[source]).join(', ')}</span><span>Trong tin tuyển dụng: {hit.jobSources.map(source => sourceLabels[source]).join(', ')}</span></li>)}</ul>
            </details>
          )}
        </article>
      </li>)}</ol></>}
  </div>
}
