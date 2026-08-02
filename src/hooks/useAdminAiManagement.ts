import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminAiManagementService } from '../services/admin'
import type { AdminAiUsageLogQuery } from '../types/admin.types'
import { adminQueryKeys } from './adminQueryKeys'

export function useAdminAiConfig() {
  return useQuery({ queryKey: adminQueryKeys.aiConfig(), queryFn: adminAiManagementService.getConfig })
}

export function useAdminAiUsageSummary() {
  return useQuery({ queryKey: adminQueryKeys.aiUsageSummary(), queryFn: adminAiManagementService.getUsageSummary })
}

export function useAdminAiUsageLogs(query: AdminAiUsageLogQuery) {
  return useQuery({
    queryKey: adminQueryKeys.aiUsageLogList(query),
    queryFn: () => adminAiManagementService.getUsageLogs(query),
    placeholderData: keepPreviousData,
  })
}

export function useUpdateAdminAiConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: adminAiManagementService.updateConfig,
    onSuccess: async (config) => {
      queryClient.setQueryData(adminQueryKeys.aiConfig(), config)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.aiUsageSummary() }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.aiUsageLogs() }),
      ])
    },
  })
}
