/** Tabs of the company management area. The active tab lives in `?tab=`. */
export type CompanyTabId = 'profile' | 'legal' | 'members' | 'billing' | 'audit'

/**
 * Invoice row shown in the billing tab.
 * TODO(A1): replace with the invoice type returned by `teamCompanyService.listInvoices()` (wired in PR C).
 */
export type CompanyInvoiceStatus = 'PAID' | 'PENDING' | 'FAILED'

export type CompanyInvoiceView = {
  amount: number
  currency: string
  id: string
  issuedAt: string
  number: string
  periodEnd: string
  periodStart: string
  status: CompanyInvoiceStatus
}
