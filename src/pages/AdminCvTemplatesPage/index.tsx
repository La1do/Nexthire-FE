import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'
import {
  Archive,
  CheckCircle2,
  FileJson,
  Loader2,
  PencilLine,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Upload,
  X,
  Undo2,
} from 'lucide-react'
import { useToast } from '../../context'
import { useAdminCvTemplatePreset, useAdminCvTemplatePresetAction, useAdminCvTemplatePresets, useCreateAdminCvTemplatePreset, useUpdateAdminCvTemplatePreset } from '../../hooks/useAdminQueries'
import { useLocale, useTranslations } from '../../i18n'
import { getApiErrorCode } from '../../lib/api/apiError'
import { Button, ConfirmModal } from '../_components'
import { AdminActionMenu } from '../_components/admin/AdminActionMenu'
import { AdminPagination } from '../_components/admin/AdminPagination'
import { AdminStatCard } from '../_components/admin/AdminStatCard'
import { ErrorState } from '../_components/admin/ErrorState'
import { LoadingSkeleton } from '../_components/admin/LoadingSkeleton'
import type { AdminCvTemplatesTranslations } from '../../i18n/types'
import type {
  AdminCvTemplatePreset,
  CvTemplatePresetCategory,
  CvTemplatePresetStatus,
  CvTemplatePresetStatusFilter,
  CreateAdminCvTemplatePresetPayload,
  UpdateAdminCvTemplatePresetPayload,
} from '../../types/cvTemplatePreset.types'
import { genId, type CanvasDocument } from '../CvBuilderPage/canvas/canvas.types'
import './admin-cv-templates-page.css'

const PAGE_SIZE = 20
const LOCALES = ['vi', 'en', 'ja'] as const
const STATUSES: Array<CvTemplatePresetStatusFilter> = ['all', 'DRAFT', 'PUBLISHED', 'ARCHIVED']
const CATEGORIES: CvTemplatePresetCategory[] = ['it', 'marketing', 'sales', 'hr']

type LocaleCode = (typeof LOCALES)[number]
type TemplateDraft = {
  key: string
  defaultName: string
  defaultDescription: string
  name: Record<LocaleCode, string>
  description: Record<LocaleCode, string>
  categories: CvTemplatePresetCategory[]
  accent: string
  thumbnailUrl: string
  sortOrder: string
  canvasText: string
}
type PendingAction = {
  presetId: string
  name: string
  action: 'publish' | 'archive' | 'restore'
}

function localizedText(value: Record<LocaleCode, string>, locale: string) {
  return value[locale as LocaleCode] || value.vi || value.en || value.ja || ''
}

function createBlankCanvas(name = 'Untitled template'): CanvasDocument {
  return {
    id: genId('doc'),
    name,
    pageSize: { width: 794, height: 1123 },
    pages: [
      {
        id: genId('page'),
        background: '#ffffff',
        elements: [],
      },
    ],
  }
}

function createBlankDraft(): TemplateDraft {
  const canvas = createBlankCanvas()
  return {
    key: '',
    defaultName: '',
    defaultDescription: '',
    name: { vi: '', en: '', ja: '' },
    description: { vi: '', en: '', ja: '' },
    categories: [],
    accent: '#2563eb',
    thumbnailUrl: '',
    sortOrder: '0',
    canvasText: JSON.stringify(canvas, null, 2),
  }
}

function createDraftFromPreset(
  preset: AdminCvTemplatePreset,
  locale: string,
): TemplateDraft {
  const canvas = preset.canvas ?? createBlankCanvas(localizedText(preset.name, locale) || preset.key)
  return {
    key: preset.key,
    defaultName: localizedText(preset.name, locale),
    defaultDescription: localizedText(preset.description, locale),
    name: {
      vi: preset.name.vi || '',
      en: preset.name.en || '',
      ja: preset.name.ja || '',
    },
    description: {
      vi: preset.description.vi || '',
      en: preset.description.en || '',
      ja: preset.description.ja || '',
    },
    categories: [...preset.categories],
    accent: preset.accent || '#2563eb',
    thumbnailUrl: preset.thumbnailUrl || '',
    sortOrder: String(preset.sortOrder ?? 0),
    canvasText: JSON.stringify(canvas, null, 2),
  }
}

