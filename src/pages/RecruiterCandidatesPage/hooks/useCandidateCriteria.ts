import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { CandidateCriteria } from '../types'
import { readCandidateCriteria, writeCandidateCriteria } from '../utils/candidateCriteria'

/** Criteria mirrored in the URL (`search`, `status`, `sort`) plus the current page. */
export function useCandidateCriteria() {
  const [searchParams, setSearchParams] = useSearchParams()
  const criteria = readCandidateCriteria(searchParams)
  const [page, setPage] = useState(1)

  function updateCriteria(nextCriteria: CandidateCriteria) {
    setPage(1)
    setSearchParams(writeCandidateCriteria(nextCriteria), { replace: true })
  }

  return { criteria, page, setPage, updateCriteria }
}
