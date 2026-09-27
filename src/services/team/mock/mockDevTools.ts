/**
 * Dev-toolbar helpers. Only imported by the lazily loaded DevMockToolbar (dev builds only).
 * These bypass permission checks on purpose — never call them from product code.
 */
import type { CompanyPlan, CompanyRole, MemberStatus } from '../../../types/company.types'
import { applyMockPlanChange } from './mockCompany'
import { MOCK_PASSWORD } from './mockSeed'
import { getMockSessionUserId, readMockDb, resetMockDb, updateMockDb } from './mockStore'

export type MockAccountOption = {
  userId: string
  email: string
  fullName: string
  companyName: string
  plan: CompanyPlan
  role: CompanyRole
  status: MemberStatus
}

export const mockDevTools = {
  password: MOCK_PASSWORD,

  listAccounts(): MockAccountOption[] {
    const db = readMockDb()

    return db.accounts.flatMap((account) => {
      const member = db.members.find((item) => item.id === account.memberId)
      const company = db.companies.find((item) => item.id === account.companyId)

      if (!member || !company) {
        return []
      }

      return [
        {
          companyName: company.name,
          email: account.email,
          fullName: account.fullName,
          plan: company.plan,
          role: member.role,
          status: member.status,
          userId: account.userId,
        },
      ]
    })
  },

  currentAccount(): MockAccountOption | null {
    const userId = getMockSessionUserId()
    return mockDevTools.listAccounts().find((account) => account.userId === userId) ?? null
  },

  /** Change the current mock company's plan with the same side effects as changePlan(), without the billing.manage check. */
  setCurrentCompanyPlan(plan: CompanyPlan) {
    const current = mockDevTools.currentAccount()

    if (!current) {
      return
    }

    updateMockDb((db) => {
      const account = db.accounts.find((item) => item.userId === current.userId)

      if (account) {
        applyMockPlanChange(db, account.companyId, plan, { name: `${current.fullName} (dev toolbar)`, userId: current.userId })
      }
    })
  },

  reset() {
    resetMockDb()
  },
}