function toLocaleInput(values: Record<LocaleCode, string>) {
  const input: Partial<Record<LocaleCode, string>> = {}
  for (const locale of LOCALES) {
    const value = values[locale].trim()
    if (value) {
      input[locale] = value
    }
  }
  return Object.keys(input).length > 0 ? input : undefined
}

function parseOptionalInteger(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  return Number.isInteger(parsed) ? parsed : undefined
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('FILE_READ_ERROR'))
    reader.readAsDataURL(file)
  })
}

function normalizeCanvas(value: string, fallbackName: string): CanvasDocument | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    return null
  }

  if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as { pages?: unknown[] }).pages) || (parsed as { pages: unknown[] }).pages.length === 0) {
    return null
  }

  const document = parsed as Partial<CanvasDocument> & {
    pages: Array<Partial<CanvasDocument['pages'][number]> & { elements?: unknown }>
  }

  return {
    id: typeof document.id === 'string' && document.id.trim() ? document.id : genId('doc'),
    name: typeof document.name === 'string' && document.name.trim() ? document.name : fallbackName,
    pageSize:
      document.pageSize &&
      typeof document.pageSize.width === 'number' &&
      typeof document.pageSize.height === 'number'
        ? document.pageSize
        : { width: 794, height: 1123 },
    pages: document.pages.map((page, index) => ({
      id: typeof page.id === 'string' && page.id.trim() ? page.id : genId(`page-${index + 1}`),
      background:
        typeof page.background === 'string' && page.background.trim()
          ? page.background
          : '#ffffff',
      elements: Array.isArray(page.elements) ? page.elements : [],
    })),
  }
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

function statusLabel(content: AdminCvTemplatesTranslations, status: CvTemplatePresetStatus) {
  return content.statuses[status.toLowerCase() as 'draft' | 'published' | 'archived']
}

function categoryLabel(content: AdminCvTemplatesTranslations, category: CvTemplatePresetCategory) {
  return content.categories[category]
}

async function buildPayload(
  draft: TemplateDraft,
  thumbnailFile: File | null,
): Promise<{
  error: string | null
  payload?: CreateAdminCvTemplatePresetPayload | UpdateAdminCvTemplatePresetPayload
}> {
  const key = draft.key.trim().toLowerCase()
  const defaultName = draft.defaultName.trim()
  const defaultDescription = draft.defaultDescription.trim()

  if (!key || !defaultName || !defaultDescription) {
    return { error: 'required' }
  }

  if (draft.categories.length === 0) {
    return { error: 'categories' }
  }

  const canvas = normalizeCanvas(draft.canvasText, defaultName || key)
  if (!canvas) {
    return { error: 'canvas' }
  }

  const sortOrder = parseOptionalInteger(draft.sortOrder)

  const localizedNames = toLocaleInput(draft.name)
  const localizedDescriptions = toLocaleInput(draft.description)
  const thumbnailUrl = thumbnailFile ? await fileToDataUrl(thumbnailFile) : draft.thumbnailUrl.trim()

  if (thumbnailFile && !thumbnailUrl) {
    return { error: 'thumbnail' }
  }

  const payload: CreateAdminCvTemplatePresetPayload = {
    key,
    defaultName,
    defaultDescription,
    categories: draft.categories,
    canvas,
    ...(localizedNames ? { name: localizedNames } : {}),
    ...(localizedDescriptions ? { description: localizedDescriptions } : {}),
    ...(draft.accent.trim() ? { accent: draft.accent.trim() } : {}),
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    ...(sortOrder === undefined ? {} : { sortOrder }),
  }

  return { error: null, payload }
}

