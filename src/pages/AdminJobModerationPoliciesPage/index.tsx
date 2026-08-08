import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useToast } from '../../context'
import { adminQueryKeys } from '../../hooks/adminQueryKeys'
import { useTranslations } from '../../i18n'
import { getApiErrorEnvelope } from '../../lib/api/apiError'
import { adminJobModerationPoliciesService } from '../../services/admin'
import type { CompanyTrustLevel } from '../../types/admin.types'
import type { JobExperienceLevel, JobType, JobWorkingType } from '../../types/job.types'
import type {
  JobModerationKeywordRule,
  JobModerationPolicy,
  JobModerationPolicyStatus,
  JobModerationRules,
  JobModerationSalaryRule,
  JobModerationTestJob,
  UpdateJobModerationPolicyPayload,
} from '../../types/jobModerationPolicy.types'
import { ConfirmModal } from '../_components'
import './admin-job-moderation-policies.css'

const experienceLevels: JobExperienceLevel[] = ['INTERN', 'FRESHER', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD']
const policyStatuses: Array<JobModerationPolicyStatus | 'ALL'> = ['ALL', 'ACTIVE', 'DRAFT', 'UNPUBLISHED']
const trustLevels: CompanyTrustLevel[] = ['LOW', 'MEDIUM', 'HIGH']
const workingTypes: JobWorkingType[] = ['ONSITE', 'REMOTE', 'HYBRID']
const employmentTypes: JobType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']
const keywordRuleGroups = [
  { id: 'RISK_UPFRONT_PAYMENT', label: 'Upfront payment' },
  { id: 'RISK_SENSITIVE_DOCUMENT_REQUEST', label: 'Sensitive document request' },
  { id: 'RISK_EXTERNAL_FORM', label: 'External form' },
  { id: 'RISK_SHORTENED_LINK', label: 'Shortened link' },
  { id: 'RISK_SALARY_ANOMALY', label: 'Salary anomaly' },
  { id: 'RISK_MISSING_CONTENT', label: 'Missing content' },
  { id: 'RISK_SPAM_TITLE', label: 'Spam title' },
  { id: 'RISK_LOW_COMPANY_TRUST', label: 'Low company trust' },
] as const
const defaultKeywordRuleGroupId = keywordRuleGroups[0].id

const starterRules: JobModerationRules = {
  thresholds: { medium: 25, high: 50, critical: 80 },
  keywordRules: [],
  contentRules: {
    minDescriptionLength: 100,
    descriptionScore: 20,
    minRequirementsLength: 30,
    requirementsScore: 15,
    missingLocationScore: 15,
  },
  salaryRules: {
    maxByExperienceLevel: {
      INTERN: { max: 0, score: 0 },
      FRESHER: { max: 0, score: 0 },
      JUNIOR: { max: 0, score: 0 },
      MIDDLE: { max: 0, score: 0 },
      SENIOR: { max: 0, score: 0 },
      LEAD: { max: 0, score: 0 },
    },
  },
  linkRules: {
    shortenedDomains: [],
    shortenedUrlScore: 25,
    maxExternalLinks: 3,
    tooManyExternalLinksScore: 20,
    externalFormDomains: [],
    externalFormScore: 10,
  },
  spamRules: {
    allCapsTitleScore: 10,
    maxTitleSymbols: 5,
    excessiveSymbolsScore: 10,
    repeatedWordThreshold: 12,
    repeatedWordScore: 10,
  },
  crossSignalRules: {
    upfrontPaymentSignals: [],
    remoteUpfrontPaymentScore: 60,
    internshipNoExperienceSalaryMax: 0,
    internshipNoExperienceSalaryScore: 0,
  },
  companyTrustRules: { lowTrustScore: 20 },
}

const sampleJob: JobModerationTestJob = {
  title: 'Remote Sales Collaborator',
  description: 'Lien he telegram va dong phi ho so truoc khi nhan viec.',
  requirements: 'Can giao tiep tot.',
  skills: ['Sales'],
  salaryMin: 10000000,
  salaryMax: 50000000,
  experienceLevel: 'FRESHER',
  workingType: 'REMOTE',
  employmentType: 'PART_TIME',
  location: 'Remote',
}

type EditorMode = 'list' | 'detail' | 'create'
type PendingConfirmAction = 'archive' | 'deleteKeyword' | 'loadDefault' | 'publish'

function canEditRules(status: JobModerationPolicyStatus | undefined, mode: EditorMode) {
  return mode === 'create' || status === 'DRAFT' || status === 'UNPUBLISHED'
}

function canEditName(status: JobModerationPolicyStatus | undefined, mode: EditorMode) {
  return mode === 'create' || status === 'DRAFT' || status === 'ACTIVE' || status === 'UNPUBLISHED'
}

function canArchive(status: JobModerationPolicyStatus | undefined) {
  return status === 'DRAFT' || status === 'UNPUBLISHED'
}

function canPublishOrRestore(status: JobModerationPolicyStatus | undefined) {
  return status === 'DRAFT' || status === 'UNPUBLISHED'
}

function cloneRules(rules: JobModerationRules): JobModerationRules {
  return structuredClone(rules)
}

function getErrorMessage(error: unknown, fallback: string) {
  return getApiErrorEnvelope(error)?.error.message ?? fallback
}

function formatDate(value: string | null | undefined, fallback: string) {
  if (!value) return fallback
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function parseTags(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function labelFromRuleId(id: string) {
  const fixedGroup = keywordRuleGroups.find((group) => group.id === id)
  if (fixedGroup) return fixedGroup.label

  const readableId = id || 'RISK_UNKNOWN_RULE'

  return readableId
    .replace(/^RISK_/, '')
    .split('_')
    .filter(Boolean)
    .map((part) => part[0] + part.slice(1).toLowerCase())
    .join(' ')
}

function NumberField({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: number) => void
  value: number
}) {
  return (
    <label className="moderation-field">
      <span>{label}</span>
      <input min="0" onChange={(event) => onChange(Number(event.target.value))} type="number" value={value} />
    </label>
  )
}

function TextField({
  label,
  onChange,
  readOnly = false,
  value,
}: {
  label: string
  onChange: (value: string) => void
  readOnly?: boolean
  value: string
}) {
  return (
    <label className="moderation-field">
      <span>{label}</span>
      <input onChange={(event) => onChange(event.target.value)} readOnly={readOnly} type="text" value={value} />
    </label>
  )
}

function SelectField<TValue extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: TValue) => void
  options: TValue[]
  value: TValue
}) {
  return (
    <label className="moderation-field">
      <span>{label}</span>
      <select onChange={(event) => onChange(event.target.value as TValue)} value={value}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function Section({ children, description, title }: { children: ReactNode; description?: string; title: string }) {
  return (
    <section className="moderation-section">
      <div className="moderation-section__header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function AdminJobModerationPoliciesPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { pages } = useTranslations()
  const content = pages.adminJobModerationPolicies
  const [status, setStatus] = useState<JobModerationPolicyStatus | 'ALL'>('ALL')
  const [policySearch, setPolicySearch] = useState('')
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null)
  const [mode, setMode] = useState<EditorMode>('list')
  const [name, setName] = useState('Vietnam job safety policy')
  const [rules, setRules] = useState<JobModerationRules>(() => cloneRules(starterRules))
  const [selectedKeywordIndex, setSelectedKeywordIndex] = useState<number | null>(null)
  const [selectedRuleGroupId, setSelectedRuleGroupId] = useState<string>(defaultKeywordRuleGroupId)
  const [pendingConfirmAction, setPendingConfirmAction] = useState<PendingConfirmAction | null>(null)
  const [companyTrustLevel, setCompanyTrustLevel] = useState<CompanyTrustLevel>('MEDIUM')
  const [testJob, setTestJob] = useState<JobModerationTestJob>(sampleJob)

  const listQuery = useQuery({
    queryKey: adminQueryKeys.jobModerationPolicyList({ status }),
    queryFn: () => adminJobModerationPoliciesService.list(status === 'ALL' ? {} : { status }),
    placeholderData: keepPreviousData,
  })
  const activePolicyQuery = useQuery({
    queryKey: adminQueryKeys.jobModerationPolicyList({ status: 'ACTIVE' }),
    queryFn: () => adminJobModerationPoliciesService.list({ status: 'ACTIVE' }),
  })
  const defaultRulesQuery = useQuery({
    queryKey: adminQueryKeys.jobModerationDefaultRules(),
    queryFn: adminJobModerationPoliciesService.getDefaultRules,
    enabled: false,
  })
  const selectedPolicyQuery = useQuery({
    queryKey: adminQueryKeys.jobModerationPolicyDetail(selectedPolicyId ?? 'missing'),
    queryFn: () => adminJobModerationPoliciesService.get(selectedPolicyId as string),
    enabled: Boolean(selectedPolicyId) && mode === 'detail',
  })

  const policies = useMemo(() => listQuery.data ?? [], [listQuery.data])
  const filteredPolicies = useMemo(() => {
    const keyword = policySearch.trim().toLowerCase()
    if (!keyword) return policies

    return policies.filter((policy) =>
      policy.name.toLowerCase().includes(keyword) ||
      policy.id.toLowerCase().includes(keyword),
    )
  }, [policies, policySearch])
  const activePolicy = activePolicyQuery.data?.[0]
  const selectedPolicy = selectedPolicyQuery.data
  const keywordGroupOptions = useMemo(() => {
    const fixedOptions = keywordRuleGroups.map((group) => ({ id: group.id, label: group.label }))
    const fixedIds = new Set<string>(fixedOptions.map((group) => group.id))
    const existingOptions = rules.keywordRules
      .map((rule) => rule.id)
      .filter((id, index, ids) => id && !fixedIds.has(id) && ids.indexOf(id) === index)
      .map((id) => ({ id, label: labelFromRuleId(id) }))

    return [...fixedOptions, ...existingOptions]
  }, [rules.keywordRules])
  const selectedKeywordRule = selectedKeywordIndex === null ? null : rules.keywordRules[selectedKeywordIndex] ?? null
  const selectedKeywordName = selectedKeywordRule
    ? selectedKeywordRule.keyword.trim() || labelFromRuleId(selectedKeywordRule.id)
    : ''
  const rulesEditable = canEditRules(selectedPolicy?.status, mode)
  const nameEditable = canEditName(selectedPolicy?.status, mode)
  const editorReadOnly = Boolean(mode === 'detail' && selectedPolicy?.status === 'ARCHIVED')
  const publishActionLabel = selectedPolicy?.status === 'UNPUBLISHED' ? content.actions.restoreAsActive : content.actions.publish
  const publishActionPendingLabel = selectedPolicy?.status === 'UNPUBLISHED' ? content.actions.restoring : content.actions.publishing
  const saveActionLabel = selectedPolicy?.status === 'ACTIVE' || selectedPolicy?.status === 'UNPUBLISHED'
    ? content.actions.saveChanges
    : content.actions.saveDraft
  const selectedStatusLabel = status === 'ALL' ? content.fields.allStatuses : content.statuses[status]
  useEffect(() => {
    if (mode !== 'detail' || !selectedPolicy) return
    setName(selectedPolicy.name)
    setRules(cloneRules(selectedPolicy.rules))
    setSelectedKeywordIndex(null)
    setSelectedRuleGroupId(defaultKeywordRuleGroupId)
  }, [mode, selectedPolicy])

  const invalidatePolicies = async (policyId?: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.jobModerationPolicyLists() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.jobModerationPolicyDetails() }),
      ...(policyId ? [queryClient.invalidateQueries({ queryKey: adminQueryKeys.jobModerationPolicyDetail(policyId) })] : []),
    ])
  }

  const createMutation = useMutation({
    mutationFn: adminJobModerationPoliciesService.create,
    onSuccess: async (policy) => {
      await invalidatePolicies(policy.id)
      setStatus('DRAFT')
      setMode('detail')
      setSelectedPolicyId(policy.id)
      toast.success(content.feedback.created)
    },
    onError: (error) => toast.error(getErrorMessage(error, content.feedback.createError)),
  })
  const updateMutation = useMutation({
    mutationFn: ({ policyId, payload }: { policyId: string; payload: UpdateJobModerationPolicyPayload }) =>
      adminJobModerationPoliciesService.update(policyId, payload),
    onSuccess: async (policy) => {
      await invalidatePolicies(policy.id)
      toast.success(content.feedback.saved)
    },
    onError: (error) => toast.error(getErrorMessage(error, content.feedback.saveError)),
  })
  const publishMutation = useMutation({
    mutationFn: adminJobModerationPoliciesService.publish,
    onSuccess: async (policy) => {
      await invalidatePolicies(policy.id)
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.jobModerationPolicyList({ status: 'ACTIVE' }) })
      setStatus('ACTIVE')
      setSelectedPolicyId(policy.id)
      toast.success(content.feedback.published)
    },
    onError: (error) => toast.error(getErrorMessage(error, content.feedback.publishError)),
  })
  const archiveMutation = useMutation({
    mutationFn: adminJobModerationPoliciesService.archive,
    onSuccess: async (policy) => {
      await invalidatePolicies(policy.id)
      setStatus('ALL')
      setMode('list')
      setSelectedPolicyId(null)
      setSelectedKeywordIndex(null)
      setPendingConfirmAction(null)
      toast.success(content.feedback.archived)
    },
    onError: (error) => toast.error(getErrorMessage(error, content.feedback.archiveError)),
  })
  const testMutation = useMutation({
    mutationFn: adminJobModerationPoliciesService.test,
    onError: (error) => toast.error(getErrorMessage(error, content.feedback.testError)),
  })

  const updateRules = (updater: (draft: JobModerationRules) => void) => {
    setRules((current) => {
      const next = cloneRules(current)
      updater(next)
      return next
    })
  }
  const updateKeywordRule = (index: number, patch: Partial<JobModerationKeywordRule>) => {
    updateRules((draft) => {
      draft.keywordRules[index] = { ...draft.keywordRules[index], ...patch }
    })
  }
  const updateSalaryRule = (level: JobExperienceLevel, patch: Partial<JobModerationSalaryRule>) => {
    updateRules((draft) => {
      draft.salaryRules.maxByExperienceLevel[level] = {
        ...draft.salaryRules.maxByExperienceLevel[level],
        ...patch,
      }
    })
  }

  const beginCreateDraft = () => {
    setMode('create')
    setSelectedPolicyId(null)
    setName('Vietnam job safety policy')
    setRules(cloneRules(starterRules))
    setSelectedKeywordIndex(null)
    setSelectedRuleGroupId(defaultKeywordRuleGroupId)
    setTestJob(sampleJob)
  }
  const selectPolicy = (policy: JobModerationPolicy) => {
    setMode('detail')
    setSelectedPolicyId(policy.id)
    setSelectedKeywordIndex(null)
  }
  const loadDefaultTemplate = async () => {
    const result = await defaultRulesQuery.refetch()
    if (result.data) {
      setRules(cloneRules(result.data))
      setSelectedKeywordIndex(null)
      setPendingConfirmAction(null)
      toast.info(content.feedback.defaultLoaded)
    }
  }
  const addKeywordGroup = () => {
    const sourceRule = rules.keywordRules.find((rule) => rule.id === selectedRuleGroupId)

    updateRules((draft) => {
      draft.keywordRules.push({
        enabled: sourceRule?.enabled ?? true,
        id: selectedRuleGroupId,
        keyword: '',
        reason: sourceRule?.reason ?? '',
        score: sourceRule?.score ?? 10,
      })
    })
    setSelectedKeywordIndex(rules.keywordRules.length)
  }
  const addKeywordAlias = () => {
    if (selectedKeywordIndex === null) {
      toast.warning(content.feedback.selectKeyword)
      return
    }
    const source = rules.keywordRules[selectedKeywordIndex]
    if (!source) return
    updateRules((draft) => {
      draft.keywordRules.splice(selectedKeywordIndex + 1, 0, {
        ...source,
        keyword: '',
      })
    })
    setSelectedKeywordIndex(selectedKeywordIndex + 1)
  }
  const deleteSelectedKeyword = () => {
    if (selectedKeywordIndex === null) {
      toast.warning(content.feedback.selectKeyword)
      return
    }
    updateRules((draft) => {
      draft.keywordRules.splice(selectedKeywordIndex, 1)
    })
    setSelectedKeywordIndex(null)
    setPendingConfirmAction(null)
  }
  const requestDeleteSelectedKeyword = () => {
    if (selectedKeywordIndex === null) {
      toast.warning(content.feedback.selectKeyword)
      return
    }
    setPendingConfirmAction('deleteKeyword')
  }
  const saveDraft = () => {
    if (!name.trim()) {
      toast.error(content.feedback.nameRequired)
      return
    }
    if (mode === 'create') {
      createMutation.mutate({ name: name.trim(), rules })
      return
    }
    if (selectedPolicy?.status === 'ACTIVE') {
      updateMutation.mutate({ policyId: selectedPolicy.id, payload: { name: name.trim() } })
      return
    }
    if (selectedPolicy?.status === 'DRAFT' || selectedPolicy?.status === 'UNPUBLISHED') {
      updateMutation.mutate({ policyId: selectedPolicy.id, payload: { name: name.trim(), rules } })
    }
  }
  const testRules = () => {
    testMutation.mutate({
      companyTrustLevel,
      job: testJob,
      rules: rulesEditable ? rules : undefined,
    })
  }
  const confirmPendingAction = () => {
    if (pendingConfirmAction === 'loadDefault') {
      void loadDefaultTemplate()
      return
    }
    if (pendingConfirmAction === 'deleteKeyword') {
      deleteSelectedKeyword()
      return
    }
    if (pendingConfirmAction === 'publish' && selectedPolicy) {
      publishMutation.mutate(selectedPolicy.id, { onSuccess: () => setPendingConfirmAction(null) })
      return
    }
    if (pendingConfirmAction === 'archive' && selectedPolicy) {
      archiveMutation.mutate(selectedPolicy.id)
    }
  }
  const getConfirmCopy = () => {
    const policyName = selectedPolicy?.name ?? name

    if (pendingConfirmAction === 'loadDefault') {
      return {
        confirmLabel: content.actions.loadDefault,
        description: content.confirmations.loadDefaultDescription,
        title: content.confirmations.loadDefaultTitle,
      }
    }
    if (pendingConfirmAction === 'deleteKeyword') {
      return {
        confirmLabel: content.actions.deleteSelected,
        description: content.confirmations.deleteKeywordDescription.replace('{{keyword}}', selectedKeywordName),
        title: content.confirmations.deleteKeywordTitle,
      }
    }
    if (pendingConfirmAction === 'publish') {
      const isRestore = selectedPolicy?.status === 'UNPUBLISHED'
      return {
        confirmLabel: isRestore ? content.actions.restoreAsActive : content.actions.publish,
        description: (isRestore ? content.confirmations.restoreDescription : content.confirmations.publishDescription)
          .replace('{{name}}', policyName),
        title: isRestore ? content.confirmations.restoreTitle : content.confirmations.publishTitle,
      }
    }
    if (pendingConfirmAction === 'archive') {
      return {
        confirmLabel: content.actions.archive,
        description: content.confirmations.archiveDescription.replace('{{name}}', policyName),
        title: content.confirmations.archiveTitle,
      }
    }

    return { confirmLabel: saveActionLabel, description: '', title: '' }
  }
  const closeEditor = useCallback(() => {
    setMode('list')
    setSelectedPolicyId(null)
    setSelectedKeywordIndex(null)
    setSelectedRuleGroupId(defaultKeywordRuleGroupId)
    setPendingConfirmAction(null)
    testMutation.reset()
  }, [testMutation])

  useEffect(() => {
    if (mode === 'list' || pendingConfirmAction) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeEditor()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeEditor, mode, pendingConfirmAction])

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    publishMutation.isPending ||
    archiveMutation.isPending
  const confirmCopy = getConfirmCopy()
  const isConfirmPending = defaultRulesQuery.isFetching || publishMutation.isPending || archiveMutation.isPending

  return (
    <div className="admin-moderation-page">
      <header className="admin-moderation-hero">
        <div>
          <p className="admin-moderation-eyebrow">{content.hero.eyebrow}</p>
          <h1>{content.hero.title}</h1>
          <p>{content.hero.description}</p>
        </div>
        <button onClick={beginCreateDraft} type="button">{content.actions.createDraft}</button>
      </header>

      <section className="admin-moderation-summary">
        <article>
          <span>{content.summary.activePolicy}</span>
          <strong>{activePolicy?.name ?? content.summary.notLoaded}</strong>
          <small>{activePolicy ? `${content.summary.version} ${activePolicy.version}` : content.summary.noActive}</small>
        </article>
        <article>
          <span>{content.summary.visiblePolicies}</span>
          <strong>{filteredPolicies.length}</strong>
          <small>
            {content.summary.currentFilter}: {selectedStatusLabel}
            {policySearch.trim() ? ` - ${content.summary.searching}: ${policySearch.trim()}` : ''}
          </small>
        </article>
        <article>
          <span>{content.summary.selected}</span>
          <strong>{mode === 'create' ? content.summary.newDraft : mode === 'detail' ? selectedPolicy?.name ?? content.summary.loading : content.summary.none}</strong>
          <small>{mode === 'create' ? content.summary.unsavedPolicy : mode === 'detail' && selectedPolicy ? `${content.statuses[selectedPolicy.status]} v${selectedPolicy.version}` : content.summary.chooseRow}</small>
        </article>
      </section>

      <section className="moderation-policy-browser">
        <div className="moderation-browser-toolbar">
          <label className="moderation-policy-filter-field moderation-policy-filter-field--search">
            <span>{content.fields.searchPolicy}</span>
            <div className="moderation-policy-search">
              <Search size={16} />
              <input
                onChange={(event) => setPolicySearch(event.target.value)}
                placeholder={content.fields.searchPolicyPlaceholder}
                type="search"
                value={policySearch}
              />
            </div>
          </label>
          <label className="moderation-policy-filter-field">
            <span>{content.fields.status}</span>
            <select
              onChange={(event) => {
                setStatus(event.target.value as JobModerationPolicyStatus | 'ALL')
                setMode('list')
                setSelectedPolicyId(null)
              }}
              value={status}
            >
              {policyStatuses.map((item) => (
                <option key={item} value={item}>
                  {item === 'ALL' ? content.fields.allStatuses : content.statuses[item]}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => void listQuery.refetch()} type="button">{content.actions.refresh}</button>
        </div>
        {listQuery.isError ? (
          <div className="admin-moderation-state admin-moderation-state--error">
            <p>{content.feedback.loadError}</p>
            <button onClick={() => void listQuery.refetch()} type="button">{content.actions.retry}</button>
          </div>
        ) : null}
        <div className="moderation-table-wrap">
          <table className="moderation-policy-table">
            <thead>
              <tr>
                <th>{content.table.name}</th>
                <th>{content.table.status}</th>
                <th>{content.table.version}</th>
                <th>{content.table.rules}</th>
                <th>{content.table.updated}</th>
                <th>{content.table.action}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((policy) => (
                <tr className={selectedPolicyId === policy.id ? 'is-selected' : ''} key={policy.id}>
                  <td><strong>{policy.name}</strong><small>{policy.id}</small></td>
                  <td><span className={`moderation-status moderation-status--${policy.status.toLowerCase()}`}>{content.statuses[policy.status]}</span></td>
                  <td>{policy.version}</td>
                  <td>{content.table.keywords.replace('{{count}}', String(policy.rules.keywordRules.length))}</td>
                  <td>{formatDate(policy.updatedAt, content.misc.never)}</td>
                  <td><button onClick={() => selectPolicy(policy)} type="button">{content.actions.viewDetail}</button></td>
                </tr>
              ))}
              {!filteredPolicies.length && !listQuery.isLoading ? (
                <tr><td colSpan={6}>{content.table.empty}</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {mode !== 'list' ? (
        <div
          className="moderation-drawer-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditor()
            }
          }}
          role="presentation"
        >
          <aside aria-label={content.drawer.detailFallbackTitle} className="moderation-drawer">
            <header className="moderation-drawer__header">
              <div>
                <span>{mode === 'create' ? content.summary.newDraft : selectedPolicy ? content.statuses[selectedPolicy.status] : content.drawer.loading}</span>
                <h2>{mode === 'create' ? content.drawer.createTitle : selectedPolicy?.name ?? content.drawer.detailFallbackTitle}</h2>
                <p>{mode === 'create' ? content.drawer.createDescription : content.drawer.detailDescription}</p>
              </div>
              <button aria-label={content.actions.close} onClick={closeEditor} type="button">x</button>
            </header>

            <main className="admin-moderation-editor">
          {selectedPolicyQuery.isLoading && mode === 'detail' ? <p className="admin-moderation-state">{content.drawer.loading}</p> : null}
          {editorReadOnly || (mode === 'detail' && selectedPolicy?.status === 'ACTIVE') ? (
            <p className="admin-moderation-lock">
              {(editorReadOnly ? content.drawer.readOnly : content.drawer.activeRulesLocked)
                .replace('{{status}}', selectedPolicy?.status ?? '')}
            </p>
          ) : null}

          <Section
            description={mode === 'create' ? content.sections.summaryCreateDescription : content.sections.summaryDetailDescription}
            title={mode === 'create' ? content.sections.summaryCreateTitle : content.sections.summaryDetailTitle}
          >
            <div className="moderation-grid moderation-grid--three">
              <TextField label={content.fields.policyName} onChange={setName} readOnly={!nameEditable || isMutating} value={name} />
              <label className="moderation-field">
                <span>{content.fields.status}</span>
                <input readOnly value={mode === 'create' ? content.misc.newDraftStatus : selectedPolicy ? content.statuses[selectedPolicy.status] : ''} />
              </label>
              <label className="moderation-field">
                <span>{content.fields.version}</span>
                <input readOnly value={mode === 'create' ? content.misc.notCreated : selectedPolicy?.version ?? ''} />
              </label>
            </div>
            <dl className="admin-moderation-meta">
              <div><dt>{content.fields.created}</dt><dd>{formatDate(selectedPolicy?.createdAt, content.misc.never)}</dd></div>
              <div><dt>{content.fields.updated}</dt><dd>{formatDate(selectedPolicy?.updatedAt, content.misc.never)}</dd></div>
              <div><dt>{content.fields.createdBy}</dt><dd>{selectedPolicy?.createdByUserId ?? '-'}</dd></div>
              <div><dt>{content.fields.updatedBy}</dt><dd>{selectedPolicy?.updatedByUserId ?? '-'}</dd></div>
            </dl>
          </Section>

          <fieldset disabled={!rulesEditable || isMutating}>
            <Section title={content.sections.thresholds} description={content.sections.thresholdsDescription}>
              <div className="moderation-grid moderation-grid--three">
                <NumberField label={content.ruleFields.mediumThreshold} onChange={(value) => updateRules((draft) => { draft.thresholds.medium = value })} value={rules.thresholds.medium} />
                <NumberField label={content.ruleFields.highThreshold} onChange={(value) => updateRules((draft) => { draft.thresholds.high = value })} value={rules.thresholds.high} />
                <NumberField label={content.ruleFields.criticalThreshold} onChange={(value) => updateRules((draft) => { draft.thresholds.critical = value })} value={rules.thresholds.critical} />
              </div>
            </Section>

            <Section title={content.sections.keywordRules} description={content.sections.keywordDescription}>
              <div className="moderation-keyword-actions">
                <label className="moderation-keyword-group-field">
                  <span>{content.fields.ruleGroup}</span>
                  <select
                    onChange={(event) => setSelectedRuleGroupId(event.target.value)}
                    value={selectedRuleGroupId}
                  >
                    {keywordGroupOptions.map((group) => (
                      <option key={group.id} value={group.id}>{group.label}</option>
                    ))}
                  </select>
                </label>
                <button onClick={addKeywordGroup} type="button">{content.actions.addKeyword}</button>
                <button disabled={selectedKeywordIndex === null} onClick={addKeywordAlias} type="button">{content.actions.addAlias}</button>
                <button disabled={selectedKeywordIndex === null} onClick={requestDeleteSelectedKeyword} type="button">{content.actions.deleteSelected}</button>
              </div>
              <div className="moderation-table-wrap">
                <table className="moderation-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>{content.fields.status}</th>
                      <th>{content.fields.ruleGroup}</th>
                      <th>{content.fields.keywordAlias}</th>
                      <th>{content.fields.score}</th>
                      <th>{content.fields.reason}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.keywordRules.map((rule, index) => (
                      <tr className={selectedKeywordIndex === index ? 'is-selected' : ''} key={`${rule.id}-${index}`}>
                        <td><input checked={selectedKeywordIndex === index} onChange={() => setSelectedKeywordIndex(index)} type="radio" /></td>
                        <td><input checked={rule.enabled} onChange={(event) => updateKeywordRule(index, { enabled: event.target.checked })} type="checkbox" /></td>
                        <td>
                          <select
                            onChange={(event) => updateKeywordRule(index, { id: event.target.value })}
                            value={rule.id}
                          >
                            {keywordGroupOptions.map((group) => (
                              <option key={group.id} value={group.id}>{group.label}</option>
                            ))}
                          </select>
                        </td>
                        <td><input onChange={(event) => updateKeywordRule(index, { keyword: event.target.value })} value={rule.keyword} /></td>
                        <td><input min="0" onChange={(event) => updateKeywordRule(index, { score: Number(event.target.value) })} type="number" value={rule.score} /></td>
                        <td><input onChange={(event) => updateKeywordRule(index, { reason: event.target.value })} value={rule.reason} /></td>
                      </tr>
                    ))}
                    {!rules.keywordRules.length ? (
                      <tr><td colSpan={6}>{content.table.empty}</td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title={content.sections.contentRules}>
              <div className="moderation-grid moderation-grid--three">
                <NumberField label={content.ruleFields.minDescriptionLength} onChange={(value) => updateRules((draft) => { draft.contentRules.minDescriptionLength = value })} value={rules.contentRules.minDescriptionLength} />
                <NumberField label={content.ruleFields.descriptionScore} onChange={(value) => updateRules((draft) => { draft.contentRules.descriptionScore = value })} value={rules.contentRules.descriptionScore} />
                <NumberField label={content.ruleFields.minRequirementsLength} onChange={(value) => updateRules((draft) => { draft.contentRules.minRequirementsLength = value })} value={rules.contentRules.minRequirementsLength} />
                <NumberField label={content.ruleFields.requirementsScore} onChange={(value) => updateRules((draft) => { draft.contentRules.requirementsScore = value })} value={rules.contentRules.requirementsScore} />
                <NumberField label={content.ruleFields.missingLocationScore} onChange={(value) => updateRules((draft) => { draft.contentRules.missingLocationScore = value })} value={rules.contentRules.missingLocationScore} />
              </div>
            </Section>

            <Section title={content.sections.salaryRules}>
              <div className="moderation-table-wrap">
                <table className="moderation-table">
                  <thead><tr><th>{content.ruleFields.experience}</th><th>{content.ruleFields.maximumSalary}</th><th>{content.ruleFields.score}</th></tr></thead>
                  <tbody>
                    {experienceLevels.map((level) => (
                      <tr key={level}>
                        <td><strong>{level}</strong></td>
                        <td><input min="0" onChange={(event) => updateSalaryRule(level, { max: Number(event.target.value) })} type="number" value={rules.salaryRules.maxByExperienceLevel[level].max} /></td>
                        <td><input min="0" onChange={(event) => updateSalaryRule(level, { score: Number(event.target.value) })} type="number" value={rules.salaryRules.maxByExperienceLevel[level].score} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section title={content.sections.linkSpamTrust}>
              <div className="moderation-grid moderation-grid--three">
                <TextField label={content.ruleFields.shortenedDomains} onChange={(value) => updateRules((draft) => { draft.linkRules.shortenedDomains = parseTags(value) })} value={rules.linkRules.shortenedDomains.join(', ')} />
                <NumberField label={content.ruleFields.shortenedUrlScore} onChange={(value) => updateRules((draft) => { draft.linkRules.shortenedUrlScore = value })} value={rules.linkRules.shortenedUrlScore} />
                <NumberField label={content.ruleFields.maxExternalLinks} onChange={(value) => updateRules((draft) => { draft.linkRules.maxExternalLinks = value })} value={rules.linkRules.maxExternalLinks} />
                <NumberField label={content.ruleFields.tooManyLinksScore} onChange={(value) => updateRules((draft) => { draft.linkRules.tooManyExternalLinksScore = value })} value={rules.linkRules.tooManyExternalLinksScore} />
                <TextField label={content.ruleFields.externalFormDomains} onChange={(value) => updateRules((draft) => { draft.linkRules.externalFormDomains = parseTags(value) })} value={rules.linkRules.externalFormDomains.join(', ')} />
                <NumberField label={content.ruleFields.externalFormScore} onChange={(value) => updateRules((draft) => { draft.linkRules.externalFormScore = value })} value={rules.linkRules.externalFormScore} />
                <NumberField label={content.ruleFields.allCapsTitleScore} onChange={(value) => updateRules((draft) => { draft.spamRules.allCapsTitleScore = value })} value={rules.spamRules.allCapsTitleScore} />
                <NumberField label={content.ruleFields.maxTitleSymbols} onChange={(value) => updateRules((draft) => { draft.spamRules.maxTitleSymbols = value })} value={rules.spamRules.maxTitleSymbols} />
                <NumberField label={content.ruleFields.excessiveSymbolsScore} onChange={(value) => updateRules((draft) => { draft.spamRules.excessiveSymbolsScore = value })} value={rules.spamRules.excessiveSymbolsScore} />
                <NumberField label={content.ruleFields.repeatedWordThreshold} onChange={(value) => updateRules((draft) => { draft.spamRules.repeatedWordThreshold = value })} value={rules.spamRules.repeatedWordThreshold} />
                <NumberField label={content.ruleFields.repeatedWordScore} onChange={(value) => updateRules((draft) => { draft.spamRules.repeatedWordScore = value })} value={rules.spamRules.repeatedWordScore} />
                <TextField label={content.ruleFields.paymentSignals} onChange={(value) => updateRules((draft) => { draft.crossSignalRules.upfrontPaymentSignals = parseTags(value) })} value={rules.crossSignalRules.upfrontPaymentSignals.join(', ')} />
                <NumberField label={content.ruleFields.remoteUpfrontPaymentScore} onChange={(value) => updateRules((draft) => { draft.crossSignalRules.remoteUpfrontPaymentScore = value })} value={rules.crossSignalRules.remoteUpfrontPaymentScore} />
                <NumberField label={content.ruleFields.internshipSalaryMax} onChange={(value) => updateRules((draft) => { draft.crossSignalRules.internshipNoExperienceSalaryMax = value })} value={rules.crossSignalRules.internshipNoExperienceSalaryMax} />
                <NumberField label={content.ruleFields.internshipSalaryScore} onChange={(value) => updateRules((draft) => { draft.crossSignalRules.internshipNoExperienceSalaryScore = value })} value={rules.crossSignalRules.internshipNoExperienceSalaryScore} />
                <NumberField label={content.ruleFields.lowTrustScore} onChange={(value) => updateRules((draft) => { draft.companyTrustRules.lowTrustScore = value })} value={rules.companyTrustRules.lowTrustScore} />
              </div>
            </Section>
          </fieldset>

          <Section title={content.sections.testPanel} description={rulesEditable ? content.sections.testDraftDescription : content.sections.testActiveDescription}>
            <div className="moderation-grid moderation-grid--three">
              <SelectField label={content.fields.companyTrust} onChange={setCompanyTrustLevel} options={trustLevels} value={companyTrustLevel} />
              <TextField label={content.fields.title} onChange={(value) => setTestJob((current) => ({ ...current, title: value }))} value={testJob.title} />
              <TextField label={content.fields.location} onChange={(value) => setTestJob((current) => ({ ...current, location: value }))} value={testJob.location} />
              <SelectField label={content.fields.experience} onChange={(value) => setTestJob((current) => ({ ...current, experienceLevel: value }))} options={experienceLevels} value={testJob.experienceLevel} />
              <SelectField label={content.fields.workingType} onChange={(value) => setTestJob((current) => ({ ...current, workingType: value }))} options={workingTypes} value={testJob.workingType} />
              <SelectField label={content.fields.employmentType} onChange={(value) => setTestJob((current) => ({ ...current, employmentType: value }))} options={employmentTypes} value={testJob.employmentType} />
              <NumberField label={content.fields.salaryMin} onChange={(value) => setTestJob((current) => ({ ...current, salaryMin: value }))} value={testJob.salaryMin ?? 0} />
              <NumberField label={content.fields.salaryMax} onChange={(value) => setTestJob((current) => ({ ...current, salaryMax: value }))} value={testJob.salaryMax ?? 0} />
              <TextField label={content.fields.skills} onChange={(value) => setTestJob((current) => ({ ...current, skills: parseTags(value) }))} value={testJob.skills.join(', ')} />
            </div>
            <label className="moderation-field moderation-field--wide">
              <span>{content.fields.description}</span>
              <textarea onChange={(event) => setTestJob((current) => ({ ...current, description: event.target.value }))} value={testJob.description} />
            </label>
            <label className="moderation-field moderation-field--wide">
              <span>{content.fields.requirements}</span>
              <textarea onChange={(event) => setTestJob((current) => ({ ...current, requirements: event.target.value }))} value={testJob.requirements} />
            </label>
            <div className="admin-moderation-test-actions">
              <button disabled={testMutation.isPending} onClick={testRules} type="button">
                {testMutation.isPending ? content.actions.testing : content.actions.testRules}
              </button>
              {testMutation.data ? (
                <div className="admin-moderation-test-result">
                  <strong>{testMutation.data.riskLevel} - {testMutation.data.riskScore}/100</strong>
                  <span>{testMutation.data.decision}</span>
                  <small>{content.testResult.matched}: {testMutation.data.matchedRules.join(', ') || content.misc.none}</small>
                  <small>{content.testResult.reasons}: {testMutation.data.reasons.join(', ') || content.misc.none}</small>
                </div>
              ) : null}
            </div>
          </Section>

          <div className="admin-moderation-actions">
            <button disabled={defaultRulesQuery.isFetching || !rulesEditable} onClick={() => setPendingConfirmAction('loadDefault')} type="button">
              {defaultRulesQuery.isFetching ? content.actions.loadingDefault : content.actions.loadDefault}
            </button>
            <button disabled={isMutating || !nameEditable} onClick={saveDraft} type="button">
              {createMutation.isPending || updateMutation.isPending ? content.actions.saving : saveActionLabel}
            </button>
            <button
              disabled={isMutating || !selectedPolicy || !canPublishOrRestore(selectedPolicy.status)}
              onClick={() => selectedPolicy && setPendingConfirmAction('publish')}
              type="button"
            >
              {publishMutation.isPending ? publishActionPendingLabel : publishActionLabel}
            </button>
            <button
              disabled={isMutating || !selectedPolicy || !canArchive(selectedPolicy.status)}
              onClick={() => selectedPolicy && setPendingConfirmAction('archive')}
              type="button"
            >
              {archiveMutation.isPending ? content.actions.archiving : content.actions.archive}
            </button>
          </div>
            </main>
          </aside>
        </div>
      ) : null}
      <ConfirmModal
        cancelLabel={content.actions.cancel}
        confirmLabel={confirmCopy.confirmLabel}
        description={confirmCopy.description}
        isOpen={Boolean(pendingConfirmAction)}
        isPending={isConfirmPending}
        onCancel={() => setPendingConfirmAction(null)}
        onConfirm={confirmPendingAction}
        title={confirmCopy.title}
      />
    </div>
  )
}

export default AdminJobModerationPoliciesPage
