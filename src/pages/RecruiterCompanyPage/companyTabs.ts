import type { Permission } from '../../lib/auth/permissions'
import type { CompanyTabId } from './types'

/** Permissions the company management area reads. */
export type CompanyPermission = Extract<
  Permission,
  'audit.view' | 'billing.manage' | 'company.edit' | 'company.legal' | 'members.manage'
>

export type CompanyTabDefinition = {
  id: CompanyTabId
  /** Permission needed to open the tab. `null` means every company member can open it (view-only without `company.edit`). */
  permission: CompanyPermission | null
}

/**
 * Declared tab list. Visibility comes only from the permission result:
 * allowed renders, blocked by plan shows a lock, blocked by role hides the tab.
 */
export const COMPANY_TABS: ReadonlyArray<CompanyTabDefinition> = [
  { id: 'profile', permission: null },
  { id: 'legal', permission: 'company.legal' },
  { id: 'members', permission: 'members.manage' },
  { id: 'billing', permission: 'billing.manage' },
  { id: 'audit', permission: 'audit.view' },
]

export const COMPANY_TAB_PARAM = 'tab'

export function isCompanyTabId(value: string | null): value is CompanyTabId {
  return COMPANY_TABS.some((tab) => tab.id === value)
}

export function getCompanyTabId(id: CompanyTabId) {
  return `company-tab-${id}`
}

export function getCompanyPanelId(id: CompanyTabId) {
  return `company-panel-${id}`
}
