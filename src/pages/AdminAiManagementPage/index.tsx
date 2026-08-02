import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../../context'
import { useAdminAiConfig, useAdminAiUsageLogs, useAdminAiUsageSummary, useUpdateAdminAiConfig } from '../../hooks/useAdminAiManagement'
import { useTranslations } from '../../i18n'
import { getApiErrorCode } from '../../lib/api/apiError'
import type { AdminAiUsageLogQuery, UpdateAdminAiConfigPayload } from '../../types/admin.types'
import { LoadingSkeleton } from '../_components/admin/LoadingSkeleton'
import { AdminAiInlineError } from './components/AdminAiInlineError'
import { AdminAiOverview } from './components/AdminAiOverview'
import { AdminAiPageHeader } from './components/AdminAiPageHeader'
import { AdminAiRuntimeConfig } from './components/AdminAiRuntimeConfig'
import { AdminAiTabs, type AdminAiTab } from './components/AdminAiTabs'
import { AdminAiUsageLogs } from './components/AdminAiUsageLogs'

const PAGE_SIZE = 20

export function AdminAiManagementPage() {
  const { pages } = useTranslations()
  const content = pages.adminAiManagement
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [logFilters, setLogFilters] = useState<AdminAiUsageLogQuery>({ page: 1, limit: PAGE_SIZE })
  const configQuery = useAdminAiConfig()
  const summaryQuery = useAdminAiUsageSummary()
  const logsQuery = useAdminAiUsageLogs(logFilters)
  const updateConfig = useUpdateAdminAiConfig()
  const tabParam = searchParams.get('tab')
  const activeTab: AdminAiTab = tabParam === 'config' || tabParam === 'logs' ? tabParam : 'overview'
  const total = logsQuery.data?.meta.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const allModels = useMemo(() => configQuery.data ? [...configQuery.data.supportedModels.GEMINI, ...configQuery.data.supportedModels.OPENAI].filter((model, index, list) => list.findIndex((item) => item.id === model.id) === index) : [], [configQuery.data])

  const save = (payload: UpdateAdminAiConfigPayload) => updateConfig.mutate(payload, { onSuccess: () => toast.success(content.config.success), onError: (error) => toast.error(`${content.config.error} (${getApiErrorCode(error) ?? 'COMMON.UNKNOWN_ERROR'})`) })
  const copy = (value: string) => { void navigator.clipboard.writeText(value).then(() => toast.success(content.logs.copied)).catch(() => toast.error(content.config.error)) }
  const changeTab = (tab: AdminAiTab) => { const next = new URLSearchParams(searchParams); next.set('tab', tab); setSearchParams(next, { replace: true }) }
  const isRefreshing = configQuery.isFetching || summaryQuery.isFetching || logsQuery.isFetching
  const refreshAll = () => { void Promise.all([configQuery.refetch(), summaryQuery.refetch(), logsQuery.refetch()]) }
  const status = configQuery.isError || summaryQuery.isError || logsQuery.isError ? 'degraded' : configQuery.data ? 'healthy' : 'unknown'

  return <div className="admin-ai-page">
    <AdminAiPageHeader content={content} isRefreshing={isRefreshing} onRefresh={refreshAll} status={status} />
    <div className="admin-ai-page__notes"><span>{content.notes.newRequests}</span><span>{content.notes.apiKeys}</span></div>
    <AdminAiTabs activeTab={activeTab} content={content.tabs} onChange={changeTab} />
    {activeTab === 'overview' && <AdminAiOverview config={configQuery.data} content={content} data={summaryQuery.data} isError={summaryQuery.isError} isLoading={summaryQuery.isPending} onRetry={() => void summaryQuery.refetch()} />}
    {activeTab === 'config' && (configQuery.isPending ? <section className="admin-ai-panel"><LoadingSkeleton ariaLabel={content.config.title} lines={7} /></section> : configQuery.isError || !configQuery.data ? <section className="admin-ai-panel admin-ai-panel--compact"><AdminAiInlineError actionLabel={content.config.retry} description={content.config.loadErrorDescription} onRetry={() => void configQuery.refetch()} title={content.config.loadErrorTitle} /></section> : <AdminAiRuntimeConfig config={configQuery.data} content={content} isPending={updateConfig.isPending} onSave={save} />)}
    {activeTab === 'logs' && <AdminAiUsageLogs content={content} data={logsQuery.data?.data ?? []} filters={logFilters} isError={logsQuery.isError} isFetching={logsQuery.isFetching} isLoading={logsQuery.isPending} models={allModels} onCopy={copy} onFilterChange={setLogFilters} onPageChange={(page) => setLogFilters((current) => ({ ...current, page }))} onRetry={() => void logsQuery.refetch()} total={total} totalPages={totalPages} />}
  </div>
}

export default AdminAiManagementPage
