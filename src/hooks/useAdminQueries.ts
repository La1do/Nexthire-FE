import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminCompaniesService,
  adminDashboardService,
  adminCvTemplatePresetsService,
  adminJobsService,
  adminUsersService,
} from '../services/admin'
import type {
  AdminCompanyListQuery,
  AdminCvTemplatePresetQuery,
  AdminCvTemplatePresetSortOrderPayload,
  AdminDashboardGrowthQuery,
  AdminJobListQuery,
  AdminJobReviewQueueQuery,
  AdminReasonPayload,
  AdminRevisionReviewQueueQuery,
  AdminUserListQuery,
  CreateAdminCvTemplatePresetPayload,
  CompanyVerificationActionPayload,
  JobReasonPayload,
  ReviewDecisionPayload,
  UpdateAdminCvTemplatePresetPayload,
  UpdateCompanyTrustLevelPayload,
} from '../services/admin'
import { adminQueryKeys } from './adminQueryKeys'

export function useAdminDashboardOverview() {
  return useQuery({
    queryKey: adminQueryKeys.dashboardOverview(),
    queryFn: adminDashboardService.getOverview,
  })
}

export function useAdminUserGrowth(query: AdminDashboardGrowthQuery = {}) {
  return useQuery({
    queryKey: adminQueryKeys.dashboardUserGrowth(query),
    queryFn: () => adminDashboardService.getUserGrowth(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminGrowthSeries(query: AdminDashboardGrowthQuery = {}) {
  return useQuery({
    queryKey: adminQueryKeys.dashboardGrowthSeries(query),
    queryFn: () => adminDashboardService.getGrowthSeries(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminUsersOverview() {
  return useQuery({
    queryKey: [...adminQueryKeys.users(), 'overview'],
    queryFn: adminUsersService.getOverview,
  })
}

export function useAdminCompanyGrowth(query: AdminDashboardGrowthQuery = {}) {
  return useQuery({
    queryKey: adminQueryKeys.dashboardCompanyGrowth(query),
    queryFn: () => adminDashboardService.getCompanyGrowth(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminJobGrowth(query: AdminDashboardGrowthQuery = {}) {
  return useQuery({
    queryKey: adminQueryKeys.dashboardJobGrowth(query),
    queryFn: () => adminDashboardService.getJobGrowth(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminUsers(query: AdminUserListQuery) {
  return useQuery({
    queryKey: adminQueryKeys.userList(query),
    queryFn: () => adminUsersService.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminUser(userId: string | undefined) {
  return useQuery({
    queryKey: adminQueryKeys.userDetail(userId ?? 'missing'),
    queryFn: () => adminUsersService.getById(userId as string),
    enabled: Boolean(userId),
  })
}

export function useAdminCompanies(query: AdminCompanyListQuery) {
  return useQuery({
    queryKey: adminQueryKeys.companyList(query),
    queryFn: () => adminCompaniesService.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminCompaniesOverview() {
  return useQuery({
    queryKey: adminQueryKeys.companyOverview(),
    queryFn: adminCompaniesService.getOverview,
  })
}

export function usePendingAdminCompanies() {
  return useQuery({
    queryKey: adminQueryKeys.pendingCompanies(),
    queryFn: adminCompaniesService.listPending,
  })
}

export function useAdminCompanyDocuments(companyId: string | undefined) {
  return useQuery({
    queryKey: adminQueryKeys.companyDocuments(companyId ?? 'missing'),
    queryFn: () => adminCompaniesService.listVerificationDocuments(companyId as string),
    enabled: Boolean(companyId),
  })
}

export function useAdminCompanyTrustHistory(companyId: string | undefined) {
  return useQuery({
    queryKey: adminQueryKeys.companyTrustHistory(companyId ?? 'missing'),
    queryFn: () => adminCompaniesService.getTrustHistory(companyId as string),
    enabled: Boolean(companyId),
  })
}

export function useAdminCvTemplatePresets(query: AdminCvTemplatePresetQuery) {
  return useQuery({
    queryKey: adminQueryKeys.cvTemplatePresetList(query),
    queryFn: () => adminCvTemplatePresetsService.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminCvTemplatePreset(presetId: string | undefined) {
  return useQuery({
    queryKey: adminQueryKeys.cvTemplatePresetDetail(presetId ?? 'missing'),
    queryFn: () => adminCvTemplatePresetsService.get(presetId as string),
    enabled: Boolean(presetId),
  })
}

function useInvalidateAdminCvTemplatePresets(presetId?: string) {
  const queryClient = useQueryClient()
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.cvTemplatePresetLists() }),
      ...(presetId
        ? [
            queryClient.invalidateQueries({
              queryKey: adminQueryKeys.cvTemplatePresetDetail(presetId),
            }),
          ]
        : []),
    ])
  }
}

export function useCreateAdminCvTemplatePreset() {
  const invalidate = useInvalidateAdminCvTemplatePresets()
  return useMutation({
    mutationFn: (payload: CreateAdminCvTemplatePresetPayload) =>
      adminCvTemplatePresetsService.create(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateAdminCvTemplatePreset(presetId: string) {
  const invalidate = useInvalidateAdminCvTemplatePresets(presetId)
  return useMutation({
    mutationFn: (payload: UpdateAdminCvTemplatePresetPayload) =>
      adminCvTemplatePresetsService.update(presetId, payload),
    onSuccess: invalidate,
  })
}

export function useAdminCvTemplatePresetAction(
  presetId: string,
  action: 'publish' | 'archive' | 'restore',
) {
  const invalidate = useInvalidateAdminCvTemplatePresets(presetId)
  return useMutation({
    mutationFn: () => adminCvTemplatePresetsService[action](presetId),
    onSuccess: invalidate,
  })
}

export function useUpdateAdminCvTemplatePresetSortOrder() {
  const invalidate = useInvalidateAdminCvTemplatePresets()
  return useMutation({
    mutationFn: (payload: AdminCvTemplatePresetSortOrderPayload) =>
      adminCvTemplatePresetsService.updateSortOrder(payload),
    onSuccess: invalidate,
  })
}

export function useAdminJobs(query: AdminJobListQuery, enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.jobList(query),
    queryFn: () => adminJobsService.list(query),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useAdminJobReviewQueue(query: AdminJobReviewQueueQuery, enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.jobReviewQueue(query),
    queryFn: () => adminJobsService.listReviewQueue(query),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useAdminRevisionReviewQueue(query: AdminRevisionReviewQueueQuery, enabled = true) {
  return useQuery({
    queryKey: adminQueryKeys.revisionReviewQueue(query),
    queryFn: () => adminJobsService.listRevisionReviewQueue(query),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useAdminJobDetail(jobId?: string) {
  return useQuery({
    queryKey: adminQueryKeys.jobDetail(jobId ?? 'missing'),
    queryFn: () => adminJobsService.getDetail(jobId as string),
    enabled: Boolean(jobId),
  })
}

export function useAdminJobRevisionDetail(revisionId?: string) {
  return useQuery({
    queryKey: adminQueryKeys.revisionDetail(revisionId ?? 'missing'),
    queryFn: () => adminJobsService.getRevisionDetail(revisionId as string),
    enabled: Boolean(revisionId),
  })
}

function useInvalidateAdminUsers() {
  const queryClient = useQueryClient()
  return async (userId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.userLists() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.userDetail(userId) }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboardOverview() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboardGrowth() }),
    ])
  }
}

export function useAdminUserAction(
  action: 'suspend' | 'ban' | 'archive' | 'restore',
) {
  const invalidate = useInvalidateAdminUsers()
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: AdminReasonPayload }) =>
      adminUsersService[action](userId, payload),
    onSuccess: (_data, variables) => invalidate(variables.userId),
  })
}

function useInvalidateAdminCompanies(companyId?: string) {
  const queryClient = useQueryClient()
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.companyLists() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.companyOverview() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.pendingCompanies() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboardOverview() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboardGrowth() }),
      ...(companyId
        ? [
            queryClient.invalidateQueries({
              queryKey: adminQueryKeys.companyTrustHistory(companyId),
            }),
          ]
        : []),
    ])
  }
}

export function useVerifyAdminCompany(companyId: string) {
  const invalidate = useInvalidateAdminCompanies(companyId)
  return useMutation({
    mutationFn: (payload: CompanyVerificationActionPayload) =>
      adminCompaniesService.verify(companyId, payload),
    onSuccess: invalidate,
  })
}

export function useAdminCompanyStatusAction(
  companyId: string,
  action: 'suspend' | 'restore',
) {
  const invalidate = useInvalidateAdminCompanies(companyId)
  return useMutation({
    mutationFn: (payload: AdminReasonPayload) =>
      adminCompaniesService[action](companyId, payload),
    onSuccess: invalidate,
  })
}

export function useUpdateAdminCompanyTrustLevel(companyId: string) {
  const invalidate = useInvalidateAdminCompanies(companyId)
  return useMutation({
    mutationFn: (payload: UpdateCompanyTrustLevelPayload) =>
      adminCompaniesService.updateTrustLevel(companyId, payload),
    onSuccess: invalidate,
  })
}

function useInvalidateAdminJobs() {
  const queryClient = useQueryClient()
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.jobLists() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.jobReviewQueues() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.revisionReviewQueues() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboardOverview() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboardGrowth() }),
    ])
  }
}

export function useReviewAdminJob(jobId: string) {
  const invalidate = useInvalidateAdminJobs()
  return useMutation({
    mutationFn: (payload: ReviewDecisionPayload) => adminJobsService.review(jobId, payload),
    onSuccess: invalidate,
  })
}

export function useAdminJobStatusAction(
  jobId: string,
  action: 'unpublish' | 'republish' | 'close',
) {
  const invalidate = useInvalidateAdminJobs()
  return useMutation({
    mutationFn: (payload?: JobReasonPayload) => {
      if (action === 'republish') {
        return adminJobsService.republish(jobId)
      }
      return adminJobsService[action](jobId, payload ?? {})
    },
    onSuccess: invalidate,
  })
}

export function useReviewAdminRevision(revisionId: string) {
  const invalidate = useInvalidateAdminJobs()
  return useMutation({
    mutationFn: (payload: ReviewDecisionPayload) =>
      adminJobsService.reviewRevision(revisionId, payload),
    onSuccess: invalidate,
  })
}
