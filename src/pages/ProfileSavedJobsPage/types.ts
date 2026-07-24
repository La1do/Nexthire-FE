export type ProfileSavedJobStatusKey = 'published' | 'unpublished' | 'closed' | 'expired' | 'rejected'

export type ProfileSavedJobTranslations = {
  routeLabel: string
  pageTitle: string
  title: string
  description: string
  primaryAction: string
  states: {
    loading: string
    errorTitle: string
    errorDescription: string
    retry: string
  }
  empty: {
    title: string
    description: string
    action: string
  }
  card: {
    savedAtLabel: string
    removeAriaLabel: string
    removingAriaLabel: string
    statusLabel: string
    statusValues: Record<ProfileSavedJobStatusKey, string>
    viewJobLabel: string
    notAvailable: string
  }
}
