import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context'
import { useLocale } from '../../i18n'
import { getApiErrorCode, getApiErrorEnvelope } from '../../lib/api/apiError'
import { companyService } from '../../services/company.service'
import type {
  CompanyResponse,
  CompanyVerificationDocument,
  CompanyVerificationDocumentType,
  UpdateCompanyPayload,
} from '../../types/company.types'
import { CompanyLegalSection } from './components/CompanyLegalSection'
import { VerificationDocumentsSection } from './components/VerificationDocumentsSection'
import { VerificationStatusPanel } from './components/VerificationStatusPanel'
import type {
  CompanyLegalFormValues,
  CompanyVerificationStatus,
  QueuedVerificationDocument,
} from './types'
import {
  buildCompanyUpdatePayload,
  companyToFormValues,
  createCompanyLegalSchema,
  EMPTY_COMPANY_FORM,
  normalizeCompanyForm,
} from './utils'
import './recruiter-verification.css'

const LOGO_MAX_SIZE = 5 * 1024 * 1024
const DOCUMENT_MAX_SIZE = 10 * 1024 * 1024
const LOGO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp',
])
const DOCUMENT_EXTENSIONS = new Set(['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'webp'])

function createQueueId(file: File) {
  return globalThis.crypto?.randomUUID?.() ?? `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`
}

function getDocumentStorageType(type: CompanyVerificationDocumentType) {
  return type === 'OTHER' || type === 'DOMAIN_PROOF' ? 'OTHER' : 'CERTIFICATE'
}

function hasPayloadValues(payload: Record<string, unknown>) {
  return Object.keys(payload).length > 0
}

export function RecruiterVerificationPage() {
  const { locale, translations } = useLocale()
  const content = translations.pages.recruiterVerification
  const { refreshUser, user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const nextPath = searchParams.get('next')
  const [company, setCompany] = useState<CompanyResponse | null>(null)
  const [documents, setDocuments] = useState<CompanyVerificationDocument[]>([])
  const [queuedDocuments, setQueuedDocuments] = useState<QueuedVerificationDocument[]>([])
  const [selectedDocumentType, setSelectedDocumentType] = useState<CompanyVerificationDocumentType>('BUSINESS_LICENSE')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [logoError, setLogoError] = useState<string>()
  const [documentError, setDocumentError] = useState<string>()
  const [submitError, setSubmitError] = useState<string>()
  const [submitSuccess, setSubmitSuccess] = useState<string>()
  const [loadError, setLoadError] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setSubmitting] = useState(false)
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null)
  const hasMountedRef = useRef(false)
  const schema = useMemo(() => createCompanyLegalSchema(content.legal.validation), [content.legal.validation])
  const { control, handleSubmit, reset, trigger } = useForm<CompanyLegalFormValues>({
    defaultValues: EMPTY_COMPANY_FORM,
    mode: 'onBlur',
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    void trigger()
  }, [schema, trigger])

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setLoadError(undefined)

    try {
      let nextCompany: CompanyResponse | null = null
      try {
        nextCompany = await companyService.getMyCompany()
      } catch (error) {
        if (getApiErrorCode(error) !== 'COMPANY.NOT_FOUND') throw error
      }

      const nextDocuments = nextCompany
        ? await companyService.listVerificationDocuments(nextCompany.id)
        : []
      setCompany(nextCompany)
      setDocuments(nextDocuments)
      reset(companyToFormValues(nextCompany))
    } catch (error) {
      setLoadError(getApiErrorEnvelope(error)?.error.message ?? content.states.errorDescription)
    } finally {
      setLoading(false)
    }
  }, [content.states.errorDescription, reset])

  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(company?.logoUrl ?? company?.logo ?? '')
      return
    }

    const objectUrl = URL.createObjectURL(logoFile)
    setLogoPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [company?.logo, company?.logoUrl, logoFile])

  const status: CompanyVerificationStatus = company?.status ?? 'NO_COMPANY'
  const isReadOnly = status === 'SUSPENDED'

  function handleLogoChange(file: File | null) {
    setLogoError(undefined)
    if (!file) return
    if (!LOGO_TYPES.has(file.type)) {
      setLogoError(content.legal.logoInvalidType)
      return
    }
    if (file.size > LOGO_MAX_SIZE) {
      setLogoError(content.legal.logoTooLarge)
      return
    }
    setLogoFile(file)
    setSubmitError(undefined)
    setSubmitSuccess(undefined)
  }

  function handleDocumentFiles(files: FileList | File[]) {
    setDocumentError(undefined)
    const accepted: QueuedVerificationDocument[] = []

    for (const file of Array.from(files)) {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
      if (!DOCUMENT_TYPES.has(file.type) && !DOCUMENT_EXTENSIONS.has(extension)) {
        setDocumentError(content.documents.invalidType)
        continue
      }
      if (file.size > DOCUMENT_MAX_SIZE) {
        setDocumentError(content.documents.tooLarge)
        continue
      }
      accepted.push({ id: createQueueId(file), file, type: selectedDocumentType })
    }

    if (accepted.length > 0) {
      setQueuedDocuments((current) => [...current, ...accepted])
      setSubmitError(undefined)
      setSubmitSuccess(undefined)
    }
  }

  async function refreshDocuments(companyId: string) {
    const nextDocuments = await companyService.listVerificationDocuments(companyId)
    setDocuments(nextDocuments)
    return nextDocuments
  }

  async function handleDeleteDocument(document: CompanyVerificationDocument) {
    if (!company || isReadOnly) return
    setDeletingDocumentId(document.documentId)
    setDocumentError(undefined)

    try {
      await companyService.deleteVerificationDocument(company.id, document.documentId)
      setDocuments((current) => current.filter((item) => item.documentId !== document.documentId))
      setSubmitSuccess(undefined)
    } catch (error) {
      setDocumentError(getApiErrorEnvelope(error)?.error.message ?? content.feedback.deleteError)
    } finally {
      setDeletingDocumentId(null)
    }
  }

  const submitProfile = handleSubmit(async (values) => {
    if (isReadOnly) return
    const requiresDocument = status === 'NO_COMPANY' || status === 'REJECTED'
    if (requiresDocument && documents.length + queuedDocuments.length === 0) {
      setDocumentError(content.documents.required)
      document.getElementById('verification-documents')?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    setSubmitting(true)
    setSubmitError(undefined)
    setSubmitSuccess(undefined)
    setDocumentError(undefined)
    let activeCompany = company
    let resubmissionPatch: UpdateCompanyPayload | null = null

    try {
      const normalizedValues = normalizeCompanyForm(values)
      if (!activeCompany) {
        activeCompany = await companyService.createCompany(normalizedValues)
        setCompany(activeCompany)
      } else {
        const patch = buildCompanyUpdatePayload(activeCompany, normalizedValues)
        if (status === 'REJECTED') {
          const { name, taxCode, ...profilePatch } = patch
          resubmissionPatch = {
            name: name ?? normalizedValues.name,
            ...(taxCode === undefined ? {} : { taxCode }),
          }
          if (hasPayloadValues(profilePatch)) {
            activeCompany = await companyService.updateCompany(activeCompany.id, profilePatch)
            setCompany(activeCompany)
          }
        } else if (hasPayloadValues(patch)) {
          activeCompany = await companyService.updateCompany(activeCompany.id, patch)
          setCompany(activeCompany)
        }
      }

      if (logoFile) {
        activeCompany = await companyService.uploadLogo(activeCompany.id, logoFile)
        setCompany(activeCompany)
        setLogoFile(null)
      }

      const attachedDocuments: CompanyVerificationDocument[] = []
      for (let index = 0; index < queuedDocuments.length; index += 1) {
        const queued = queuedDocuments[index]
        const uploaded = await companyService.uploadVerificationDocument(
          activeCompany.id,
          queued.file,
          getDocumentStorageType(queued.type),
        )
        const attached = await companyService.attachVerificationDocument(
          activeCompany.id,
          uploaded.id,
          queued.type,
        )
        attachedDocuments.unshift({
          ...attached,
          documentType: uploaded.documentType,
          fileName: uploaded.fileName,
          mimeType: uploaded.mimeType,
          size: uploaded.size,
        })
        setQueuedDocuments(queuedDocuments.slice(index + 1))
      }

      if (attachedDocuments.length > 0) {
        setDocuments((current) => [...attachedDocuments, ...current])
      }

      if (resubmissionPatch) {
        // The current API treats a legal-name PATCH as a rejected company's resubmission signal.
        activeCompany = await companyService.updateCompany(activeCompany.id, resubmissionPatch)
        setCompany(activeCompany)
      }

      reset(companyToFormValues(activeCompany))
      const userId = user?.id
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['recruiter-dashboard'] }),
        ...(userId
          ? [queryClient.invalidateQueries({ queryKey: ['company', 'me', userId] })]
          : []),
        Promise.resolve(refreshUser()),
      ])
      setSubmitSuccess(
        status === 'REJECTED' ? content.feedback.resubmitSuccess : content.feedback.saveSuccess,
      )
    } catch (error) {
      if (activeCompany) {
        setCompany(activeCompany)
        try {
          await refreshDocuments(activeCompany.id)
        } catch {
          // Keep the locally completed steps visible when metadata refresh also fails.
        }
      }
      setSubmitError(getApiErrorEnvelope(error)?.error.message ?? content.feedback.submitError)
    } finally {
      setSubmitting(false)
    }
  })

  if (loading) {
    return (
      <div className="recruiter-verification-page" aria-busy="true">
        <div className="verification-loading-state">
          <span />
          <span />
          <span />
          <p>{content.states.loading}</p>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="recruiter-verification-page">
        <section className="verification-load-error" role="alert">
          <h2>{content.states.errorTitle}</h2>
          <p>{loadError}</p>
          <button onClick={() => void loadProfile()} type="button">{content.actions.retry}</button>
        </section>
      </div>
    )
  }

  const submitLabel = status === 'NO_COMPANY'
    ? content.actions.create
    : status === 'REJECTED'
      ? content.actions.resubmit
      : content.actions.save

  return (
    <div className="recruiter-verification-page">
      {nextPath ? (
        <aside className="verification-next-banner" role="status">
          <h2>{content.nextBanner.title}</h2>
          <p>{content.nextBanner.description}</p>
          <Link className="verification-next-banner__action" to={nextPath}>
            {content.nextBanner.action}
          </Link>
        </aside>
      ) : null}
      <VerificationStatusPanel company={company} locale={locale} translations={content.status} />

      <div className="verification-layout">
        <nav aria-label={content.navigation.label} className="verification-section-nav">
          <a href="#verification-status"><span>00</span>{content.navigation.status}</a>
          <a href="#verification-legal"><span>01</span>{content.navigation.legal}</a>
          <a href="#verification-documents"><span>02</span>{content.navigation.documents}</a>
        </nav>

        <form className="verification-workspace" noValidate onSubmit={submitProfile}>
          <CompanyLegalSection
            company={company}
            control={control}
            disabled={isReadOnly || isSubmitting}
            logoError={logoError}
            logoFile={logoFile}
            logoPreview={logoPreview}
            onLogoChange={handleLogoChange}
            translations={content.legal}
          />

          <VerificationDocumentsSection
            deletingDocumentId={deletingDocumentId}
            disabled={isReadOnly || isSubmitting}
            documents={documents}
            error={documentError}
            onDelete={(document) => void handleDeleteDocument(document)}
            onFiles={handleDocumentFiles}
            onRemoveQueued={(id) => {
              setQueuedDocuments((current) => current.filter((document) => document.id !== id))
              setDocumentError(undefined)
            }}
            onTypeChange={setSelectedDocumentType}
            queuedDocuments={queuedDocuments}
            selectedType={selectedDocumentType}
            translations={content.documents}
          />

          <div className="verification-actions">
            <div aria-live="polite" className="verification-actions__feedback">
              {submitError ? <p className="is-error" role="alert">{submitError}</p> : null}
              {submitSuccess ? <p className="is-success">{submitSuccess}</p> : null}
            </div>
            <Link to="/recruiter">{content.actions.backToDashboard}</Link>
            <button
              data-state={isSubmitting ? 'loading' : submitError ? 'error' : submitSuccess ? 'success' : 'default'}
              disabled={isReadOnly || isSubmitting}
              type="submit"
            >
              {isSubmitting ? content.actions.saving : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
