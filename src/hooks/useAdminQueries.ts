import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminCompaniesService,
  adminDashboardService,
  adminJobsService,
  adminUsersService,
} from '../services/admin'
import type {
  AdminCompanyListQuery,
  AdminJobListQuery,
  AdminJobReviewQueueQuery,
  AdminReasonPayload,
  AdminRevisionReviewQueueQuery,
  AdminUserListQuery,
  CompanyVerificationActionPayload,
  JobReasonPayload,
  ReviewDecisionPayload,
  UpdateCompanyTrustLevelPayload,
} from '../services/admin'
import { adminQueryKeys } from './adminQueryKeys'

export function useAdminDashboardOverview() {
  return useQuery({
    queryKey: adminQueryKeys.dashboardOverview(),
    queryFn: adminDashboardService.getOverview,
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

export function useAdminJobs(query: AdminJobListQuery) {
  return useQuery({
    queryKey: adminQueryKeys.jobList(query),
    queryFn: () => adminJobsService.list(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminJobReviewQueue(query: AdminJobReviewQueueQuery) {
  return useQuery({
    queryKey: adminQueryKeys.jobReviewQueue(query),
    queryFn: () => adminJobsService.listReviewQueue(query),
    placeholderData: keepPreviousData,
  })
}

export function useAdminRevisionReviewQueue(query: AdminRevisionReviewQueueQuery) {
  return useQuery({
    queryKey: adminQueryKeys.revisionReviewQueue(query),
    queryFn: () => adminJobsService.listRevisionReviewQueue(query),
    placeholderData: keepPreviousData,
  })
}

function useInvalidateAdminUsers() {
  const queryClient = useQueryClient()
  return async (userId: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.userLists() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.userDetail(userId) }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboardOverview() }),
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
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.pendingCompanies() }),
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboardOverview() }),
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