export function AdminCvTemplatesPage() {
  const { pages } = useTranslations()
  const { locale } = useLocale()
  const content = pages.adminCvTemplates
  const toast = useToast()

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [status, setStatus] = useState<CvTemplatePresetStatusFilter>('all')
  const [category, setCategory] = useState<CvTemplatePresetCategory | 'all'>('all')
  const [page, setPage] = useState(1)
  const [isEditorOpen, setEditorOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<TemplateDraft>(() => createBlankDraft())
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [jsonNote, setJsonNote] = useState<{ tone: 'success' | 'error'; text: string } | null>(null)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(thumbnailFile)
    setThumbnailPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [thumbnailFile])

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, status, category])

  const listQuery = useAdminCvTemplatePresets({
    page,
    limit: PAGE_SIZE,
    search: debouncedQuery || undefined,
    status: status === 'all' ? undefined : status,
    category: category === 'all' ? undefined : category,
    includeCanvas: false,
  })
  const detailQuery = useAdminCvTemplatePreset(editingId ?? undefined)
  const createMutation = useCreateAdminCvTemplatePreset()
  const updateMutation = useUpdateAdminCvTemplatePreset(editingId ?? 'missing')
  const actionMutation = useAdminCvTemplatePresetAction(
    pendingAction?.presetId ?? 'missing',
    pendingAction?.action ?? 'publish',
  )

  const rows = useMemo(() => listQuery.data?.data ?? [], [listQuery.data])
  const total = listQuery.data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasActiveFilters = Boolean(query.trim() || status !== 'all' || category !== 'all')
  const stats = useMemo(
    () =>
      rows.reduce(
        (acc, preset) => {
          acc.total += 1
          if (preset.status === 'PUBLISHED') acc.published += 1
          if (preset.status === 'DRAFT') acc.draft += 1
          if (preset.status === 'ARCHIVED') acc.archived += 1
          return acc
        },
        { total: 0, published: 0, draft: 0, archived: 0 },
      ),
    [rows],
  )

  useEffect(() => {
    if (!editingId || !detailQuery.data) {
      return
    }

    setDraft(createDraftFromPreset(detailQuery.data, locale))
  }, [detailQuery.data, editingId, locale])

  const openCreate = () => {
    setEditingId(null)
    setDraft(createBlankDraft())
    setThumbnailFile(null)
    setFormError(null)
    setJsonNote(null)
    setEditorOpen(true)
  }

  const openEdit = (preset: AdminCvTemplatePreset) => {
    setEditingId(preset.id)
    setDraft(createDraftFromPreset(preset, locale))
    setThumbnailFile(null)
    setFormError(null)
    setJsonNote(null)
    setEditorOpen(true)
  }

  const closeEditor = () => {
    setEditorOpen(false)
    setEditingId(null)
    setThumbnailFile(null)
    setFormError(null)
    setJsonNote(null)
  }

  const handleThumbnailFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    setThumbnailFile(file)
    setFormError(null)
    setJsonNote(null)
  }

  const handleSave = async () => {
    let result: Awaited<ReturnType<typeof buildPayload>>
    try {
      result = await buildPayload(draft, thumbnailFile)
    } catch {
      setFormError(content.form.thumbnailFileError)
      return
    }

    if (result.error || !result.payload) {
      if (result.error === 'required') {
        setFormError(content.form.requiredFields)
      } else if (result.error === 'categories') {
        setFormError(content.form.categoriesRequired)
      } else if (result.error === 'canvas') {
        setFormError(content.form.invalidJson)
      } else if (result.error === 'thumbnail') {
        setFormError(content.form.thumbnailFileError)
      }
      return
    }

    if (editingId) {
      updateMutation.mutate(result.payload as UpdateAdminCvTemplatePresetPayload, {
        onSuccess: () => {
          toast.success(content.form.updateSuccess)
          closeEditor()
          setDraft(createBlankDraft())
          setThumbnailFile(null)
        },
        onError: (error) => {
          toast.error(`${content.form.saveError} (${getApiErrorCode(error) ?? 'COMMON.UNKNOWN_ERROR'})`)
        },
      })
      return
    }

    createMutation.mutate(result.payload as CreateAdminCvTemplatePresetPayload, {
      onSuccess: () => {
        toast.success(content.form.createSuccess)
        closeEditor()
        setDraft(createBlankDraft())
        setThumbnailFile(null)
      },
      onError: (error) => {
        toast.error(`${content.form.saveError} (${getApiErrorCode(error) ?? 'COMMON.UNKNOWN_ERROR'})`)
      },
    })
  }

  const handleFormatJson = () => {
    const canvas = normalizeCanvas(draft.canvasText, draft.defaultName.trim() || draft.key || 'Untitled template')
    if (!canvas) {
      setJsonNote({ tone: 'error', text: content.form.invalidJson })
      return
    }

    setDraft((current) => ({
      ...current,
      canvasText: JSON.stringify(canvas, null, 2),
    }))
    setJsonNote({ tone: 'success', text: content.form.formattedJson })
    setFormError(null)
  }

  const handleValidateJson = () => {
    const canvas = normalizeCanvas(draft.canvasText, draft.defaultName.trim() || draft.key || 'Untitled template')
    if (!canvas) {
      setJsonNote({ tone: 'error', text: content.form.invalidJson })
      return
    }

    setJsonNote({ tone: 'success', text: content.form.validJson })
  }

  const handleActionConfirm = () => {
    actionMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success(content.actions.actionSuccess)
        setPendingAction(null)
      },
      onError: (error) => {
        toast.error(`${content.form.actionError} (${getApiErrorCode(error) ?? 'COMMON.UNKNOWN_ERROR'})`)
      },
    })
  }

  if (listQuery.isPending && !listQuery.data) {
    return (
      <div className="admin-cv-templates-page">
        <LoadingSkeleton ariaLabel={content.feedback.loading} lines={8} />
      </div>
    )
  }

  if ((listQuery.isError && !listQuery.data) || !listQuery.data) {
    return (
      <div className="admin-cv-templates-page">
        <ErrorState
          actionLabel={content.feedback.retry}
          description={content.feedback.errorDescription}
          onRetry={() => void listQuery.refetch()}
          title={content.feedback.errorTitle}
        />
      </div>
    )
  }

  return (
    <div className="admin-cv-templates-page">
      <header className="admin-cv-templates-page__header">
        <div>
          <p className="admin-cv-templates-page__eyebrow">{content.routeLabel}</p>
          <h1>{content.pageTitle}</h1>
          <p>{content.pageSubtitle}</p>
        </div>
        <div className="admin-cv-templates-page__header-actions">
          <Button onClick={() => void listQuery.refetch()} variant="secondary">
            <RefreshCcw size={16} />
            <span>{content.filters.refresh}</span>
          </Button>
          <Button onClick={openCreate}>
            <Plus size={16} />
            <span>{content.filters.create}</span>
          </Button>
        </div>
      </header>

      <section className="admin-cv-templates-stats" aria-label={content.pageTitle}>
        <AdminStatCard icon={<CheckCircle2 size={18} />} label={content.stats.total} tone="blue" value={stats.total} />
        <AdminStatCard icon={<CheckCircle2 size={18} />} label={content.stats.published} tone="coral" value={stats.published} />
        <AdminStatCard icon={<FileJson size={18} />} label={content.stats.draft} tone="violet" value={stats.draft} />
        <AdminStatCard icon={<Archive size={18} />} label={content.stats.archived} tone="amber" value={stats.archived} />
      </section>

      <section className="admin-cv-templates-toolbar" aria-label={content.filters.searchLabel}>
        <label className="admin-cv-templates-field admin-cv-templates-field--search">
          <span>{content.filters.searchLabel}</span>
          <div className="admin-cv-templates-search">
            <Search size={16} />
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder={content.filters.searchPlaceholder}
              value={query}
            />
          </div>
        </label>
        <label className="admin-cv-templates-field">
          <span>{content.filters.statusLabel}</span>
          <select onChange={(event) => setStatus(event.target.value as CvTemplatePresetStatusFilter)} value={status}>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item === 'all' ? content.filters.statusAll : content.statuses[item.toLowerCase() as 'draft' | 'published' | 'archived']}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-cv-templates-field">
          <span>{content.filters.categoryLabel}</span>
          <select onChange={(event) => setCategory(event.target.value as CvTemplatePresetCategory | 'all')} value={category}>
            <option value="all">{content.filters.categoryAll}</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {categoryLabel(content, item)}
              </option>
            ))}
          </select>
        </label>
        <div className="admin-cv-templates-toolbar__actions">
          <Button disabled={!hasActiveFilters} onClick={() => { setQuery(''); setStatus('all'); setCategory('all') }} variant="ghost">
            {content.filters.clear}
          </Button>
        </div>
      </section>

      <section className="admin-cv-templates-table-wrap">
        <header className="admin-cv-templates-table-head">
          <p>{content.table.countLabel.replace('{{count}}', String(total))}</p>
        </header>

        {rows.length === 0 ? (
          <div className="admin-cv-templates-empty">
            <h2>{content.table.emptyTitle}</h2>
            <p>{content.table.emptyDescription}</p>
          </div>
        ) : (
          <div className="admin-cv-templates-table-scroll">
            <table className="admin-cv-templates-table">
              <thead>
                <tr>
                  <th>{content.table.columns.template}</th>
                  <th>{content.table.columns.key}</th>
                  <th>{content.table.columns.categories}</th>
                  <th>{content.table.columns.status}</th>
                  <th>{content.table.columns.version}</th>
                  <th>{content.table.columns.sortOrder}</th>
                  <th>{content.table.columns.updatedAt}</th>
                  <th>{content.table.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((preset) => {
                  const rowName = localizedText(preset.name, locale)
                  const rowDescription = localizedText(preset.description, locale)
                  const actionItems = [
                    {
                      icon: <PencilLine size={14} />,
                      label: content.actions.edit,
                      onClick: () => openEdit(preset),
                    },
                    ...(preset.status === 'ARCHIVED'
                      ? [
                          {
                            icon: <Undo2 size={14} />,
                            label: content.actions.restore,
                            tone: 'success' as const,
                            onClick: () =>
                              setPendingAction({
                                presetId: preset.id,
                                name: rowName || preset.key,
                                action: 'restore',
                              }),
                          },
                        ]
                      : [
                          ...(preset.status !== 'PUBLISHED'
                            ? [
                                {
                                  icon: <CheckCircle2 size={14} />,
                                  label: content.actions.publish,
                                  tone: 'success' as const,
                                  onClick: () =>
                                    setPendingAction({
                                      presetId: preset.id,
                                      name: rowName || preset.key,
                                      action: 'publish',
                                    }),
                                },
                              ]
                            : []),
                          {
                            icon: <Archive size={14} />,
                            label: content.actions.archive,
                            tone: 'warning' as const,
                            onClick: () =>
                              setPendingAction({
                                presetId: preset.id,
                                name: rowName || preset.key,
                                action: 'archive',
                              }),
                          },
                        ]),
                  ]

                  return (
                    <tr key={preset.id}>
                      <td>
                        <button className="admin-cv-template-cell" onClick={() => openEdit(preset)} type="button">
                          <span className="admin-cv-template-cell__thumb">
                            {preset.thumbnailUrl ? (
                              <img alt="" src={preset.thumbnailUrl} />
                            ) : (
                              <strong>{(preset.key.slice(0, 2) || 'CV').toUpperCase()}</strong>
                            )}
                          </span>
                          <span className="admin-cv-template-cell__copy">
                            <strong>{rowName || preset.key}</strong>
                            <span>{rowDescription}</span>
                          </span>
                        </button>
                      </td>
                      <td>
                        <code className="admin-cv-template-key">{preset.key}</code>
                      </td>
                      <td>
                        <div className="admin-cv-template-badges">
                          {preset.categories.map((item) => (
                            <span className="admin-cv-template-badge" key={item}>
                              {categoryLabel(content, item)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`admin-cv-template-status admin-cv-template-status--${preset.status.toLowerCase()}`}>
                          {statusLabel(content, preset.status)}
                        </span>
                      </td>
                      <td>{preset.version}</td>
                      <td>{preset.sortOrder}</td>
                      <td>{formatDate(preset.updatedAt)}</td>
                      <td>
                        <AdminActionMenu items={actionItems} label={content.table.columns.actions} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AdminPagination labels={content.pagination} onPageChange={setPage} page={page} totalPages={totalPages} />

      {isEditorOpen ? (
        <div aria-modal="true" className="admin-cv-template-modal" role="dialog">
          <div className="admin-cv-template-modal__backdrop" onMouseDown={closeEditor} />
          <form
            className="admin-cv-template-modal__panel"
            onSubmit={(event) => {
              event.preventDefault()
              void handleSave()
            }}
          >
            <header className="admin-cv-template-modal__header">
              <div>
                <p>{editingId ? content.form.editTitle : content.form.createTitle}</p>
                <h2>{draft.defaultName || draft.key || content.form.createTitle}</h2>
              </div>
              <button aria-label={content.form.cancel} onClick={closeEditor} type="button">
                <X size={16} />
              </button>
            </header>

            <div className="admin-cv-template-modal__body">
              <div className="admin-cv-template-modal__main">
                <div className="admin-cv-template-form-grid">
                  <label>
                    <span>{content.form.keyLabel}</span>
                    <input
                      onChange={(event) => setDraft((current) => ({ ...current, key: event.target.value }))}
                      placeholder={content.form.keyPlaceholder}
                      value={draft.key}
                    />
                    <small>{content.form.keyHint}</small>
                  </label>
                  <label>
                    <span>{content.form.defaultNameLabel}</span>
                    <input
                      onChange={(event) => setDraft((current) => ({ ...current, defaultName: event.target.value }))}
                      value={draft.defaultName}
                    />
                  </label>
                  <label>
                    <span>{content.form.defaultDescriptionLabel}</span>
                    <textarea
                      onChange={(event) => setDraft((current) => ({ ...current, defaultDescription: event.target.value }))}
                      rows={4}
                      value={draft.defaultDescription}
                    />
                  </label>
                  <label>
                    <span>{content.form.sortOrderLabel}</span>
                    <input
                      inputMode="numeric"
                      onChange={(event) => setDraft((current) => ({ ...current, sortOrder: event.target.value }))}
                      type="number"
                      value={draft.sortOrder}
                    />
                  </label>
                  <label>
                    <span>{content.form.accentLabel}</span>
                    <div className="admin-cv-template-color-field">
                      <input
                        className="admin-cv-template-color-input"
                        onChange={(event) => setDraft((current) => ({ ...current, accent: event.target.value }))}
                        type="color"
                        value={draft.accent}
                      />
                      <div
                        className="admin-cv-template-color-preview"
                      >
                        <span
                          aria-hidden="true"
                          className="admin-cv-template-color-preview__swatch"
                          style={{ backgroundColor: draft.accent }}
                        />
                        <strong>{draft.accent.toUpperCase()}</strong>
                      </div>
                    </div>
                  </label>
                  <div className="admin-cv-template-thumbnail-field">
                    <div className="admin-cv-template-thumbnail-field__head">
                      <h3>{content.form.thumbnailUrlLabel}</h3>
                      <p>{content.form.thumbnailFileHint}</p>
                    </div>
                    <div className="admin-cv-template-thumbnail-field__controls">
                      <input
                        accept="image/*"
                        className="admin-cv-template-thumbnail-field__input"
                        hidden
                        onChange={handleThumbnailFileChange}
                        ref={thumbnailInputRef}
                        type="file"
                      />
                      <Button
                        onClick={() => thumbnailInputRef.current?.click()}
                        variant="secondary"
                      >
                        <Upload size={16} />
                        <span>{content.form.thumbnailUploadLabel}</span>
                      </Button>
                      <input
                        onChange={(event) => {
                          setThumbnailFile(null)
                          setDraft((current) => ({ ...current, thumbnailUrl: event.target.value }))
                        }}
                        placeholder="https://..."
                        value={draft.thumbnailUrl}
                      />
                    </div>
                    <div className="admin-cv-template-thumbnail-preview">
                      {thumbnailPreviewUrl || draft.thumbnailUrl.trim() ? (
                        <img
                          alt=""
                          src={thumbnailPreviewUrl ?? draft.thumbnailUrl.trim()}
                        />
                      ) : (
                        <span>{content.form.thumbnailUrlLabel}</span>
                      )}
                    </div>
                    {thumbnailFile ? (
                      <small className="admin-cv-template-thumbnail-selected">
                        {content.form.thumbnailSelected.replace('{{name}}', thumbnailFile.name)}
                      </small>
                    ) : null}
                  </div>
                </div>

                <section className="admin-cv-template-modal__section">
                  <div className="admin-cv-template-modal__section-head">
                    <h3>{content.form.nameGroup}</h3>
                    <p>{content.form.optionalLocaleHint}</p>
                  </div>
                  <div className="admin-cv-template-locale-grid">
                    {LOCALES.map((localeKey) => (
                      <label key={localeKey}>
                        <span>{content.form.localeLabels[localeKey]}</span>
                        <input
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              name: { ...current.name, [localeKey]: event.target.value },
                            }))
                          }
                          value={draft.name[localeKey]}
                        />
                      </label>
                    ))}
                  </div>
                </section>

                <section className="admin-cv-template-modal__section">
                  <div className="admin-cv-template-modal__section-head">
                    <h3>{content.form.descriptionGroup}</h3>
                    <p>{content.form.optionalLocaleHint}</p>
                  </div>
                  <div className="admin-cv-template-locale-grid">
                    {LOCALES.map((localeKey) => (
                      <label key={localeKey}>
                        <span>{content.form.localeLabels[localeKey]}</span>
                        <textarea
                          onChange={(event) =>
                            setDraft((current) => ({
                              ...current,
                              description: { ...current.description, [localeKey]: event.target.value },
                            }))
                          }
                          rows={3}
                          value={draft.description[localeKey]}
                        />
                      </label>
                    ))}
                  </div>
                </section>

                <section className="admin-cv-template-modal__section">
                  <div className="admin-cv-template-modal__section-head">
                    <h3>{content.form.categoryLabel}</h3>
                    <p>{content.form.categoriesRequired}</p>
                  </div>
                  <div className="admin-cv-template-category-grid">
                    {CATEGORIES.map((item) => {
                      const active = draft.categories.includes(item)
                      return (
                        <label className={`admin-cv-template-category${active ? ' is-active' : ''}`} key={item}>
                          <input
                            checked={active}
                            onChange={() =>
                              setDraft((current) => ({
                                ...current,
                                categories: active
                                  ? current.categories.filter((categoryItem) => categoryItem !== item)
                                  : [...current.categories, item],
                              }))
                            }
                            type="checkbox"
                          />
                          <span>{categoryLabel(content, item)}</span>
                        </label>
                      )
                    })}
                  </div>
                </section>

                <section className="admin-cv-template-modal__section">
                  <div className="admin-cv-template-modal__section-head">
                    <h3>{content.form.canvasJsonLabel}</h3>
                    <p>{content.form.canvasJsonHint}</p>
                  </div>
                  <textarea
                    className="admin-cv-template-json"
                    onChange={(event) => {
                      setDraft((current) => ({ ...current, canvasText: event.target.value }))
                      setFormError(null)
                      setJsonNote(null)
                    }}
                    spellCheck={false}
                    value={draft.canvasText}
                  />
                  {formError ? <p className="admin-cv-template-form-error">{formError}</p> : null}
                  {jsonNote ? <p className={`admin-cv-template-form-note admin-cv-template-form-note--${jsonNote.tone}`}>{jsonNote.text}</p> : null}
                  {editingId && detailQuery.isFetching ? <p className="admin-cv-template-form-note">{content.form.loading}</p> : null}
                  {editingId && detailQuery.isError && !detailQuery.data ? (
                    <p className="admin-cv-template-form-error">{content.feedback.errorDescription}</p>
                  ) : null}
                </section>
              </div>
            </div>

            <footer className="admin-cv-template-modal__footer">
              <Button onClick={handleFormatJson} variant="secondary">
                <FileJson size={16} />
                <span>{content.form.formatJson}</span>
              </Button>
              <Button onClick={handleValidateJson} variant="secondary">
                <CheckCircle2 size={16} />
                <span>{content.form.validateJson}</span>
              </Button>
              <div className="admin-cv-template-modal__footer-spacer" />
              <Button disabled={createMutation.isPending || updateMutation.isPending} onClick={closeEditor} variant="ghost">
                {content.form.cancel}
              </Button>
              <Button disabled={createMutation.isPending || updateMutation.isPending || (Boolean(editingId) && detailQuery.isError && !detailQuery.data)} type="submit">
                {createMutation.isPending || updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{createMutation.isPending || updateMutation.isPending ? content.form.saving : content.form.save}</span>
              </Button>
            </footer>
          </form>
        </div>
      ) : null}

      <ConfirmModal
        cancelLabel={content.actions.cancel}
        confirmLabel={pendingAction ? content.actions[pendingAction.action] : content.actions.publish}
        description={pendingAction ? content.actions.confirmDescription.replace('{{action}}', pendingAction.action === 'publish' ? content.actions.publish : pendingAction.action === 'archive' ? content.actions.archive : content.actions.restore).replace('{{name}}', pendingAction.name) : ''}
        isOpen={Boolean(pendingAction)}
        isPending={actionMutation.isPending}
        onCancel={() => setPendingAction(null)}
        onConfirm={handleActionConfirm}
        title={content.actions.confirmTitle}
      />
    </div>
  )
}

export default AdminCvTemplatesPage
