import { create } from 'zustand'
import type { RecruiterJobsFilters, RecruiterJobsStatusFilter } from '../types'

const INITIAL_FILTERS: RecruiterJobsFilters = {
  limit: 10,
  page: 1,
  q: '',
  sort: 'latest',
  status: 'ALL',
}

type RecruiterJobsStore = {
  filters: RecruiterJobsFilters
  searchInput: string
  applySearch: (value: string) => void
  clearFilters: () => void
  setPage: (page: number) => void
  setSearchInput: (value: string) => void
  setSort: (sort: RecruiterJobsFilters['sort']) => void
  setStatus: (status: RecruiterJobsStatusFilter) => void
}

export const useRecruiterJobsStore = create<RecruiterJobsStore>((set) => ({
  filters: INITIAL_FILTERS,
  searchInput: '',
  applySearch: (value) => {
    const nextSearch = value.trim()
    set((state) => ({
      filters: {
        ...state.filters,
        page: 1,
        q: nextSearch,
      },
      searchInput: nextSearch,
    }))
  },
  clearFilters: () => set({ filters: INITIAL_FILTERS, searchInput: '' }),
  setPage: (page) => set((state) => ({
    filters: { ...state.filters, page },
  })),
  setSearchInput: (searchInput) => set({ searchInput }),
  setSort: (sort) => set((state) => ({
    filters: { ...state.filters, page: 1, sort },
  })),
  setStatus: (status) => set((state) => ({
    filters: { ...state.filters, page: 1, status },
  })),
}))
