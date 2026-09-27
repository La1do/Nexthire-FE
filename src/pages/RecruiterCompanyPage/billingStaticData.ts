/**
 * TODO(A1): the ONLY static data in the company management area.
 * Invoice history is sample data until `teamCompanyService.listInvoices()` (A1) is wired in PR C.
 * Plan changes have no static data: the upgrade / downgrade buttons stay disabled until
 * `teamCompanyService.changePlan()` (A1) is wired in PR C.
 */
import type { CompanyInvoiceView } from './types'

export const STATIC_SAMPLE_INVOICES: ReadonlyArray<CompanyInvoiceView> = [
  {
    amount: 1990000,
    currency: 'VND',
    id: 'invoice-3',
    issuedAt: '2026-09-01T02:00:00.000Z',
    number: 'NX-2026-0009',
    periodEnd: '2026-09-30T16:59:59.000Z',
    periodStart: '2026-08-31T17:00:00.000Z',
    status: 'PENDING',
  },
  {
    amount: 1990000,
    currency: 'VND',
    id: 'invoice-2',
    issuedAt: '2026-08-01T02:00:00.000Z',
    number: 'NX-2026-0008',
    periodEnd: '2026-08-31T16:59:59.000Z',
    periodStart: '2026-07-31T17:00:00.000Z',
    status: 'PAID',
  },
  {
    amount: 1990000,
    currency: 'VND',
    id: 'invoice-1',
    issuedAt: '2026-07-01T02:00:00.000Z',
    number: 'NX-2026-0007',
    periodEnd: '2026-07-31T16:59:59.000Z',
    periodStart: '2026-06-30T17:00:00.000Z',
    status: 'FAILED',
  },
]
