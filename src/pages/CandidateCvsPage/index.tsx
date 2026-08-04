import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  ExternalLink,
  FileText,
  FolderOpen,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../context'
import { useLocale, useTranslations } from '../../i18n'
import type { CandidateCvsTab } from '../../i18n/types'
import { getApiErrorEnvelope } from '../../lib/api/apiError'
import { applicationService } from '../../services/application.service'
import { candidateService } from '../../services/candidate.service'
import { cvTemplateService } from '../../services/cvTemplate.service'
import type { CvTemplateResponse } from '../../services/cvTemplate.service'
import type { ApplicationResponse } from '../../types/application.types'
import type { CandidateCvResponse } from '../../types/candidate.types'
import { useCanvasStore } from '../CvBuilderPage/canvas/store/useCanvasStore'
import { Button } from '../_components'
import './candidate-cvs.css'

const CV_MAX_SIZE_BYTES = 10 * 1024 * 1024
const CV_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])
const CV_TABS: CandidateCvsTab[] = ['editing', 'submitted', 'profile']

function isSupportedCvFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const hasSupportedExtension = extension === 'pdf' || extension === 'doc' || extension === 'docx'

  return CV_MIME_TYPES.has(file.type) || hasSupportedExtension
}

function formatCountLabel(template: string, count: number) {
  return template.replace('{{count}}', String(count))
}

