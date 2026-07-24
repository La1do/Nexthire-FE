import { create } from 'zustand'

type SavedJobsState = {
  savedJobIds: ReadonlySet<string>
  hydrate: (ids: ReadonlyArray<string>) => void
  sync: (checkedIds: ReadonlyArray<string>, savedIds: ReadonlyArray<string>) => void
  has: (jobId: string) => boolean
  add: (jobId: string) => void
  remove: (jobId: string) => void
  reset: () => void
}

function nextSet(current: ReadonlySet<string>, mutate: (draft: Set<string>) => void) {
  const draft = new Set(current)
  mutate(draft)
  return draft
}

export const useSavedJobsStore = create<SavedJobsState>((set, get) => ({
  savedJobIds: new Set<string>(),

  hydrate: (ids) =>
    set((state) => {
      const draft = new Set(state.savedJobIds)
      for (const id of ids) {
        draft.add(id)
      }

      if (draft.size === state.savedJobIds.size) {
        return state
      }

      return { savedJobIds: draft }
    }),

  sync: (checkedIds, savedIds) =>
    set((state) => {
      const savedSet = new Set(savedIds)
      let changed = false

      for (const id of checkedIds) {
        if (state.savedJobIds.has(id) !== savedSet.has(id)) {
          changed = true
          break
        }
      }

      if (!changed) {
        return state
      }

      const savedJobIds = nextSet(state.savedJobIds, (draft) => {
        for (const id of checkedIds) {
          draft.delete(id)
        }
        for (const id of savedIds) {
          draft.add(id)
        }
      })

      return { savedJobIds }
    }),

  has: (jobId) => get().savedJobIds.has(jobId),

  add: (jobId) =>
    set((state) => {
      if (state.savedJobIds.has(jobId)) {
        return state
      }

      const savedJobIds = nextSet(state.savedJobIds, (draft) => {
        draft.add(jobId)
      })
      return { savedJobIds }
    }),

  remove: (jobId) =>
    set((state) => {
      if (!state.savedJobIds.has(jobId)) {
        return state
      }

      const savedJobIds = nextSet(state.savedJobIds, (draft) => {
        draft.delete(jobId)
      })
      return { savedJobIds }
    }),

  reset: () => set(() => ({ savedJobIds: new Set<string>() })),
}))
