import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  FileText,
  ListChecks,
  MapPin,
  RefreshCw,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react'
import { getApiErrorEnvelope } from '../../../lib/api/apiError'
import { applicationService } from '../../../services/application.service'
import { jobService } from '../../../services/job.service'
import type { ApplicationCvDownloadResponse } from '../../../types/application.types'
import { parseHrReviewEnvelope, type HrReview } from '../../../types/hr-review.types'
import type {
  JobExperienceLevel,
  JobType,
  JobWorkingType,
  RecruiterJobResponse,
} from '../../../types/job.types'
import type { RecruiterApplicationItem } from '../types'

export type ApplicationReviewWorkspaceProps = {
  application: RecruiterApplicationItem
  className?: string
  hrReview?: HrReview | null
  initialTab?: 'cv' | 'criteria'
  job?: RecruiterJobResponse | null
  onOpenResumeExternal?: () => void
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

function isShortSkillQuery(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  const words = trimmed.split(/\s+/)
  return words.length <= 4 && trimmed.length <= 40 && !/[.;\n]/.test(trimmed)
}

function passageRelatesToSkill(passageText: string, reqText: string): boolean {
  const normPassage = passageText.toLowerCase()
  const normReq = reqText.trim().toLowerCase()
  if (normPassage.includes(normReq)) return true
  const strip = (s: string) => s.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  const cleanPassage = strip(normPassage)
  const cleanReq = strip(normReq)
  if (cleanPassage.includes(cleanReq)) return true
  const reqWords = cleanReq.split(' ').filter((w) => w.length > 2)
  if (reqWords.length > 0 && reqWords.some((w) => cleanPassage.includes(w))) {
    return true
  }
  return false
}

export function checkAi1SkillMatch(
  skillName: string,
  hrReview: HrReview | null | undefined,
): { isMatched: boolean; score?: number } {
  if (!hrReview?.requirements || hrReview.requirements.length === 0) {
    return { isMatched: false }
  }

  const sLower = skillName.trim().toLowerCase()
  const sClean = sLower.replace(/[^a-z0-9+#]/g, '')
  if (!sClean) return { isMatched: false }

  let bestScore = 0
  let matched = false

  for (const req of hrReview.requirements) {
    const reqTextLower = req.text.trim().toLowerCase()
    const reqTextClean = reqTextLower.replace(/[^a-z0-9+#]/g, '')

    const isReqForSkill =
      reqTextLower === sLower ||
      reqTextClean === sClean ||
      (req.requirementId.startsWith('skills/') && (reqTextLower.includes(sLower) || sLower.includes(reqTextLower))) ||
      (isShortSkillQuery(req.text) && (reqTextLower.includes(sLower) || sLower.includes(reqTextLower)))

    if (req.evidence) {
      for (const ev of req.evidence) {
        const evTextLower = ev.text.trim().toLowerCase()
        const evTextClean = evTextLower.replace(/[^a-z0-9+#]/g, '')
        const isExact = evTextLower === sLower || evTextClean === sClean

        if (isReqForSkill) {
          if (isExact || (ev.similarityScore >= 70 && passageRelatesToSkill(ev.text, skillName))) {
            matched = true
            bestScore = Math.max(bestScore, ev.similarityScore)
          }
        } else {
          if (isExact) {
            matched = true
            bestScore = Math.max(bestScore, ev.similarityScore)
          } else if (ev.similarityScore >= 70 && passageRelatesToSkill(ev.text, skillName)) {
            matched = true
            bestScore = Math.max(bestScore, ev.similarityScore)
          }
        }
      }
    }

    if (req.components) {
      for (const comp of req.components) {
        const compTextLower = comp.text.trim().toLowerCase()
        const compTextClean = compTextLower.replace(/[^a-z0-9+#]/g, '')
        const isCompForSkill =
          compTextLower === sLower ||
          compTextClean === sClean ||
          (isShortSkillQuery(comp.text) && (compTextLower.includes(sLower) || sLower.includes(compTextLower)))

        if (comp.evidence) {
          for (const ev of comp.evidence) {
            const evTextLower = ev.text.trim().toLowerCase()
            const evTextClean = evTextLower.replace(/[^a-z0-9+#]/g, '')
            const isExact = evTextLower === sLower || evTextClean === sClean

            if (isCompForSkill || isReqForSkill) {
              if (isExact || (ev.similarityScore >= 70 && passageRelatesToSkill(ev.text, skillName))) {
                matched = true
                bestScore = Math.max(bestScore, ev.similarityScore)
              }
            } else if (isExact || (ev.similarityScore >= 70 && passageRelatesToSkill(ev.text, skillName))) {
              matched = true
              bestScore = Math.max(bestScore, ev.similarityScore)
            }
          }
        }
      }
    }
  }

  // Also check all candidate parsed CV skills across all evidence
  for (const req of hrReview.requirements) {
    const allEvidence = [
      ...(req.evidence || []),
      ...(req.components?.flatMap((c) => c.evidence || []) || []),
    ]
    for (const ev of allEvidence) {
      const isSkillSource =
        ev.source.toLowerCase() === 'skill' ||
        ev.source.toLowerCase() === 'skills' ||
        ev.evidenceId.startsWith('skills/') ||
        ev.evidenceId.startsWith('skill')

      if (isSkillSource && ev.text) {
        const evSkillLower = ev.text.trim().toLowerCase()
        const evSkillClean = evSkillLower.replace(/[^a-z0-9+#]/g, '')

        if (
          evSkillLower === sLower ||
          evSkillClean === sClean ||
          evSkillLower.includes(sLower) ||
          sLower.includes(evSkillLower)
        ) {
          matched = true
          bestScore = Math.max(bestScore, ev.similarityScore || 100)
        }
      }
    }
  }

  return {
    isMatched: matched,
    score: matched ? (bestScore > 0 ? bestScore : 100) : undefined,
  }
}

export function ApplicationReviewWorkspace({
  application,
  className = '',
  hrReview: propHrReview,
  initialTab = 'cv',
  job: initialJob = null,
  onOpenResumeExternal,
}: ApplicationReviewWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'cv' | 'criteria'>(initialTab)

  // CV Preview State
  const [cvData, setCvData] = useState<ApplicationCvDownloadResponse | null>(null)
  const [isCvLoading, setIsCvLoading] = useState<boolean>(true)
  const [cvError, setCvError] = useState<string | null>(null)
  const [isIframeLoaded, setIsIframeLoaded] = useState<boolean>(false)
  const [hasIframeError, setHasIframeError] = useState<boolean>(false)

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

  // Fetch CV data when application changes
  const fetchCv = useCallback(async (appId: string) => {
    setIsCvLoading(true)
    setCvError(null)
    setIsIframeLoaded(false)
    setHasIframeError(false)

    try {
      const data = await applicationService.getRecruiterApplicationCv(appId)
      setCvData(data)
    } catch (error) {
      const message = getApiErrorEnvelope(error)?.error.message ?? 'Không thể tải bản xem trước CV của ứng viên.'
      setCvError(message)
    } finally {
      setIsCvLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCv(application.id)
  }, [application.id, fetchCv])

  // Fetch Job details when application.jobId changes
  const fetchJob = useCallback(async (jobId: string) => {
    if (!jobId) {
      setJobData(null)
      setIsJobLoading(false)
      return
    }

    setIsJobLoading(true)
    setJobError(null)

    try {
      const data = await jobService.getRecruiterJobById(jobId)
      setJobData(data)
    } catch (error) {
      const message = getApiErrorEnvelope(error)?.error.message ?? 'Không thể tải thông tin tiêu chí tin tuyển dụng.'
      setJobError(message)
    } finally {
      setIsJobLoading(false)
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
  }, [application.jobId, initialJob, fetchJob])

  // Formatted CV Embed URL with parameters for PDF viewers
  const cvEmbedUrl = useMemo(() => {
    if (!cvData?.url) return ''
    const isPdf =
      cvData.mimeType?.includes('pdf') ||
      cvData.fileName?.toLowerCase().endsWith('.pdf') ||
      cvData.url.toLowerCase().includes('.pdf')

    if (isPdf && !cvData.url.includes('#')) {
      return `${cvData.url}#toolbar=1&navpanes=0&view=FitH`
    }
    return cvData.url
  }, [cvData])

  // Parse job requirements into list items
  const parsedRequirements = useMemo(() => {
    return parseRequirements(jobData?.requirements)
  }, [jobData?.requirements])

  // Calculate matching skills between candidate and job criteria
  const skillMatchAnalysis = useMemo(() => {
    if (!jobData?.skills || jobData.skills.length === 0) {
      return {
        matchedCount: 0,
        totalRequired: 0,
        skillsWithMatchStatus: [] as Array<{
          name: string
          isMatched: boolean
          statusLabel: string
          score?: number
          isAiMatched?: boolean
        }>,
      }
    }

    const candidateSkillsLower = new Set(
      application.skills.map((s) => s.trim().toLowerCase()),
    )
    const matchSkillsLower = new Set(
      application.matchMatchedSkills.map((s) => s.trim().toLowerCase()),
    )

    const skillsWithMatchStatus = jobData.skills.map((skill) => {
      const skillLower = skill.trim().toLowerCase()
      const aiMatch = checkAi1SkillMatch(skill, effectiveHrReview)

      const isProfileMatched =
        candidateSkillsLower.has(skillLower) ||
        matchSkillsLower.has(skillLower) ||
        application.skills.some((s) => {
          const sLow = s.toLowerCase()
          return sLow.includes(skillLower) || skillLower.includes(sLow)
        })

      const isMatched = aiMatch.isMatched || isProfileMatched
      let statusLabel = 'Chưa thấy'
      if (aiMatch.isMatched) {
        statusLabel = 'Đã tìm thấy trên CV'
      } else if (isProfileMatched) {
        statusLabel = 'Khớp hồ sơ'
      }

      return {
        name: skill,
        isMatched,
        statusLabel,
        score: aiMatch.score,
        isAiMatched: aiMatch.isMatched,
      }
    })

    const matchedCount = skillsWithMatchStatus.filter((s) => s.isMatched).length

    return {
      matchedCount,
      totalRequired: jobData.skills.length,
      skillsWithMatchStatus,
    }
  }, [jobData?.skills, application.skills, application.matchMatchedSkills, effectiveHrReview])

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
          {skillMatchAnalysis.totalRequired > 0 && (
            <span
              className={`recruiter-review-workspace__tab-badge ${
                skillMatchAnalysis.matchedCount > 0
                  ? 'recruiter-review-workspace__tab-badge--match'
                  : ''
              }`}
            >
              {skillMatchAnalysis.matchedCount}/{skillMatchAnalysis.totalRequired} Kỹ năng
            </span>
          )}
        </button>
      </nav>

      {/* Tab Panels */}
      <div className="recruiter-review-workspace__content">
        {/* ======================= TAB 1: CV PREVIEW ======================= */}
        {activeTab === 'cv' && (
          <section
            aria-label="Xem trước CV"
            className="recruiter-cv-workspace"
            role="tabpanel"
          >
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

              {!isCvLoading && !cvError && cvEmbedUrl && (
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
                      className="recruiter-cv-workspace__iframe"
                      onError={() => setHasIframeError(true)}
                      onLoad={() => setIsIframeLoaded(true)}
                      src={cvEmbedUrl}
                      title={`Bản xem trước CV: ${application.candidateName}`}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Bottom helper footnote */}
            <footer className="recruiter-cv-workspace__footer">
              <span>Mẹo: Bạn có thể vừa xem CV vừa ghi chú và đưa ra quyết định ở cột đánh giá bên cạnh.</span>
              {cvData?.url && (
                <a
                  className="recruiter-cv-workspace__footer-link"
                  href={cvData.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Gặp sự cố hiển thị? Mở tab mới
                </a>
              )}
            </footer>
          </section>
        )}

        {/* ======================= TAB 2: JOB CRITERIA ======================= */}
        {activeTab === 'criteria' && (
          <section
            aria-label="Tiêu chí tin tuyển dụng"
            className="recruiter-criteria-workspace"
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
                        <strong>{application.experience || 'Chưa cung cấp'}</strong>
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
                        <strong>{application.expectedSalary || 'Thỏa thuận'}</strong>
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
                        <strong>{application.candidateLocation || 'Chưa rõ'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desired Skills Matching Matrix */}
                <div className="recruiter-criteria-card">
                  <div className="recruiter-criteria-card__heading">
                    <CheckCircle2 className="recruiter-criteria-card__icon recruiter-criteria-card__icon--success" size={18} />
                    <div>
                      <h4>Kỹ năng mong muốn ({skillMatchAnalysis.matchedCount}/{skillMatchAnalysis.totalRequired} khớp)</h4>
                      <p>Danh sách kỹ năng đối chiếu từ CV ứng viên và đánh giá AI1</p>
                    </div>
                  </div>

                  {skillMatchAnalysis.skillsWithMatchStatus.length > 0 ? (
                    <div className="recruiter-criteria-skills-list">
                      {skillMatchAnalysis.skillsWithMatchStatus.map((skill) => (
                        <div
                          className={`recruiter-criteria-skill-pill ${
                            skill.isMatched ? 'is-matched' : 'is-unmatched'
                          }`}
                          key={skill.name}
                          title={skill.score ? `Độ khớp AI1: ${Math.round(skill.score)}%` : undefined}
                        >
                          {skill.isMatched ? (
                            <CheckCircle2 className="recruiter-criteria-skill-pill__icon" size={14} />
                          ) : (
                            <XCircle className="recruiter-criteria-skill-pill__icon" size={14} />
                          )}
                          <span className="recruiter-criteria-skill-pill__name">{skill.name}</span>
                          <span className="recruiter-criteria-skill-pill__status">
                            {skill.statusLabel}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="recruiter-criteria-card__empty">Chưa thiết lập danh sách kỹ năng cho tin này.</p>
                  )}
                </div>

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
        )}
      </div>
    </div>
  )
}
