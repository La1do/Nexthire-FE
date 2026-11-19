import { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../context/authContextValue'
import { adminSkillDictionaryService as dictionary, validateDictionaryInput, type DictionaryDetail, type DictionaryEntry, type DictionaryHistory, type DictionaryPage } from '../../services/admin/adminSkillDictionary.service'
import { usePlanNavigationGuard } from '../RecruiterJobsPage/components/requirement-plan/usePlanNavigationGuard'
import './admin-skill-dictionary-page.css'

function advance(ref: { current: number }) { ref.current++ }
const statusText = (status: DictionaryEntry['status']) => status === 'ACTIVE' ? 'Đang sử dụng' : 'Ngừng sử dụng'
function errorText(cause: unknown) {
  const code = (cause as { response?: { status?: number } }).response?.status
  return code === 409 ? 'Tên đã được giữ chỗ hoặc phiên bản đã thay đổi. Bản nháp vẫn được giữ; tải lại trước khi lưu tiếp.' : code === 401 || code === 403 ? 'Phiên đăng nhập hoặc quyền quản trị không còn hợp lệ.' : code === 404 ? 'Không tìm thấy kỹ năng này.' : 'Chưa xác nhận được dữ liệu. Hãy tải lại; không tự gửi lại thay đổi.'
}
export function AdminSkillDictionaryPage() {
  const auth = useContext(AuthContext)
  const identity = `${auth?.user?.id ?? ''}:${auth?.user?.companyId ?? ''}:${auth?.user?.role ?? ''}:${auth?.isHydratingUser ?? true}`
  const currentIdentity = useRef(identity)
  currentIdentity.current = identity
  if (!auth || auth.isHydratingUser) return <p role="status">Đang xác minh quyền quản trị…</p>
  if (auth.user?.role !== 'ADMIN' || !auth.user.id) return <p role="alert">Bạn cần tài khoản quản trị hệ thống để mở từ điển kỹ năng.</p>
  return <DictionaryWorkspace key={identity} userId={auth.user.id} isCurrent={() => currentIdentity.current === identity} />
}
function DictionaryWorkspace({ userId, isCurrent }: { userId: string; isCurrent: () => boolean }) {
  const [filter, setFilter] = useState<'' | 'ACTIVE' | 'RETIRED'>('')
  const [page, setPage] = useState(1)
  const [list, setList] = useState<DictionaryPage<DictionaryEntry> | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [listAttempt, setListAttempt] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [loadedSelection, setLoadedSelection] = useState<string | null>(null)
  const [detail, setDetail] = useState<DictionaryDetail | null>(null)
  const [history, setHistory] = useState<DictionaryPage<DictionaryHistory> | null>(null)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyError, setHistoryError] = useState('')
  const [historyLoading, setHistoryLoading] = useState(false)
  const [name, setName] = useState('')
  const [aliases, setAliases] = useState('')
  const [status, setStatus] = useState<DictionaryEntry['status']>('ACTIVE')
  const [reason, setReason] = useState('')
  const [dirty, setDirty] = useState(false)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [locked, setLocked] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [attempt, setAttempt] = useState(0)
  const busyRef = useRef(false)
  const active = useRef(true)
  const listGeneration = useRef(0)
  const detailGeneration = useRef(0)
  const historyGeneration = useRef(0)
  const liveSelection = useRef(selected)
  liveSelection.current = selected
  const latestScope = useRef(isCurrent)
  latestScope.current = isCurrent
  const current = () => active.current && latestScope.current()
  useEffect(() => { active.current = true; return () => { active.current = false; advance(listGeneration); advance(detailGeneration); advance(historyGeneration) } }, [])
  usePlanNavigationGuard(dirty || busy, 'Có thay đổi từ điển chưa lưu. Rời trang và bỏ thay đổi?')
  useEffect(() => {
    const run = ++listGeneration.current, controller = new AbortController()
    setListLoading(true); setListError(''); setList(null)
    dictionary.list(page, filter, controller.signal).then(data => {
      if (current() && run === listGeneration.current) setList(data)
    }).catch(cause => { if (current() && run === listGeneration.current && !controller.signal.aborted) setListError(errorText(cause)) })
      .finally(() => { if (current() && run === listGeneration.current) setListLoading(false) })
    return () => { controller.abort(); advance(listGeneration) }
  }, [page, filter, listAttempt])
  useEffect(() => {
    const run = ++detailGeneration.current, controller = new AbortController(), id = selected
    setError(''); setLocked(false); setLoading(!!id && id !== 'new'); setLoadedSelection(null); setDirty(false); setReason(''); setHistory(null)
    if (!id || id === 'new') {
      setDetail(null); setName(''); setAliases(''); setStatus('ACTIVE'); setLoadedSelection(id)
      return () => { controller.abort(); advance(detailGeneration) }
    }
    dictionary.detail(id, controller.signal).then(data => {
      if (!current() || run !== detailGeneration.current || liveSelection.current !== id) return
      setDetail(data); setName(data.name); setAliases(data.aliases.join('\n')); setStatus(data.status); setLoadedSelection(id)
    }).catch(cause => { if (current() && run === detailGeneration.current && !controller.signal.aborted) { setError(errorText(cause)); setLocked(true) } })
      .finally(() => { if (current() && run === detailGeneration.current) setLoading(false) })
    return () => { controller.abort(); advance(detailGeneration) }
  }, [selected, attempt])
  useEffect(() => {
    const run = ++historyGeneration.current, controller = new AbortController(), id = selected
    setHistory(null); setHistoryError(''); setHistoryLoading(!!id && id !== 'new')
    if (!id || id === 'new') return () => { controller.abort(); advance(historyGeneration) }
    dictionary.history(id, historyPage, controller.signal).then(data => {
      if (current() && run === historyGeneration.current && liveSelection.current === id) setHistory(data)
    }).catch(cause => { if (current() && run === historyGeneration.current && !controller.signal.aborted) setHistoryError(errorText(cause)) })
      .finally(() => { if (current() && run === historyGeneration.current) setHistoryLoading(false) })
    return () => { controller.abort(); advance(historyGeneration) }
  }, [selected, historyPage, attempt])
  function allowLeave() { return !busyRef.current && (!dirty || window.confirm('Bỏ nội dung chưa lưu để chuyển lựa chọn?')) }
  function select(id: string) { if (id !== selected && allowLeave()) { setSelected(id); setDetail(null); setHistoryPage(1); setNotice('') } }
  function changed() { setDirty(true); setError(''); setNotice('') }
  function reload() {
    if (busyRef.current || dirty && !window.confirm('Tải lại sẽ bỏ bản nháp chưa lưu. Tiếp tục?')) return
    setAttempt(value => value + 1); setListAttempt(value => value + 1); setNotice('')
  }
  async function save() {
    const id = selected
    if (!id || busyRef.current || locked || loading || loadedSelection !== id || !current()) return
    const input = { name, aliases: aliases === '' ? [] : aliases.split('\n'), reason }
    const validation = validateDictionaryInput(input)
    if (validation) { setError(validation); return }
    const beforeRevision = detail?.revision
    const run = detailGeneration.current
    busyRef.current = true; setBusy(true); setError(''); setNotice('')
    try {
      const saved = id === 'new' ? await dictionary.create(input) : await dictionary.update(id, detail!.revision, input, status, detail!.snapshotSha256)
      if (!current() || liveSelection.current !== id || run !== detailGeneration.current) return
      setDirty(false); setReason(''); setLocked(true)
      setNotice(id === 'new' ? 'Đã tạo kỹ năng. Đang tải thông tin chi tiết đã lưu.' : saved.revision === beforeRevision ? 'Nội dung không đổi; không tạo phiên bản hoặc lịch sử mới.' : `Đã lưu phiên bản ${saved.revision}.`)
      // Mutation responses omit reserved names. Preserve same-record detail until an explicit detail read succeeds.
      if (detail?.id === saved.id) setDetail({ ...detail, ...saved })
      if (id === 'new') { setDetail(null); setSelected(saved.id); setHistoryPage(1) }
      else setAttempt(value => value + 1)
      setListAttempt(value => value + 1)
    } catch (cause) {
      if (!current() || liveSelection.current !== id || run !== detailGeneration.current) return
      setLocked(true); setError(errorText(cause))
    } finally { if (current() && liveSelection.current === id) { busyRef.current = false; setBusy(false) } }
  }
  const editable = selected && loadedSelection === selected && !loading && !locked && !busy
  return <div className="skill-dictionary">
    <header className="skill-dictionary__header"><div><h1>Từ điển kỹ năng</h1><p>Quản lý tên chính và tên gọi khác. Thay đổi tại đây chưa tự cập nhật việc đọc CV, đối chiếu kỹ năng hoặc dữ liệu cũ.</p></div><button type="button" onClick={() => select('new')} disabled={busy}>+ Thêm kỹ năng</button></header>
    <div className="skill-dictionary__columns">
      <section aria-label="Danh sách kỹ năng" className="skill-dictionary__panel">
        <label>Trạng thái danh sách<select aria-label="Trạng thái danh sách" value={filter} disabled={busy} onChange={event => { if (allowLeave()) { setFilter(event.target.value as typeof filter); setPage(1) } }}><option value="">Tất cả</option><option value="ACTIVE">Đang sử dụng</option><option value="RETIRED">Ngừng sử dụng</option></select></label>
        {listLoading && <p role="status">Đang tải danh sách…</p>}
        {listError && <p role="alert">{listError} <button type="button" onClick={() => setListAttempt(value => value + 1)}>Thử tải danh sách</button></p>}
        {list && <><p>{list.meta.total} kỹ năng</p><ul className="skill-dictionary__list">{list.items.map(item => <li key={item.id}><button type="button" aria-current={selected === item.id ? 'true' : undefined} onClick={() => select(item.id)} disabled={busy}><strong>{item.name}</strong><span>{statusText(item.status)} · Phiên bản {item.revision}</span></button></li>)}</ul>{!list.items.length && <p>Chưa có kỹ năng trong danh sách này.</p>}<nav aria-label="Trang danh sách"><button type="button" disabled={busy || page <= 1} onClick={() => { if (allowLeave()) setPage(value => value - 1) }}>Trang trước</button><span>Trang {page} / {Math.max(1, list.meta.totalPages)}</span><button type="button" disabled={busy || page >= list.meta.totalPages} onClick={() => { if (allowLeave()) setPage(value => value + 1) }}>Trang sau</button></nav></>}
      </section>
      <section aria-label="Chi tiết kỹ năng" className="skill-dictionary__panel">
        {!selected && <p>Chọn một kỹ năng để xem và chỉnh sửa, hoặc thêm kỹ năng mới.</p>}
        {selected && <><div className="skill-dictionary__heading"><h2>{selected === 'new' ? 'Thêm kỹ năng' : 'Thông tin kỹ năng'}</h2><button type="button" disabled={busy} onClick={reload}>Tải lại bản đã lưu</button></div>
          {notice && <p role="status">{notice}</p>}{error && <p role="alert">{error}</p>}{loading && <p role="status">Đang tải chi tiết…</p>}
          {selected !== 'new' && detail && <p>Phiên bản đã lưu: {detail.revision} · {statusText(detail.status)}{filter && detail.status !== filter ? ' · Kỹ năng này nằm ngoài bộ lọc hiện tại.' : ''}</p>}
          <form onSubmit={event => { event.preventDefault(); void save() }}><fieldset disabled={!editable}><legend>{selected === 'new' ? 'Nội dung kỹ năng mới' : 'Chỉnh sửa kỹ năng'}</legend>
            <label>Tên chính<input aria-label="Tên chính" maxLength={120} value={name} onChange={event => { setName(event.target.value); changed() }} /></label>
            <label>Tên gọi khác (mỗi dòng một tên)<textarea aria-label="Tên gọi khác (mỗi dòng một tên)" rows={4} value={aliases} onChange={event => { setAliases(event.target.value); changed() }} /></label>
            <p>Tối đa 20 tên, mỗi tên tối đa 120 ký tự. Tên không được trùng sau chuẩn hóa Unicode, khoảng trắng và chữ hoa. C, C++, C# và .NET là những tên khác nhau.</p>
            {selected !== 'new' && <label>Trạng thái kỹ năng<select aria-label="Trạng thái kỹ năng" value={status} onChange={event => { setStatus(event.target.value as typeof status); changed() }}><option value="ACTIVE">Đang sử dụng</option><option value="RETIRED">Ngừng sử dụng</option></select></label>}
            <label>Lý do thay đổi<textarea aria-label="Lý do thay đổi" rows={2} maxLength={500} value={reason} onChange={event => { setReason(event.target.value); changed() }} /></label>
            <button type="submit" disabled={!dirty}>{busy ? 'Đang lưu…' : 'Lưu kỹ năng'}</button>
          </fieldset></form>
          {dirty && <p role="status">Bản nháp chưa lưu.</p>}
          <p>Ngừng sử dụng không xóa kỹ năng. Tên chính, tên gọi khác và tên cũ vẫn được giữ chỗ; có thể kích hoạt lại cùng kỹ năng.</p>
          {selected !== 'new' && <><h3>Tên cũ đang được giữ chỗ</h3>{loadedSelection !== selected && <p>Thông tin tên cũ chưa được xác nhận ở lần tải này; nội dung bên dưới thuộc bản đã tải trước nếu có.</p>}{detail?.id === selected ? detail.reservedNames.length ? <ul>{detail.reservedNames.map(term => <li key={term.normalizedName}>{term.name}</li>)}</ul> : <p>Chưa có tên cũ đang được giữ chỗ trong bản đã tải.</p> : <p>Chưa tải được thông tin tên cũ.</p>}
          <h3>Lịch sử thay đổi đã áp dụng</h3>{historyLoading && <p role="status">Đang tải lịch sử…</p>}{historyError && <p role="alert">{historyError}</p>}{history && <><p>Chỉ gồm thay đổi đã lưu thành công; không phải nhật ký mọi lần thử.</p>{!history.items.length && <p>Chưa có thay đổi trong trang lịch sử này.</p>}{history.items.map(item => <details key={item.id}><summary>Phiên bản {item.afterRevision} · {item.action === 'CREATE' ? 'Tạo mới' : 'Cập nhật'} · {new Date(item.occurredAt).toLocaleString('vi-VN')}</summary><p>Người thực hiện: {item.actorId === userId ? 'Bạn' : 'Quản trị viên khác'}</p><p>Lý do: {item.reason}</p><div className="skill-dictionary__snapshots">{[item.before, item.after].map((snapshot, index) => <div key={index}><h4>{index === 0 ? 'Trước thay đổi' : 'Sau thay đổi'}</h4>{snapshot ? <><p>{snapshot.name} · {statusText(snapshot.status)} · Phiên bản {snapshot.revision}</p><p>Tên gọi khác: {snapshot.aliases.join(', ') || 'Không có'}</p></> : <p>Chưa có kỹ năng.</p>}</div>)}</div></details>)}<nav aria-label="Trang lịch sử"><button type="button" disabled={busy || historyPage <= 1} onClick={() => setHistoryPage(value => value - 1)}>Lịch sử trước</button><span>Trang {historyPage} / {Math.max(1, history.meta.totalPages)}</span><button type="button" disabled={busy || historyPage >= history.meta.totalPages} onClick={() => setHistoryPage(value => value + 1)}>Lịch sử sau</button></nav></>}</>}
        </>}
      </section>
    </div>
  </div>
}
