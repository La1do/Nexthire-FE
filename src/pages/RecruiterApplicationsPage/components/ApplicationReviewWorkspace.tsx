import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Copy,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  ListChecks,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  UserCheck,
  X,
} from 'lucide-react'
import { LocaleContext } from '../../../i18n/localeContext'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import { applicationService } from '../../../services/application.service'
import { jobService } from '../../../services/job.service'
import type { ApplicationCvDownloadResponse } from '../../../types/application.types'
import { parseHrReviewEnvelope, type HrReview } from '../../../types/hr-review.types'
import { Ai1EvidenceView, type JumpToPdfPayload } from './ai1/Ai1EvidenceView'
import { ai1Copy } from './ai1/ai1Copy'
import { PdfCvViewer } from './PdfCvViewer'
import type {
  JobExperienceLevel,
  JobType,
  JobWorkingType,
  RecruiterJobResponse,
} from '../../../types/job.types'
import type { RecruiterApplicationItem } from '../types'

export type { JumpToPdfPayload }

export type ApplicationReviewWorkspaceProps = {
  application: RecruiterApplicationItem
  className?: string
  hrReview?: HrReview | null
  initialTab?: 'cv' | 'criteria'
  job?: RecruiterJobResponse | null
  onOpenResumeExternal?: () => void
  jumpTarget?: JumpToPdfPayload | string | null
}

const EMPLOYMENT_TYPE_LABELS: Record<JobType, string> = {
  FULL_TIME: 'Toàn thời gian',
  PART_TIME: 'Bán thời gian',
  CONTRACT: 'Hợp đồng',
  INTERNSHIP: 'Thực tập',
  FREELANCE: 'Tự do',
}

const WORKING_TYPE_LABELS: Record<JobWorkingType, string> = {
  ONSITE: 'Tại văn phòng',
  REMOTE: 'Từ xa',
  HYBRID: 'Kết hợp',
}