function formatDate(value: string | null | undefined, locale: string, fallback: string) {
  if (!value) return fallback

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatFileSize(bytes: number, fallback: string) {
  if (!Number.isFinite(bytes) || bytes <= 0) return fallback

  if (bytes < 1024) return `${bytes} B`

  const kiloBytes = bytes / 1024
  if (kiloBytes < 1024) return `${kiloBytes.toFixed(1)} KB`

  return `${(kiloBytes / 1024).toFixed(1)} MB`
}

function sortByUpdatedAt<T extends { updatedAt: string }>(items: T[]) {
  return [...items].sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
}

function sortApplications(items: ApplicationResponse[]) {
  return [...items].sort(
    (left, right) => new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime(),
  )
}

function getCvTitle(cv: CandidateCvResponse, fallback: string) {
  return cv.title?.trim() || fallback
}

function hasCanvasContent(template: CvTemplateResponse) {
  return template.canvas.pages.some((page) => page.elements.length > 0)
}

export function CandidateCvsPage() {
  const { locale } = useLocale()
  const { pages } = useTranslations()
  const content = pages.candidateCvs
  const toast = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const uploadInputRef = useRef<HTMLInputElement | null>(null)
  const [activeTab, setActiveTab] = useState<CandidateCvsTab>('editing')
  const [renamingDraftId, setRenamingDraftId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [pendingDraftDeleteId, setPendingDraftDeleteId] = useState<string | null>(null)
  const [pendingProfileDeleteId, setPendingProfileDeleteId] = useState<string | null>(null)
  const currentDocument = useCanvasStore((state) => state.document)
  const currentServerId = useCanvasStore((state) => state.serverId)
  const loadCanvasDocument = useCanvasStore((state) => state.loadDocument)
  const newCanvasDocument = useCanvasStore((state) => state.newDocument)

  const profileQuery = useQuery({
    queryKey: ['candidate-cvs', 'profile'],
    queryFn: () => candidateService.getMyProfile(),
  })
  const draftsQuery = useQuery({
    queryKey: ['candidate-cvs', 'drafts'],
    queryFn: () => cvTemplateService.list(),
  })
  const applicationsQuery = useQuery({
    queryKey: ['candidate-cvs', 'submitted'],
    queryFn: () => applicationService.getMyApplications({ limit: 100, page: 1 }),
  })

  const profileCvs = useMemo(
    () => sortByUpdatedAt(profileQuery.data?.cvs ?? []),
    [profileQuery.data?.cvs],
  )
  const drafts = useMemo(
    () => sortByUpdatedAt(draftsQuery.data ?? []),
    [draftsQuery.data],
  )
  const submittedApplications = useMemo(
    () => sortApplications(applicationsQuery.data?.data ?? []),
    [applicationsQuery.data?.data],
  )
  const defaultCv = profileQuery.data?.defaultCv ?? profileCvs.find((cv) => cv.isDefault) ?? null
  const hasLocalDraft = !currentServerId && currentDocument.pages.some((page) => page.elements.length > 0)
  const tabCounts: Record<CandidateCvsTab, number> = {
    editing: drafts.length + (hasLocalDraft ? 1 : 0),
    submitted: submittedApplications.length,
    profile: profileCvs.length,
  }
  const isLoading = profileQuery.isLoading || draftsQuery.isLoading || applicationsQuery.isLoading
  const hasLoadError = profileQuery.isError || draftsQuery.isError || applicationsQuery.isError

  const renameDraftMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => cvTemplateService.update(id, { name }),
    onSuccess: () => {
      setRenamingDraftId(null)
      setRenameValue('')
      void queryClient.invalidateQueries({ queryKey: ['candidate-cvs', 'drafts'] })
      void queryClient.invalidateQueries({ queryKey: ['cv-templates'] })
      toast.success(content.states.renameSuccess)
    },
    onError: (error) => {
      toast.error(getApiErrorEnvelope(error)?.error.message ?? content.states.renameError)
    },
  })

  const deleteDraftMutation = useMutation({
    mutationFn: (id: string) => cvTemplateService.remove(id),
    onSuccess: (_result, id) => {
      if (currentServerId === id) {
        newCanvasDocument()
      }
      setPendingDraftDeleteId(null)
      void queryClient.invalidateQueries({ queryKey: ['candidate-cvs', 'drafts'] })
      void queryClient.invalidateQueries({ queryKey: ['cv-templates'] })
      toast.success(content.states.deleteSuccess)
    },
    onError: (error) => {
      toast.error(getApiErrorEnvelope(error)?.error.message ?? content.states.deleteError)
    },
  })

  const uploadProfileCvMutation = useMutation({
    mutationFn: (file: File) =>
      candidateService.uploadCv(file, {
        isDefault: profileCvs.length === 0,
        parse: false,
        title: file.name,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['candidate-cvs', 'profile'] })
      toast.success(content.states.uploadSuccess)
    },
    onError: (error) => {
      toast.error(getApiErrorEnvelope(error)?.error.message ?? content.states.uploadError)
    },
  })

  const parseProfileCvMutation = useMutation({
    mutationFn: (id: string) => candidateService.parseCv(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['candidate-cvs', 'profile'] })
      toast.success(content.states.parseStarted)
    },
    onError: (error) => {
      toast.error(getApiErrorEnvelope(error)?.error.message ?? content.states.parseError)
    },
  })

  const deleteProfileCvMutation = useMutation({
    mutationFn: (id: string) => candidateService.deleteCv(id),
    onSuccess: () => {
      setPendingProfileDeleteId(null)
      void queryClient.invalidateQueries({ queryKey: ['candidate-cvs', 'profile'] })
      toast.success(content.states.profileDeleteSuccess)
    },
    onError: (error) => {
      toast.error(getApiErrorEnvelope(error)?.error.message ?? content.states.profileDeleteError)
    },
  })

  const openSubmittedCvMutation = useMutation({
    mutationFn: async ({ application, target }: { application: ApplicationResponse; target: Window | null }) => {
      const download = await applicationService.getMyApplicationCv(application.id)
      if (target) {
        target.location.assign(download.url)
      } else {
        window.open(download.url, '_blank', 'noopener,noreferrer')
      }
      return download
    },
    onError: (error, variables) => {
      variables.target?.close()
      toast.error(getApiErrorEnvelope(error)?.error.message ?? content.states.openSubmittedError)
    },
  })

  function reload() {
    void queryClient.invalidateQueries({ queryKey: ['candidate-cvs'] })
  }

  function createNewCv() {
    newCanvasDocument()
    navigate('/cv-builder')
  }

  function openDraft(template: CvTemplateResponse) {
    loadCanvasDocument(template.canvas, template.id)
    navigate('/cv-builder')
  }

  function startRename(template: CvTemplateResponse) {
    setPendingDraftDeleteId(null)
    setRenamingDraftId(template.id)
    setRenameValue(template.name)
  }

  function submitRename(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault()

    const nextName = renameValue.trim()
    if (!nextName) {
      toast.error(content.validation.nameRequired)
      return
    }

    renameDraftMutation.mutate({ id, name: nextName })
  }

  function uploadProfileCv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''

    if (!file) return

    if (!isSupportedCvFile(file)) {
      toast.error(content.validation.invalidType)
      return
    }

    if (file.size > CV_MAX_SIZE_BYTES) {
      toast.error(content.validation.tooLarge)
      return
    }

    uploadProfileCvMutation.mutate(file)
  }

  function openSubmittedCv(application: ApplicationResponse) {
    const target = window.open('', '_blank')
    if (target) {
      target.opener = null
      target.document.write('')
    }
    openSubmittedCvMutation.mutate({ application, target })
  }

  if (isLoading) {
    return (
      <div className="candidate-cvs-page">
        <section className="candidate-cvs-state">
          <RefreshCw aria-hidden="true" />
          <p>{content.states.loading}</p>
        </section>
      </div>
    )
  }

  if (hasLoadError) {
    return (
      <div className="candidate-cvs-page">
        <section className="candidate-cvs-state">
          <FileText aria-hidden="true" />
          <h2>{content.states.errorTitle}</h2>
          <p>{content.states.errorDescription}</p>
          <Button onClick={reload}>{content.actions.retry}</Button>
        </section>
      </div>
    )
  }

  return (
    <div className="candidate-cvs-page">
      <section className="candidate-cvs-hero">
        <div className="candidate-cvs-hero__copy">
          <span>{content.hero.eyebrow}</span>
          <h2>{content.hero.title}</h2>
          <p>{content.hero.description}</p>
          <div className="candidate-cvs-hero__actions">
            <button onClick={createNewCv} type="button">
              <Plus aria-hidden="true" />
              <span>{content.hero.primaryAction}</span>
            </button>
            <button onClick={() => uploadInputRef.current?.click()} type="button">
              <Upload aria-hidden="true" />
              <span>{uploadProfileCvMutation.isPending ? content.actions.uploading : content.hero.secondaryAction}</span>
            </button>
          </div>
        </div>

        <dl className="candidate-cvs-stats" aria-label={content.pageTitle}>
          <div>
            <dt>{content.stats.drafts}</dt>
            <dd>{tabCounts.editing}</dd>
          </div>
          <div>
            <dt>{content.stats.submitted}</dt>
            <dd>{tabCounts.submitted}</dd>
          </div>
          <div>
            <dt>{content.stats.profileCvs}</dt>
            <dd>{tabCounts.profile}</dd>
          </div>
          <div>
            <dt>{content.stats.defaultCv}</dt>
            <dd>{defaultCv ? '1' : '0'}</dd>
          </div>
        </dl>
      </section>

      <div className="candidate-cvs-tabs" role="tablist" aria-label={content.routeLabel}>
        {CV_TABS.map((tab) => (
          <button
            aria-selected={activeTab === tab}
            className={activeTab === tab ? 'is-active' : undefined}
            key={tab}
            onClick={() => setActiveTab(tab)}
            role="tab"
            type="button"
          >
            <span>{content.tabs[tab]}</span>
            <strong>{tabCounts[tab]}</strong>
          </button>
        ))}
      </div>

      {activeTab === 'editing' ? (
        <section className="candidate-cvs-panel" aria-labelledby="candidate-cvs-editing-title">
          <PanelHeader
            description={content.sections.editingDescription}
            icon={<FolderOpen aria-hidden="true" />}
            title={content.sections.editingTitle}
            titleId="candidate-cvs-editing-title"
          />

          {tabCounts.editing > 0 ? (
            <div className="candidate-cvs-grid">
              {hasLocalDraft ? (
                <article className="candidate-cv-card is-local">
                  <div className="candidate-cv-card__mark">
                    <Sparkles aria-hidden="true" />
                  </div>
                  <div className="candidate-cv-card__body">
                    <span>{content.meta.localDraft}</span>
                    <h3>{currentDocument.name}</h3>
                    <p>{formatCountLabel(content.meta.pages, currentDocument.pages.length)}</p>
                  </div>
                  <div className="candidate-cv-card__actions">
                    <button onClick={() => navigate('/cv-builder')} type="button">
                      <Pencil aria-hidden="true" />
                      <span>{content.actions.continueEditing}</span>
                    </button>
                  </div>
                </article>
              ) : null}

              {drafts.map((template) => {
                const isRenaming = renamingDraftId === template.id
                const isPendingDelete = pendingDraftDeleteId === template.id
                const isActive = currentServerId === template.id
                const isDeleting = deleteDraftMutation.isPending && deleteDraftMutation.variables === template.id

                return (
                  <article className={`candidate-cv-card${isActive ? ' is-active' : ''}`} key={template.id}>
                    <div className="candidate-cv-card__mark">
                      <FileText aria-hidden="true" />
                    </div>
                    <div className="candidate-cv-card__body">
                      <span>{formatDate(template.updatedAt, locale, content.meta.notAvailable)}</span>
                      <h3>{template.name}</h3>
                      <p>
                        {formatCountLabel(content.meta.pages, template.canvas.pages.length)}
                        {hasCanvasContent(template) ? '' : ` · ${content.meta.notAvailable}`}
                      </p>
                      {isActive ? <small>{content.meta.localDraft}</small> : null}

                      {isRenaming ? (
                        <form className="candidate-cv-inline-form" onSubmit={(event) => submitRename(event, template.id)}>
                          <input
                            autoFocus
                            onChange={(event) => setRenameValue(event.target.value)}
                            value={renameValue}
                          />
                          <button disabled={renameDraftMutation.isPending} type="submit">
                            <Check aria-hidden="true" />
                            <span>{content.actions.saveName}</span>
                          </button>
                          <button
                            onClick={() => {
                              setRenamingDraftId(null)
                              setRenameValue('')
                            }}
                            type="button"
                          >
                            <X aria-hidden="true" />
                            <span>{content.actions.cancel}</span>
                          </button>
                        </form>
                      ) : null}

                      {isPendingDelete ? (
                        <div className="candidate-cv-confirm">
                          <span>{content.actions.confirmDelete}?</span>
                          <button disabled={isDeleting} onClick={() => deleteDraftMutation.mutate(template.id)} type="button">
                            {content.actions.confirmDelete}
                          </button>
                          <button onClick={() => setPendingDraftDeleteId(null)} type="button">
                            {content.actions.keepCv}
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <div className="candidate-cv-card__actions">
                      <button onClick={() => openDraft(template)} type="button">
                        <Pencil aria-hidden="true" />
                        <span>{content.actions.continueEditing}</span>
                      </button>
                      <button onClick={() => startRename(template)} type="button">
                        <Pencil aria-hidden="true" />
                        <span>{content.actions.rename}</span>
                      </button>
                      <button
                        className="is-danger"
                        onClick={() => {
                          setRenamingDraftId(null)
                          setPendingDraftDeleteId(template.id)
                        }}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" />
                        <span>{content.actions.delete}</span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <CandidateCvEmpty
              actionLabel={content.actions.newCv}
              description={content.states.emptyDraftsDescription}
              icon={<FolderOpen aria-hidden="true" />}
              onAction={createNewCv}
              title={content.states.emptyDraftsTitle}
            />
          )}
        </section>
      ) : null}

      {activeTab === 'submitted' ? (
        <section className="candidate-cvs-panel" aria-labelledby="candidate-cvs-submitted-title">
          <PanelHeader
            description={content.sections.submittedDescription}
            icon={<ExternalLink aria-hidden="true" />}
            title={content.sections.submittedTitle}
            titleId="candidate-cvs-submitted-title"
          />

          {submittedApplications.length > 0 ? (
            <div className="candidate-cvs-list">
              {submittedApplications.map((application) => {
                const isOpening =
                  openSubmittedCvMutation.isPending &&
                  openSubmittedCvMutation.variables?.application.id === application.id

                return (
                  <article className="candidate-submitted-cv" key={application.id}>
                    <div>
                      <span>{content.applicationStatus[application.status]}</span>
                      <h3>{application.cvFileName || application.cvTitle}</h3>
                      <p>
                        {content.meta.job}: {application.jobTitle} · {content.meta.company}: {application.companyName}
                      </p>
                    </div>
                    <dl>
                      <div>
                        <dt>{content.meta.submittedAt}</dt>
                        <dd>{formatDate(application.submittedAt, locale, content.meta.notAvailable)}</dd>
                      </div>
                      <div>
                        <dt>{content.meta.fileSize}</dt>
                        <dd>{formatFileSize(application.cvSize, content.meta.notAvailable)}</dd>
                      </div>
                      <div>
                        <dt>{content.meta.status}</dt>
                        <dd>{content.applicationStatus[application.status]}</dd>
                      </div>
                    </dl>
                    <div className="candidate-submitted-cv__actions">
                      <button disabled={isOpening} onClick={() => openSubmittedCv(application)} type="button">
                        <ExternalLink aria-hidden="true" />
                        <span>{isOpening ? content.actions.opening : content.actions.openSubmitted}</span>
                      </button>
                      <a href={`/jobs/${encodeURIComponent(application.jobId)}`}>
                        <span>{content.actions.viewJob}</span>
                      </a>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <CandidateCvEmpty
              actionHref="/search"
              actionLabel={content.actions.viewJob}
              description={content.states.emptySubmittedDescription}
              icon={<ExternalLink aria-hidden="true" />}
              title={content.states.emptySubmittedTitle}
            />
          )}
        </section>
      ) : null}

      {activeTab === 'profile' ? (
        <section className="candidate-cvs-panel" aria-labelledby="candidate-cvs-profile-title">
          <PanelHeader
            description={content.sections.profileDescription}
            icon={<Upload aria-hidden="true" />}
            title={content.sections.profileTitle}
            titleId="candidate-cvs-profile-title"
          />

          <div className="candidate-cv-upload-card">
            <div>
              <strong>{content.actions.upload}</strong>
              <p>{content.states.emptyProfileDescription}</p>
            </div>
            <button disabled={uploadProfileCvMutation.isPending} onClick={() => uploadInputRef.current?.click()} type="button">
              <Upload aria-hidden="true" />
              <span>{uploadProfileCvMutation.isPending ? content.actions.uploading : content.actions.upload}</span>
            </button>
          </div>

          {profileCvs.length > 0 ? (
            <div className="candidate-cvs-grid">
              {profileCvs.map((cv) => {
                const isParsing = parseProfileCvMutation.isPending && parseProfileCvMutation.variables === cv.id
                const isPendingDelete = pendingProfileDeleteId === cv.id
                const isDeleting = deleteProfileCvMutation.isPending && deleteProfileCvMutation.variables === cv.id

                return (
                  <article className={`candidate-cv-card candidate-profile-cv-card${cv.isDefault ? ' is-default' : ''}`} key={cv.id}>
                    <div className="candidate-cv-card__mark">
                      <FileText aria-hidden="true" />
                    </div>
                    <div className="candidate-cv-card__body">
                      <span>{formatDate(cv.updatedAt, locale, content.meta.notAvailable)}</span>
                      <h3>{getCvTitle(cv, content.meta.notAvailable)}</h3>
                      <p>{content.parseStatus[cv.parseStatus]}</p>
                      {cv.isDefault ? <small>{content.meta.defaultBadge}</small> : null}

                      {isPendingDelete ? (
                        <div className="candidate-cv-confirm">
                          <span>{content.actions.confirmDelete}?</span>
                          <button disabled={isDeleting} onClick={() => deleteProfileCvMutation.mutate(cv.id)} type="button">
                            {content.actions.confirmDelete}
                          </button>
                          <button onClick={() => setPendingProfileDeleteId(null)} type="button">
                            {content.actions.keepCv}
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <div className="candidate-cv-card__actions">
                      <button
                        disabled={isParsing || cv.parseStatus === 'PARSING'}
                        onClick={() => parseProfileCvMutation.mutate(cv.id)}
                        type="button"
                      >
                        <Sparkles aria-hidden="true" />
                        <span>{isParsing || cv.parseStatus === 'PARSING' ? content.actions.parsing : content.actions.parse}</span>
                      </button>
                      <button className="is-danger" onClick={() => setPendingProfileDeleteId(cv.id)} type="button">
                        <Trash2 aria-hidden="true" />
                        <span>{content.actions.delete}</span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <CandidateCvEmpty
              actionLabel={content.actions.upload}
              description={content.states.emptyProfileDescription}
              icon={<Upload aria-hidden="true" />}
              onAction={() => uploadInputRef.current?.click()}
              title={content.states.emptyProfileTitle}
            />
          )}
        </section>
      ) : null}

      <input
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        onChange={uploadProfileCv}
        ref={uploadInputRef}
        type="file"
      />
    </div>
  )
}

type PanelHeaderProps = {
  description: string
  icon: ReactNode
  title: string
  titleId: string
}

function PanelHeader({ description, icon, title, titleId }: PanelHeaderProps) {
  return (
    <header className="candidate-cvs-panel__header">
      <span>{icon}</span>
      <div>
        <h2 id={titleId}>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  )
}

type CandidateCvEmptyProps = {
  actionHref?: string
  actionLabel: string
  description: string
  icon: ReactNode
  onAction?: () => void
  title: string
}

function CandidateCvEmpty({ actionHref, actionLabel, description, icon, onAction, title }: CandidateCvEmptyProps) {
  return (
    <section className="candidate-cvs-empty">
      <span>{icon}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionHref ? (
        <a href={actionHref}>{actionLabel}</a>
      ) : (
        <button onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </section>
  )
}

export default CandidateCvsPage
