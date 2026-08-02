import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useToast } from '../../context'
import { useAdminCompanies, useAdminCompanyDocuments, useAdminCompanyStatusAction, useAdminCompanyTrustHistory, useUpdateAdminCompanyTrustLevel, useVerifyAdminCompany } from '../../hooks/useAdminQueries'
import { useTranslations } from '../../i18n'
import { ErrorState } from '../_components/admin/ErrorState'
import { LoadingSkeleton } from '../_components/admin/LoadingSkeleton'
import { ReasonModal } from '../_components/admin/ReasonModal'
import { CompanyDocumentsCard } from './components/CompanyDocumentsCard'
import { CompanyOverviewCard } from './components/CompanyOverviewCard'
import { CompanyQuickStats } from './components/CompanyQuickStats'
import { CompanyReviewPanel } from './components/CompanyReviewPanel'
import { CompanyTrustHistoryCard } from './components/CompanyTrustHistoryCard'

type Action = 'reject' | 'suspend' | 'restore' | 'trust' | null

export function AdminCompanyDetailPage() {
  const { id = '' } = useParams()
  const { pages } = useTranslations()
  const content = pages.adminCompanies
  const toast = useToast()
  const [action, setAction] = useState<Action>(null)
  const [nextTrustLevel, setNextTrustLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const companyQuery = useAdminCompanies({ page: 1, limit: 100 })
  const documentsQuery = useAdminCompanyDocuments(id)
  const historyQuery = useAdminCompanyTrustHistory(id)
  const verifyMutation = useVerifyAdminCompany(id)
  const suspendMutation = useAdminCompanyStatusAction(id, 'suspend')
  const restoreMutation = useAdminCompanyStatusAction(id, 'restore')
  const trustMutation = useUpdateAdminCompanyTrustLevel(id)
  const company = useMemo(() => companyQuery.data?.data.find((item) => item.id === id), [companyQuery.data, id])
  const pending = verifyMutation.isPending || suspendMutation.isPending || restoreMutation.isPending || trustMutation.isPending

  const success = () => { toast.success(content.feedback.actionSuccess); setAction(null) }
  const failure = () => toast.error(content.feedback.actionError)
  const approve = () => verifyMutation.mutate({ action: 'APPROVE' }, { onSuccess: success, onError: failure })
  const submitReason = (reason: string) => {
    if (action === 'reject') verifyMutation.mutate({ action: 'REJECT', reason }, { onSuccess: success, onError: failure })
    if (action === 'suspend') suspendMutation.mutate({ reason }, { onSuccess: success, onError: failure })
    if (action === 'restore') restoreMutation.mutate({ reason }, { onSuccess: success, onError: failure })
    if (action === 'trust') trustMutation.mutate({ trustLevel: nextTrustLevel, reason }, { onSuccess: success, onError: failure })
  }

  if (companyQuery.isPending) return <div className="admin-company-detail-page"><LoadingSkeleton ariaLabel={content.feedback.loading} lines={10} /></div>
  if (companyQuery.isError) return <div className="admin-company-detail-page"><ErrorState actionLabel={content.feedback.retry} description={content.feedback.errorDescription} onRetry={() => void companyQuery.refetch()} title={content.feedback.errorTitle} /></div>
  if (!company) return <div className="admin-company-detail-page"><section className="admin-company-panel admin-company-not-found"><p className="admin-company-not-found__eyebrow">{content.detail.notFoundEyebrow}</p><h2>{content.detail.notFoundTitle}</h2><p>{content.detail.notFoundDescription}</p><Link className="admin-company-action admin-company-action--ghost" to="/admin/companies">{content.detail.backToList}</Link></section></div>

  return <div className="admin-company-detail-page">
    <Link className="admin-company-detail-back" to="/admin/companies">{content.detail.backToList}</Link>
    <div className="admin-company-detail-grid"><div className="admin-company-detail-main"><CompanyOverviewCard company={company} content={content.detail} statusesLabel={content.statuses} /><section aria-labelledby="company-description-title" className="admin-company-panel"><header className="admin-company-panel__header"><h2 id="company-description-title">{content.detail.descriptionTitle}</h2></header><p className="admin-company-description">{company.description || '—'}</p></section><CompanyDocumentsCard companyId={id} content={content.detail} documents={documentsQuery.data ?? []} isError={documentsQuery.isError} isLoading={documentsQuery.isPending} /><CompanyTrustHistoryCard content={content.detail} history={historyQuery.data ?? []} isError={historyQuery.isError} trustLevels={content.trustLevels} /></div><div className="admin-company-detail-aside"><CompanyReviewPanel company={company} content={content.detail} isPending={pending} onApprove={approve} onReject={() => setAction('reject')} onRestore={() => setAction('restore')} onSuspend={() => setAction('suspend')} onTrustChange={(level) => { setNextTrustLevel(level); setAction('trust') }} statusesLabel={content.statuses} trustLevels={content.trustLevels} /><CompanyQuickStats company={company} content={content.detail} /></div></div>
    <ReasonModal cancelLabel={content.actions.cancel} confirmLabel={content.actions.confirm} description={content.actions.reasonDescription} inputLabel={content.actions.reasonLabel} isOpen={action !== null} isPending={pending} onCancel={() => setAction(null)} onConfirm={submitReason} placeholder={content.actions.reasonPlaceholder} requiredMessage={content.actions.reasonRequired} title={action === 'trust' ? content.detail.trustChangeTitle : content.actions.reasonTitle} />
  </div>
}

export default AdminCompanyDetailPage