const EXPERIENCE_LEVEL_LABELS: Record<JobExperienceLevel, string> = {
  INTERN: 'Thực tập sinh',
  FRESHER: 'Fresher (Mới tốt nghiệp)',
  JUNIOR: 'Junior (1 - 2 năm)',
  MIDDLE: 'Middle (2 - 4 năm)',
  SENIOR: 'Senior (4 - 7 năm)',
  LEAD: 'Lead / Trưởng nhóm (7+ năm)',
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000
    return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)} triệu`
  }
  return new Intl.NumberFormat('vi-VN').format(amount)
}

function formatJobSalary(job: RecruiterJobResponse): string {
  if (!job.isSalaryVisible) {
    return 'Thỏa thuận (Không công khai)'
  }
  if (job.salaryMin == null && job.salaryMax == null) {
    return 'Thỏa thuận'
  }
  if (job.salaryMin != null && job.salaryMax != null) {
    if (job.salaryMin === job.salaryMax) {
      return `${formatCurrency(job.salaryMin)} ${job.salaryCurrency}`
    }
    return `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)} ${job.salaryCurrency}`
  }
  if (job.salaryMin != null) {
    return `Từ ${formatCurrency(job.salaryMin)} ${job.salaryCurrency}`
  }
  if (job.salaryMax != null) {
    return `Lên đến ${formatCurrency(job.salaryMax)} ${job.salaryCurrency}`
  }
  return 'Thỏa thuận'
}

function parseRequirements(requirementsText?: string | null): string[] {
  if (!requirementsText) return []
  return requirementsText
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .map((line) => line.replace(/^[-*•–—\d+.)\s]+/, '').trim())
    .filter((line) => line.length > 0)
}

// A literal source occurrence is a search aid, never a verified skill or fit score.
export function findSkillOccurrence(skillName: string, hrReview: HrReview | null | undefined): boolean {
  const term = skillName.trim().toLowerCase()
  if (!term) return false
  return (hrReview?.requirements ?? []).some(req =>
    [ ...req.evidence, ...(req.components?.flatMap(part => part.evidence) ?? []) ].some(hit =>
      !(hit.reasonCodes ?? []).includes('LEXICAL_ABSENT_PENALTY') &&
      (hit.source.toLowerCase() === 'skill' || hit.source.toLowerCase() === 'skills') &&
      hit.text.trim().toLowerCase() === term,
    ),
  )
}

// Invalidate late success, error AND finally callbacks, including overlapping retries.
export function createLatestRequestGuard() {
  let generation = 0
  return {
    start() { const current = ++generation; return () => current === generation },
    invalidate() { generation++ },
  }
}

function renderHighlightedSnippet(text: string, phrase: string): React.ReactNode {
  if (!text || !phrase) return text
  const cleanPhrase = phrase.trim()
  if (!cleanPhrase) return text

  const terms = [cleanPhrase]

  if (terms.length === 0) return text
  const pattern = terms.map((t) => t.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')
  const regex = new RegExp(`(${pattern})`, 'gi')
  const parts = text.split(regex)

  if (parts.length <= 1) return text
  return (
    <>
      {parts.map((part, i) => {
        const isMatch = terms.some((t) => t.toLowerCase() === part.toLowerCase())
        return isMatch ? (
          <mark key={i} className="ai1-evidence__span-highlight">
            {part}
          </mark>
        ) : (
          part
        )
      })}
    </>
  )
}

export function ApplicationReviewWorkspace(props: ApplicationReviewWorkspaceProps) {
  return <ReviewWorkspaceContent key={`${props.application.id}:${props.application.jobId}:${props.application.updatedAt}`} {...props} />
}

function ReviewWorkspaceContent({
  application,
  className = '',
  hrReview: propHrReview,
  initialTab = 'cv',
  job: initialJob = null,
  onOpenResumeExternal,
  jumpTarget,
}: ApplicationReviewWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'cv' | 'criteria'>(initialTab)
  const [pdfSearchQuery, setPdfSearchQuery] = useState<string | null>(() =>
    (typeof jumpTarget === 'string' ? jumpTarget : jumpTarget?.phrase)?.trim() || null,
  )
  const [activeSnippet, setActiveSnippet] = useState<JumpToPdfPayload | null>(() =>
    typeof jumpTarget === 'string' ? { phrase: jumpTarget } : jumpTarget ?? null,
  )
  const [searchRequestId, setSearchRequestId] = useState(0)
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false)
  const [selectedSkillHighlight, setSelectedSkillHighlight] = useState<string | null>(null)
  const localeContext = useContext(LocaleContext)
  const currentLocale = localeContext?.locale ?? 'vi'
  const copy = ai1Copy[currentLocale as keyof typeof ai1Copy] ?? ai1Copy.vi

  const triggerSearchAndCopy = useCallback((target: JumpToPdfPayload | string) => {
    const phrase = typeof target === 'string' ? target : target.phrase
    if (!phrase?.trim()) return
    const clean = phrase.trim()
    setPdfSearchQuery(clean)
    setSelectedSkillHighlight(clean)
    setSearchRequestId(id => id + 1)
    setActiveSnippet(typeof target === 'object' ? { ...target, phrase: clean } : { phrase: clean })
    setActiveTab('cv')

    // Automatically copy to clipboard (Cách 2)
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(clean).then(() => {
        setCopiedNotification(true)
        setTimeout(() => setCopiedNotification(false), 4000)
      }).catch(() => {})
    }
  }, [])

  const handleJumpToPdf = useCallback((target: string | JumpToPdfPayload) => {
    triggerSearchAndCopy(target)
  }, [triggerSearchAndCopy])

  useEffect(() => {
    if (jumpTarget) {
      triggerSearchAndCopy(jumpTarget)
    }
  }, [jumpTarget, triggerSearchAndCopy])

  // CV Preview State
  const [cvData, setCvData] = useState<ApplicationCvDownloadResponse | null>(null)
  const [isCvLoading, setIsCvLoading] = useState<boolean>(true)
  const [cvError, setCvError] = useState<string | null>(null)
  const [isIframeLoaded, setIsIframeLoaded] = useState<boolean>(false)
  const [hasIframeError, setHasIframeError] = useState<boolean>(false)
  const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false)

  // Job Criteria State
  const [jobData, setJobData] = useState<RecruiterJobResponse | null>(initialJob)
  const [isJobLoading, setIsJobLoading] = useState<boolean>(!initialJob && Boolean(application.jobId))
  const [jobError, setJobError] = useState<string | null>(null)

  // Fallback to fetch hrReview if not passed down as prop
  const [internalHrReview, setInternalHrReview] = useState<HrReview | null>(null)

  useEffect(() => {
    if (propHrReview !== undefined) {
      return
    }

    let active = true
    const controller = new AbortController()

    applicationService
      .getRecruiterApplicationHrReview(application.id, controller.signal)
      .then((payload) => {
        if (!active) return
        try {
          const parsed = parseHrReviewEnvelope(payload, application.id, application.jobId)
          setInternalHrReview(parsed)
        } catch {
          setInternalHrReview(null)
        }
      })
      .catch(() => {
        if (active) setInternalHrReview(null)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [application.id, application.jobId, propHrReview])

  const effectiveHrReview = propHrReview !== undefined ? propHrReview : internalHrReview

  const cvRequests = useRef(createLatestRequestGuard())
  const jobRequests = useRef(createLatestRequestGuard())
  useEffect(() => {
    const cv = cvRequests.current
    const job = jobRequests.current
    return () => { cv.invalidate(); job.invalidate() }
  }, [])

  // Only the latest request may update document data, errors or loading state.
  const fetchCv = useCallback(async (appId: string) => {
    const isCurrent = cvRequests.current.start()
    setCvData(null)
    setUseIframeFallback(false)
    setIsCvLoading(true)
    setCvError(null)
    setIsIframeLoaded(false)
    setHasIframeError(false)

    try {
      const data = await applicationService.getRecruiterApplicationCv(appId)
      if (isCurrent()) setCvData(data)
    } catch (error) {
      const message = getApiErrorEnvelope(error)?.error.message ?? 'Không thể tải bản xem trước CV của ứng viên.'
      if (isCurrent()) setCvError(message)
    } finally {
      if (isCurrent()) setIsCvLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCv(application.id)
  }, [application.id, fetchCv])

  // Fetch Job details when application.jobId changes
  const fetchJob = useCallback(async (jobId: string) => {
    const isCurrent = jobRequests.current.start()
    setJobData(null)
    if (!jobId) {
      setJobData(null)
      setIsJobLoading(false)
      return
    }

    setIsJobLoading(true)
    setJobError(null)

    try {
      const data = await jobService.getRecruiterJobById(jobId)
      if (isCurrent() && data.id === jobId) setJobData(data)
    } catch (error) {
      const message = getApiErrorEnvelope(error)?.error.message ?? 'Không thể tải thông tin tiêu chí tin tuyển dụng.'
      if (isCurrent()) setJobError(message)
    } finally {
      if (isCurrent()) setIsJobLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialJob && initialJob.id === application.jobId) {
      setJobData(initialJob)
      setIsJobLoading(false)
      setJobError(null)
      return
    }

    if (application.jobId) {
      void fetchJob(application.jobId)
    } else {
      setJobData(null)
      setIsJobLoading(false)
    }
    const requests = jobRequests.current
    return () => requests.invalidate()
  }, [application.jobId, initialJob, fetchJob])

  // Formatted CV Embed URL with parameters for PDF viewers
  const cvEmbedUrl = useMemo(() => {
    if (!cvData?.url) return ''
    const isPdf =
      cvData.mimeType?.includes('pdf') ||
      cvData.fileName?.toLowerCase().endsWith('.pdf') ||
      cvData.url.toLowerCase().includes('.pdf')

    if (isPdf) {
      const baseUrl = cvData.url.split('#')[0]
      if (pdfSearchQuery) {
        return `${baseUrl}#search="${encodeURIComponent(pdfSearchQuery)}"`
      }
      return `${baseUrl}#toolbar=1&navpanes=0&view=FitH`
    }
    return cvData.url
  }, [cvData, pdfSearchQuery])

  // Parse job requirements into list items
  const parsedRequirements = useMemo(() => {
    return parseRequirements(jobData?.requirements)
  }, [jobData?.requirements])

  const reviewCopy = {
    vi: { title: 'Từ khóa để đối chiếu', occurrence: 'Có từ khóa trong nguồn', review: 'Cần đối chiếu', note: 'Từ khóa và đoạn truy xuất chỉ hỗ trợ đối chiếu, không xác nhận kỹ năng hoặc mức độ phù hợp.', search: 'Tìm trên PDF' },
    en: { title: 'Keywords to review', occurrence: 'Term occurs in source', review: 'Review required', note: 'Keywords and retrieved passages assist review; they do not verify skills or candidate fit.', search: 'Search PDF' },
    ja: { title: '確認用キーワード', occurrence: 'ソースに用語あり', review: '要確認', note: 'キーワードと検索された文章は確認の補助であり、スキルや適合性を保証しません。', search: 'PDF検索' },
  }[currentLocale]
  const skillsToReview = useMemo(() => (jobData?.skills ?? []).map(name => ({
    name,
    hasOccurrence: findSkillOccurrence(name, effectiveHrReview) || application.skills.some(term => term.trim().toLowerCase() === name.trim().toLowerCase()),
  })), [jobData?.skills, effectiveHrReview, application.skills])
  const searchSkills = skillsToReview.map(skill => skill.name)

  return (
    <div className={`recruiter-review-workspace ${className}`}>
      {/* Top Navigation Tabs */}
      <nav aria-label="Review workspace tabs" className="recruiter-review-workspace__nav">
        <button
          aria-selected={activeTab === 'cv'}
          className={`recruiter-review-workspace__tab ${activeTab === 'cv' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('cv')}
          role="tab"
          type="button"
        >
          <FileText size={16} />
          <span>Xem trước CV (CV Preview)</span>
          {cvData && <span className="recruiter-review-workspace__tab-badge">PDF</span>}
        </button>

        <button
          aria-selected={activeTab === 'criteria'}
          className={`recruiter-review-workspace__tab ${activeTab === 'criteria' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('criteria')}
          role="tab"
          type="button"
        >
          <ListChecks size={16} />
          <span>Tiêu chí tin tuyển dụng (Job Criteria)</span>
          <span className="recruiter-review-workspace__tab-badge">{skillsToReview.length}</span>
        </button>
      </nav>

      {/* Tab Panels */}
      <div className="recruiter-review-workspace__content">
        {/* ======================= TAB 1: CV PREVIEW ======================= */}
        <section
          aria-label="Xem trước CV"
          className={`recruiter-cv-workspace ${activeTab !== 'cv' ? 'recruiter-review-workspace__panel--hidden' : ''}`}
          role="tabpanel"
        >
          <details className="recruiter-cv-workspace__document-details">
            <summary>Tệp CV, trích dẫn và công cụ đối chiếu</summary>
          {/* Action Bar */}
            <div className="recruiter-cv-workspace__toolbar">
              <div className="recruiter-cv-workspace__file-meta">
                <FileText className="recruiter-cv-workspace__file-icon" size={18} />
                <div className="recruiter-cv-workspace__file-details">
                  <strong className="recruiter-cv-workspace__file-name" title={cvData?.fileName ?? application.cvFileName}>
                    {cvData?.fileName ?? application.cvFileName}
                  </strong>
                  <div className="recruiter-cv-workspace__file-tags">
                    <span className="recruiter-cv-workspace__badge">
                      {cvData ? formatFileSize(cvData.size) : 'Tệp đính kèm'}
                    </span>
                    <span className="recruiter-cv-workspace__badge recruiter-cv-workspace__badge--subtle">
                      {cvData?.mimeType?.split('/')[1]?.toUpperCase() ?? 'DOCUMENT'}
                    </span>
                  </div>
                </div>
              </div>

              {pdfSearchQuery && (
                <div className="recruiter-cv-workspace__search-pill">
                  <Search size={13} className="recruiter-cv-workspace__search-pill-icon" />
                  <span>Đang soi trên PDF: <strong>"{pdfSearchQuery}"</strong></span>
                  <button
                    type="button"
                    className="recruiter-cv-workspace__search-pill-clear"
                    onClick={() => setPdfSearchQuery(null)}
                    title="Bỏ tìm kiếm"
                  >
                    <X size={12} />
                  </button>
                  <button
                    type="button"
                    className="recruiter-cv-workspace__search-pill-back"
                    onClick={() => setActiveTab('criteria')}
                    title="Quay lại tab Tiêu chí"
                  >
                    <ArrowLeft size={12} />
                    <span>Xem tiêu chí</span>
                  </button>
                </div>
              )}

              <div className="recruiter-cv-workspace__actions">
                <button
                  aria-label="Tải lại bản xem trước"
                  className="recruiter-cv-workspace__action-btn"
                  disabled={isCvLoading}
                  onClick={() => void fetchCv(application.id)}
                  title="Tải lại bản xem trước"
                  type="button"
                >
                  <RefreshCw className={isCvLoading ? 'is-spinning' : ''} size={15} />
                  <span>Tải lại</span>
                </button>

                {cvData?.url && (
                  <>
                    <a
                      className="recruiter-cv-workspace__action-btn recruiter-cv-workspace__action-btn--primary"
                      href={cvData.url}
                      rel="noreferrer"
                      target="_blank"
                      title="Mở tài liệu trong tab mới"
                    >
                      <ExternalLink size={15} />
                      <span>Mở tab mới</span>
                    </a>

                    <a
                      className="recruiter-cv-workspace__action-btn"
                      download={cvData.fileName}
                      href={cvData.url}
                      title="Tải xuống tệp CV"
                    >
                      <Download size={15} />
                      <span>Tải về</span>
                    </a>
                  </>
                )}

                {!cvData?.url && onOpenResumeExternal && (
                  <button
                    className="recruiter-cv-workspace__action-btn"
                    onClick={onOpenResumeExternal}
                    type="button"
                  >
                    <ExternalLink size={15} />
                    <span>Mở CV gốc</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Skills Highlight Chips Bar */}
            {searchSkills.length > 0 && (
              <div className="recruiter-cv-workspace__skills-bar">
                <div className="recruiter-cv-workspace__skills-bar-label">
                  <Sparkles size={13} className="recruiter-cv-workspace__skills-bar-icon" />
                  <span>{reviewCopy.title} ({searchSkills.length}):</span>
                </div>
                <div className="recruiter-cv-workspace__skills-bar-chips">
                  <button
                    type="button"
                    className={`recruiter-cv-workspace__skill-chip ${!selectedSkillHighlight && !pdfSearchQuery ? 'is-active' : ''}`}
                    onClick={() => {
                      setSelectedSkillHighlight(null)
                      setPdfSearchQuery(null)
                      setActiveSnippet(null)
                    }}
                    title={reviewCopy.search}
                  >
                    <span>Tất cả ({searchSkills.length})</span>
                  </button>
                  {searchSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      className={`recruiter-cv-workspace__skill-chip ${selectedSkillHighlight?.toLowerCase() === skill.toLowerCase() ? 'is-active' : ''}`}
                      onClick={() => {
                        setSelectedSkillHighlight(skill)
                        handleJumpToPdf(skill)
                      }}
                      title={`Định vị và bôi vàng "${skill}" trên trang CV`}
                    >
                      <span>✓ {skill}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Live Evidence Highlight Callout Box (Cách 2: Smart Clipboard & Live Evidence Highlight) */}
            {activeSnippet && (
              <details className="recruiter-cv-workspace__evidence-callout">
                <summary>Đoạn đang đối chiếu · Xem toàn bộ trích dẫn và nguồn</summary>
                <div className="recruiter-cv-workspace__evidence-callout-header">
                  <div className="recruiter-cv-workspace__evidence-callout-title">
                    <Sparkles size={14} className="recruiter-cv-workspace__evidence-callout-icon" />
                    <span>Bằng chứng trích xuất từ CV: <strong>"{activeSnippet.phrase}"</strong></span>
                    {activeSnippet.source && (
                      <span className="recruiter-cv-workspace__evidence-source-tag">
                        {activeSnippet.source}
                      </span>
                    )}
                  </div>

                  <div className="recruiter-cv-workspace__evidence-callout-actions">
                    <button
                      type="button"
                      className="recruiter-cv-workspace__copy-btn"
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
                          navigator.clipboard.writeText(activeSnippet.phrase).then(() => {
                            setCopiedNotification(true)
                            setTimeout(() => setCopiedNotification(false), 3000)
                          }).catch(() => {})
                        }
                      }}
                      title="Sao chép lại từ khóa vào clipboard"
                    >
                      <Copy size={12} />
                      <span>{copiedNotification ? 'Đã sao chép!' : 'Copy lại từ khóa'}</span>
                    </button>
                    <button
                      type="button"
                      className="recruiter-cv-workspace__evidence-close-btn"
                      onClick={() => {
                        setActiveSnippet(null)
                        setPdfSearchQuery(null)
                      }}
                      title="Đóng bảng trích dẫn"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>

                {activeSnippet.snippetText && (
                  <blockquote className="recruiter-cv-workspace__evidence-quote-box">
                    {renderHighlightedSnippet(activeSnippet.snippetText, activeSnippet.phrase)}
                  </blockquote>
                )}

                <div className="recruiter-cv-workspace__evidence-guidance">
                  <span className="recruiter-cv-workspace__guidance-badge">
                    Tìm nguyên văn trên PDF
                  </span>
                  <span>
                    Kết quả tìm và highlight được hiển thị trong khung PDF bên dưới. Không tìm thấy nguyên văn không có nghĩa ứng viên thiếu năng lực.
                  </span>
                </div>
              </details>
            )}

          </details>
            {/* Document Viewer Frame / States */}
            <div className="recruiter-cv-workspace__viewport">
              {isCvLoading && (
                <div className="recruiter-cv-workspace__state recruiter-cv-workspace__state--loading">
                  <div className="recruiter-cv-workspace__spinner" />
                  <p>Đang tải bản xem trước hồ sơ CV...</p>
                  <span>Hệ thống đang chuẩn bị tài liệu xem trước cho bạn</span>
                </div>
              )}

              {!isCvLoading && cvError && (
                <div className="recruiter-cv-workspace__state recruiter-cv-workspace__state--error">
                  <AlertCircle className="recruiter-cv-workspace__state-icon" size={36} />
                  <h3>Không thể tải xem trước CV</h3>
                  <p>{cvError}</p>
                  <div className="recruiter-cv-workspace__state-actions">
                    <button
                      className="recruiter-cv-workspace__action-btn recruiter-cv-workspace__action-btn--primary"
                      onClick={() => void fetchCv(application.id)}
                      type="button"
                    >
                      <RefreshCw size={15} />
                      <span>Thử lại</span>
                    </button>
                    {onOpenResumeExternal && (
                      <button
                        className="recruiter-cv-workspace__action-btn"
                        onClick={onOpenResumeExternal}
                        type="button"
                      >
                        <ExternalLink size={15} />
                        <span>Mở liên kết trực tiếp</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {!isCvLoading && !cvError && cvData?.url && (
                useIframeFallback ? (
                  <div className="recruiter-cv-workspace__frame-wrapper">
                    {!isIframeLoaded && !hasIframeError && (
                      <div className="recruiter-cv-workspace__frame-loading">
                        <div className="recruiter-cv-workspace__spinner" />
                        <span>Đang kết xuất tài liệu PDF...</span>
                      </div>
                    )}

                    {hasIframeError ? (
                      <div className="recruiter-cv-workspace__state recruiter-cv-workspace__state--fallback">
                        <AlertTriangle className="recruiter-cv-workspace__state-icon" size={36} />
                        <h3>Trình duyệt chưa hỗ trợ hiển thị trực tiếp</h3>
                        <p>
                          Tệp tin này có thể bị hạn chế quyền hiển thị trực tiếp trong iframe. Bạn có thể mở trong
                          tab mới hoặc tải xuống để xem chi tiết.
                        </p>
                        <div className="recruiter-cv-workspace__state-actions">
                          <a
                            className="recruiter-cv-workspace__action-btn recruiter-cv-workspace__action-btn--primary"
                            href={cvData?.url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            <ExternalLink size={15} />
                            <span>Mở trong tab mới</span>
                          </a>
                          <a
                            className="recruiter-cv-workspace__action-btn"
                            download={cvData?.fileName}
                            href={cvData?.url}
                          >
                            <Download size={15} />
                            <span>Tải xuống CV</span>
                          </a>
                        </div>
                      </div>
                    ) : (
                      <iframe
                        key={`${cvData?.url ?? 'cv'}-${pdfSearchQuery || 'default'}`}
                        className="recruiter-cv-workspace__iframe"
                        onError={() => setHasIframeError(true)}
                        onLoad={() => setIsIframeLoaded(true)}
                        src={cvEmbedUrl}
                        title={`Bản xem trước CV: ${application.candidateName}`}
                      />
                    )}
                  </div>
                ) : (
                  <PdfCvViewer
                    url={cvData.url}
                    fileName={cvData.fileName}
                    searchQuery={pdfSearchQuery}
                    searchRequestId={searchRequestId}
                    sourceSection={activeSnippet?.sourceSection}
                    pageHint={activeSnippet?.pageNumber}
                    occurrenceHint={activeSnippet?.occurrence}
                    searchTerms={searchSkills}
                    activeHighlightTerm={selectedSkillHighlight}
                    snippetText={activeSnippet?.snippetText}
                    onClearSearch={() => {
                      setPdfSearchQuery(null)
                      setSelectedSkillHighlight(null)
                      setActiveSnippet(null)
                    }}
                    onFallbackToIframe={() => setUseIframeFallback(true)}
                  />
                )
              )}
            </div>
          </section>

        {/* ======================= TAB 2: JOB CRITERIA ======================= */}
        <section
          aria-label="Tiêu chí tin tuyển dụng"
          className={`recruiter-criteria-workspace ${activeTab !== 'criteria' ? 'recruiter-review-workspace__panel--hidden' : ''}`}
          role="tabpanel"
        >
          {isJobLoading && (
              <div className="recruiter-criteria-workspace__loading">
                <div className="recruiter-cv-workspace__spinner" />
                <p>Đang tải thông tin tiêu chí tuyển dụng...</p>
              </div>
            )}

            {!isJobLoading && jobError && (
              <div className="recruiter-criteria-workspace__error">
                <AlertCircle size={32} />
                <div>
                  <h4>Chưa tải được tiêu chí tin tuyển dụng</h4>
                  <p>{jobError}</p>
                </div>
                <button
                  className="recruiter-cv-workspace__action-btn"
                  onClick={() => application.jobId && void fetchJob(application.jobId)}
                  type="button"
                >
                  <RefreshCw size={14} />
                  <span>Thử lại</span>
                </button>
              </div>
            )}

            {!isJobLoading && !jobError && jobData && (
              <div className="recruiter-criteria-workspace__body">
                <p className="ai1-evidence__notice">{reviewCopy.note}</p>

                {/* Job Hero Card */}
                <div className="recruiter-criteria-card recruiter-criteria-card--hero">
                  <div className="recruiter-criteria-card__header-main">
                    <span className="recruiter-criteria-badge-tag">Mục tiêu tuyển dụng</span>
                    <h3 className="recruiter-criteria-card__title">{jobData.title}</h3>
                    <div className="recruiter-criteria-card__meta-row">
                      {jobData.companyName && (
                        <span>
                          <Building2 size={14} />
                          {jobData.companyName}
                        </span>
                      )}
                      {jobData.location && (
                        <span>
                          <MapPin size={14} />
                          {jobData.location}
                        </span>
                      )}
                      <span>
                        <Calendar size={14} />
                        {jobData.deadline ? `Hạn nộp: ${jobData.deadline}` : 'Đang mở nhận hồ sơ'}
                      </span>
                    </div>
                  </div>

                  <div className="recruiter-criteria-specs-grid">
                    <div className="recruiter-criteria-spec-item">
                      <span className="recruiter-criteria-spec-item__label">
                        <Briefcase size={14} /> Hình thức làm việc
                      </span>
                      <strong className="recruiter-criteria-spec-item__value">
                        {jobData.workingType ? WORKING_TYPE_LABELS[jobData.workingType] : 'Chưa quy định'}
                      </strong>
                    </div>

                    <div className="recruiter-criteria-spec-item">
                      <span className="recruiter-criteria-spec-item__label">
                        <Clock size={14} /> Loại hợp đồng
                      </span>
                      <strong className="recruiter-criteria-spec-item__value">
                        {jobData.employmentType ? EMPLOYMENT_TYPE_LABELS[jobData.employmentType] : 'Toàn thời gian'}
                      </strong>
                    </div>

                    <div className="recruiter-criteria-spec-item">
                      <span className="recruiter-criteria-spec-item__label">
                        <UserCheck size={14} /> Cấp bậc yêu cầu
                      </span>
                      <strong className="recruiter-criteria-spec-item__value">
                        {jobData.experienceLevel ? EXPERIENCE_LEVEL_LABELS[jobData.experienceLevel] : 'Mọi cấp bậc'}
                      </strong>
                    </div>

                    <div className="recruiter-criteria-spec-item">
                      <span className="recruiter-criteria-spec-item__label">
                        <DollarSign size={14} /> Dải lương vị trí
                      </span>
                      <strong className="recruiter-criteria-spec-item__value recruiter-criteria-spec-item__value--highlight">
                        {formatJobSalary(jobData)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Candidate Cross-Check Matrix */}
                <div className="recruiter-criteria-card">
                  <div className="recruiter-criteria-card__heading">
                    <Sparkles className="recruiter-criteria-card__icon" size={18} />
                    <div>
                      <h4>Đối chiếu hồ sơ ứng viên</h4>
                      <p>So sánh nhanh thông số ứng viên với điều kiện tin tuyển dụng</p>
                    </div>
                  </div>

                  <div className="recruiter-criteria-matrix">
                    <div className="recruiter-criteria-matrix__row">
                      <div className="recruiter-criteria-matrix__col">
                        <span className="recruiter-criteria-matrix__label">Yêu cầu vị trí</span>
                        <strong>{jobData.experienceLevel ? EXPERIENCE_LEVEL_LABELS[jobData.experienceLevel] : 'Linh hoạt'}</strong>
                      </div>
                      <div className="recruiter-criteria-matrix__vs">Kinh nghiệm</div>
                      <div className="recruiter-criteria-matrix__col recruiter-criteria-matrix__col--candidate">
                        <span className="recruiter-criteria-matrix__label">Hồ sơ ứng viên</span>
                        <strong>
                          {application.experience && !application.experience.includes('Chưa')
                            ? application.experience
                            : 'Xem chi tiết trong CV'}
                        </strong>
                      </div>
                    </div>

                    <div className="recruiter-criteria-matrix__row">
                      <div className="recruiter-criteria-matrix__col">
                        <span className="recruiter-criteria-matrix__label">Khung ngân sách</span>
                        <strong>{formatJobSalary(jobData)}</strong>
                      </div>
                      <div className="recruiter-criteria-matrix__vs">Mức lương</div>
                      <div className="recruiter-criteria-matrix__col recruiter-criteria-matrix__col--candidate">
                        <span className="recruiter-criteria-matrix__label">Kỳ vọng ứng viên</span>
                        <strong>
                          {application.expectedSalary && !application.expectedSalary.includes('Chưa')
                            ? application.expectedSalary
                            : 'Thỏa thuận theo năng lực'}
                        </strong>
                      </div>
                    </div>

                    <div className="recruiter-criteria-matrix__row">
                      <div className="recruiter-criteria-matrix__col">
                        <span className="recruiter-criteria-matrix__label">Địa điểm làm việc</span>
                        <strong>{jobData.location || 'Tại công ty'}</strong>
                      </div>
                      <div className="recruiter-criteria-matrix__vs">Địa điểm</div>
                      <div className="recruiter-criteria-matrix__col recruiter-criteria-matrix__col--candidate">
                        <span className="recruiter-criteria-matrix__label">Nơi cư trú ứng viên</span>
                        <strong>
                          {application.candidateLocation && !application.candidateLocation.includes('Chưa')
                            ? application.candidateLocation
                            : (jobData.location ? `Linh hoạt / ${jobData.location}` : 'Xem chi tiết trong CV')}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desired Skills Matching Matrix */}
                <div className="recruiter-criteria-card">
                  <div className="recruiter-criteria-card__heading">
                    <Search className="recruiter-criteria-card__icon" size={18} />
                    <div>
                      <h4>{reviewCopy.title} ({skillsToReview.length})</h4>
                      <p>{reviewCopy.note}</p>
                    </div>
                  </div>

                  {skillsToReview.length > 0 ? (
                    <div className="recruiter-criteria-skills-list">
                      {skillsToReview.map((skill) => (
                        <div className="recruiter-criteria-skill-pill" key={skill.name}>
                          <Search className="recruiter-criteria-skill-pill__icon" size={14} />
                          <span className="recruiter-criteria-skill-pill__name">{skill.name}</span>
                          <span className="recruiter-criteria-skill-pill__status">
                            {skill.hasOccurrence ? reviewCopy.occurrence : reviewCopy.review}
                          </span>
                          <button type="button" className="recruiter-criteria-skill-pill__soi-btn" onClick={() => handleJumpToPdf(skill.name)} title={reviewCopy.search}>
                            <Search size={11} />
                            <span>{reviewCopy.search}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="recruiter-criteria-card__empty">Chưa thiết lập danh sách kỹ năng cho tin này.</p>
                  )}
                </div>

                {/* AI1 Evidence Verification Section */}
                {effectiveHrReview && (
                  <div className="recruiter-criteria-card recruiter-criteria-card--ai1-section">
                    <Ai1EvidenceView
                      state={{ status: 'loaded', review: effectiveHrReview }}
                      copy={copy}
                      isMatching={false}
                      onRefresh={() => {}}
                      onJumpToPdf={handleJumpToPdf}
                    />
                  </div>
                )}

                {/* Core Requirements */}
                <div className="recruiter-criteria-card">
                  <div className="recruiter-criteria-card__heading">
                    <ListChecks className="recruiter-criteria-card__icon" size={18} />
                    <div>
                      <h4>Yêu cầu bắt buộc (Core Requirements)</h4>
                      <p>Các tiêu chuẩn tối thiểu cần đạt để bước tiếp vào vòng phỏng vấn</p>
                    </div>
                  </div>

                  {parsedRequirements.length > 0 ? (
                    <ul className="recruiter-criteria-requirements-list">
                      {parsedRequirements.map((req, index) => (
                        <li className="recruiter-criteria-requirement-item" key={index}>
                          <span className="recruiter-criteria-requirement-bullet" />
                          <p>{req}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="recruiter-criteria-card__empty">
                      {jobData.requirements || 'Chưa cập nhật chi tiết yêu cầu công việc.'}
                    </p>
                  )}
                </div>

                {/* Job Description (Summary) */}
                {jobData.description && (
                  <div className="recruiter-criteria-card">
                    <div className="recruiter-criteria-card__heading">
                      <Briefcase className="recruiter-criteria-card__icon" size={18} />
                      <div>
                        <h4>Mô tả công việc tóm tắt</h4>
                        <p>Trách nhiệm chính của vị trí tuyển dụng</p>
                      </div>
                    </div>
                    <div className="recruiter-criteria-description-box">
                      {jobData.description.split(/\r?\n+/).map((line, index) => {
                        const trimmed = line.trim()
                        if (!trimmed) return null
                        return <p key={index}>{trimmed}</p>
                      })}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {jobData.benefits && (
                  <div className="recruiter-criteria-card">
                    <div className="recruiter-criteria-card__heading">
                      <Sparkles className="recruiter-criteria-card__icon" size={18} />
                      <div>
                        <h4>Quyền lợi ứng viên được hưởng</h4>
                        <p>Chế độ đãi ngộ để trao đổi trong buổi phỏng vấn</p>
                      </div>
                    </div>
                    <div className="recruiter-criteria-description-box">
                      {jobData.benefits.split(/\r?\n+/).map((line, index) => {
                        const trimmed = line.trim()
                        if (!trimmed) return null
                        return <p key={index}>{trimmed}</p>
                      })}
                    </div>
                  </div>
                )}

                {/* Recruiter Evaluation Guidance / Checklist */}
                <div className="recruiter-criteria-card recruiter-criteria-card--tips">
                  <h4>Checklist đánh giá cho Nhà tuyển dụng</h4>
                  <ul className="recruiter-criteria-tips-list">
                    <li>
                      <strong>1. Đối chiếu kỹ năng:</strong> Kiểm tra xem các kỹ năng bắt buộc đã được ứng viên áp dụng vào dự án thực tế nào chưa.
                    </li>
                    <li>
                      <strong>2. Xác minh kinh nghiệm:</strong> Đảm bảo thời gian công tác và vai trò thể hiện trong CV tương xứng với cấp bậc vị trí.
                    </li>
                    <li>
                      <strong>3. Điều kiện làm việc:</strong> Lưu ý hình thức làm việc ({jobData.workingType ? WORKING_TYPE_LABELS[jobData.workingType] : 'mặc định'}) và mức lương kỳ vọng.
                    </li>
                    <li>
                      <strong>4. Điền phản hồi:</strong> Ghi lại nhận xét chi tiết vào biểu mẫu đánh giá trước khi đưa ra quyết định (Offer / Reject).
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {!isJobLoading && !jobError && !jobData && (
              <div className="recruiter-criteria-workspace__empty">
                <AlertCircle size={32} />
                <p>Không tìm thấy thông tin tin tuyển dụng liên kết cho đơn này.</p>
              </div>
            )}
          </section>
      </div>
    </div>
  )
}
