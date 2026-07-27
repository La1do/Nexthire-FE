import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/useAuth'
import { getApiErrorCode } from '../lib/api/apiError'
import { companyService } from '../services/company.service'
import type { CompanyResponse } from '../types/company.types'

export type RecruiterCompanyGateState = {
  isLoading: boolean
  company: CompanyResponse | null
  hasCompany: boolean
  isApproved: boolean
  canPostJobs: boolean
  missingRequiredFields: string[]
  completionPercent: number
  refresh: () => void
}

const COMPANY_NOT_FOUND = 'COMPANY.NOT_FOUND'

export function useRecruiterCompanyGate(): RecruiterCompanyGateState {
  const { user } = useAuth()
  const userId = user?.id ?? 'anonymous'
  const isRecruiter = user?.role === 'RECRUITER'

  const query = useQuery<CompanyResponse | null>({
    enabled: isRecruiter,
    queryFn: async () => {
      try {
        return await companyService.getMyCompany()
      } catch (error) {
        if (getApiErrorCode(error) === COMPANY_NOT_FOUND) {
          return null
        }
        throw error
      }
    },
    queryKey: ['company', 'me', userId],
  })

  const refresh = useCallback(() => {
    void query.refetch()
  }, [query])

  const company = query.data ?? null

  return {
    canPostJobs: company?.canPostJobs ?? false,
    company,
    completionPercent: company?.completionPercent ?? 0,
    hasCompany: Boolean(company),
    isApproved: company?.status === 'APPROVED',
    isLoading: isRecruiter && (query.isPending || query.isFetching),
    missingRequiredFields: company?.missingRequiredFields ?? [],
    refresh,
  }
}
