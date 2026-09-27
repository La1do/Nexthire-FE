import type { Translations } from '../i18n'
import type { PermissionRequirement } from '../lib/auth/permissions'

export type RecruiterNavItem = {
  href: string
  label: string
  /**
   * Company RBAC requirement (array = any of). Evaluated with checkPermission():
   * denied by role → hidden; denied by plan → shown locked with an upgrade link. No permission → always shown.
   * Keep in sync with the route's permission gate in app/routes/routeObjects.tsx.
   */
  permission?: PermissionRequirement
}

export function getRecruiterNavItems(pages: Translations['pages']): RecruiterNavItem[] {
  const content = pages.recruiterHome

  return [
    { href: '/recruiter', label: content.sidebar.overview },
    { href: '/recruiter/jobs', label: content.sidebar.jobs, permission: 'jd.create' },
    {
      href: '/recruiter/applications',
      label: pages.recruiterApplications.routeLabel,
      permission: ['cv.viewAll', 'cv.viewOwn'],
    },
    { href: '/recruiter/candidates', label: content.sidebar.candidates, permission: ['cv.viewAll', 'cv.viewOwn'] },
    // No permission: every active member can open the company page; editing is gated in the page (<Can permission="company.edit">).
    { href: '/recruiter/company', label: content.sidebar.company },
    { href: '/recruiter/messages', label: content.sidebar.messages },
    { href: '/recruiter/settings', label: content.sidebar.settings },
  ]
}
