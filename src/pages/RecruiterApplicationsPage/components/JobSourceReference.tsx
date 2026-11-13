import { useEffect, useState } from 'react'
import { jobService } from '../../../services/job.service'
import type { RecruiterJobResponse } from '../../../types/job.types'
import { parseJobContent } from '../../JobDetailPage/utils/jobContentParser'

/** On-demand source reference; never a third workspace column. */
export function JobSourceReference({ jobId }: { jobId: string }) {
  const [open, setOpen] = useState(false)
  const [job, setJob] = useState<RecruiterJobResponse | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!open || job?.id === jobId) return
    let active = true
    setFailed(false)
    jobService.getRecruiterJobById(jobId).then(value => { if (active) setJob(value) })
      .catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [open, jobId, attempt, job?.id])
  return <details className="recruiter-jd-source" open={open} onToggle={e => setOpen(e.currentTarget.open)}>
    <summary>JD gốc · Xem nội dung tin tuyển dụng</summary>
    {open && <div className="recruiter-jd-source__body" tabIndex={0} aria-label="Nội dung JD gốc">
      <p className="recruiter-jd-source__notice">Nội dung tin tuyển dụng hiện tại, không phải snapshot lịch sử của kết quả đối chiếu.</p>
      {failed ? <p role="alert">Không tải được JD. <button type="button" onClick={() => setAttempt(v => v + 1)}>Thử lại</button></p> : job?.id !== jobId ? <p role="status">Đang tải JD…</p> : <>
        <h3>{job.title}</h3>
        {([['Mô tả công việc', job.description], ['Yêu cầu', job.requirements]] as const).map(([title, text]) => <section key={title}><h4>{title}</h4>{parseJobContent(text ?? '').map((block, index) => block.type === 'list' ? <ul key={index}>{block.items.map((item, i) => <li key={i}>{item}</li>)}</ul> : block.type === 'subheading' ? <h5 key={index}>{block.text}</h5> : <p key={index}>{block.text}</p>)}</section>)}
      </>}
    </div>}
  </details>
}
