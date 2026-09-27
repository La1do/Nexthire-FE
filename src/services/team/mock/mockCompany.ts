import { can, isMemberSuspended, isPlanUpgrade, PLAN_SEAT_LIMITS } from '../../../lib/auth/permissions'
import type {
  CompanyPlan,
  CompanyResponse,
  CompanySeatLimit,
  CompanySubscription,
  CompanyVerificationDocument,
  Invoice,
  Member,
} from '../../../types/company.types'
import { mockForbidden, mockNotFound } from './mockErrors'
import { MOCK_PLAN_PRICES } from './mockSeed'
import type { MockCompany, MockDatabase } from './mockSeed'
import { appendMockAuditLog, mockDelay, requireMockContext, updateMockDb } from './mockStore'

function toSubscription(company: MockCompany): CompanySubscription {
  return {
    companyId: company.id,
    plan: company.plan,
    renewsAt: company.renewsAt,
    seatLimit: { ...company.seatLimit },
  }
}

function toCompanyResponse(company: MockCompany): CompanyResponse {
  // Strip mock-only subscription fields so the shape matches GET /companies/me.
  const { plan: _plan, seatLimit: _seatLimit, renewsAt: _renewsAt, ...response } = company
  return response
}

function addMonth(date: Date) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + 1)
  return next
}

export type MockPlanChangeActor = {
  userId: string
  name: string
}

/**
 * Plan change side effects (shared by changePlan and the dev toolbar):
 * - Upgrade to PRO: jobs assigned to the Owner become unassigned (JD_ASSIGNED audit per job);
 *   members suspended BY DOWNGRADE (`suspendedReason: 'PLAN_DOWNGRADE'`) are reactivated, within
 *   the PRO seat quota, oldest first; a PAID invoice is added.
 * - Downgrade to FREE: every ACTIVE non-Owner member becomes SUSPENDED with reason PLAN_DOWNGRADE (never deleted).
 * - Always: PLAN_CHANGED audit entry. Same plan → no-op.
 */
export function applyMockPlanChange(
  db: MockDatabase,
  companyId: string,
  toPlan: CompanyPlan,
  actor: MockPlanChangeActor,
): MockCompany {
  const company = db.companies.find((item) => item.id === companyId)

  if (!company) {
    throw mockNotFound('COMPANY.NOT_FOUND', 'Mock company not found.')
  }

  const fromPlan = company.plan

  if (fromPlan === toPlan) {
    return company
  }

  const now = new Date()
  const isUpgrade = isPlanUpgrade(fromPlan, toPlan)
  const companyMembers = db.members.filter((member) => member.companyId === company.id)
  const isOwnerMember = (member: Member) => member.userId === company.ownerId

  company.plan = toPlan
  company.seatLimit = { ...PLAN_SEAT_LIMITS[toPlan] }
  company.renewsAt = MOCK_PLAN_PRICES[toPlan] > 0 ? addMonth(now).toISOString() : null
  company.updatedAt = now.toISOString()

  if (isUpgrade) {
    db.jobs
      .filter((job) => job.companyId === company.id && job.assigneeId === company.ownerId)
      .forEach((job) => {
        job.assigneeId = null
        appendMockAuditLog(db, {
          action: 'JD_ASSIGNED',
          actorId: actor.userId,
          actorName: actor.name,
          companyId: company.id,
          metadata: { fromAssigneeId: company.ownerId, toAssigneeId: null },
          targetId: job.id,
          targetLabel: job.title,
          targetType: 'JOB',
        })
      })

    const usedSeats: CompanySeatLimit = { MANAGER: 0, STAFF: 0 }
    companyMembers
      .filter((member) => !isOwnerMember(member) && member.status === 'ACTIVE')
      .forEach((member) => {
        usedSeats[member.role as keyof CompanySeatLimit] += 1
      })

    companyMembers
      .filter((member) => !isOwnerMember(member) && member.suspendedReason === 'PLAN_DOWNGRADE')
      .sort((left, right) => left.joinedAt.localeCompare(right.joinedAt))
      .forEach((member) => {
        const seatRole = member.role as keyof CompanySeatLimit

        if (usedSeats[seatRole] < company.seatLimit[seatRole]) {
          usedSeats[seatRole] += 1
          member.status = 'ACTIVE'
          member.suspendedReason = null
          member.updatedAt = now.toISOString()
        }
      })

    if (MOCK_PLAN_PRICES[toPlan] > 0) {
      db.invoices.push({
        amount: MOCK_PLAN_PRICES[toPlan],
        companyId: company.id,
        currency: 'VND',
        downloadUrl: null,
        id: `mock-invoice-${now.getTime()}`,
        issuedAt: now.toISOString(),
        number: `NH-${now.getFullYear()}-${String(db.invoices.length + 1).padStart(4, '0')}`,
        periodEnd: addMonth(now).toISOString(),
        periodStart: now.toISOString(),
        plan: toPlan,
        status: 'PAID',
      })
    }
  } else {
    companyMembers
      .filter((member) => !isOwnerMember(member) && member.status === 'ACTIVE')
      .forEach((member) => {
        member.status = 'SUSPENDED'
        member.suspendedReason = 'PLAN_DOWNGRADE'
        member.updatedAt = now.toISOString()
      })
  }

  appendMockAuditLog(db, {
    action: 'PLAN_CHANGED',
    actorId: actor.userId,
    actorName: actor.name,
    companyId: company.id,
    metadata: { fromPlan, toPlan },
    targetId: company.id,
    targetLabel: company.name,
    targetType: 'COMPANY',
  })

  return company
}

/** Mock implementation of the company workspace endpoints. */
export const mockCompanyApi = {
  /** Allowed for suspended members too, so existing company gates do not redirect them before the SuspendedGate. */
  async getCurrentCompany(): Promise<CompanyResponse> {
    return mockDelay(toCompanyResponse(requireMockContext().company))
  },

  async getCompanyPlan(): Promise<CompanySubscription> {
    return mockDelay(toSubscription(requireMockContext().company))
  },

  /** Any ACTIVE member can list the team (FREE Owners see suspended members with their reason). */
  async listMembers(): Promise<Member[]> {
    const { company, db, subject } = requireMockContext()

    if (isMemberSuspended(subject.status)) {
      throw mockForbidden('MEMBER.SUSPENDED', 'Your account is suspended.')
    }

    return mockDelay(db.members.filter((member) => member.companyId === company.id))
  },

  /** Requires billing.manage. */
  async changePlan(plan: CompanyPlan): Promise<CompanySubscription> {
    const { company, fullName, subject, userId } = requireMockContext()

    if (!can(subject, 'billing.manage').allowed) {
      throw mockForbidden('BILLING.FORBIDDEN', 'Only the company Owner can change the plan.')
    }

    const updated = updateMockDb((db) => applyMockPlanChange(db, company.id, plan, { name: fullName, userId }))
    return mockDelay(toSubscription(updated))
  },

  /** Requires billing.manage. Newest first. */
  async listInvoices(): Promise<Invoice[]> {
    const { company, db, subject } = requireMockContext()

    if (!can(subject, 'billing.manage').allowed) {
      throw mockForbidden('BILLING.FORBIDDEN', 'Only the company Owner can view invoices.')
    }

    return mockDelay(
      db.invoices
        .filter((invoice) => invoice.companyId === company.id)
        .sort((left, right) => right.issuedAt.localeCompare(left.issuedAt)),
    )
  },

  /** Legacy verification page in mock mode: seeded companies are already approved, no documents. */
  async listVerificationDocuments(): Promise<CompanyVerificationDocument[]> {
    requireMockContext()
    return mockDelay([])
  },
}
