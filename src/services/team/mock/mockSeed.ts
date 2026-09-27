/**
 * Seed data for the company RBAC mock services. Obviously fake data only.
 * Login credentials are documented in docs/mock-accounts.md.
 */
import type { Application } from '../../../types/application.types'
import type { AuditLog } from '../../../types/auditLog.types'
import type {
  CompanyPlan,
  CompanyResponse,
  CompanyRole,
  CompanySeatLimit,
  Member,
  MemberStatus,
} from '../../../types/company.types'
import type { CompanyJobStatus, Job } from '../../../types/job.types'

export const MOCK_PASSWORD = '123456'

export type MockCompany = CompanyResponse & {
  plan: CompanyPlan
  seatLimit: CompanySeatLimit
  renewsAt: string | null
}

/** Seat quota per plan (Owner seat always included). */
export const MOCK_SEAT_LIMITS: Record<CompanyPlan, CompanySeatLimit> = {
  FREE: { MANAGER: 0, STAFF: 0 },
  PRO: { MANAGER: 1, STAFF: 3 },
}

export type MockAccount = {
  userId: string
  memberId: string
  companyId: string
  email: string
  password: string
  fullName: string
  phone: string | null
}

export type MockDatabase = {
  accounts: MockAccount[]
  companies: MockCompany[]
  members: Member[]
  jobs: Job[]
  applications: Application[]
  auditLogs: AuditLog[]
}

const SEED_DATE = '2026-09-01T02:00:00.000Z'

export const MOCK_COMPANY_IDS = {
  free: 'mock-company-free',
  pro: 'mock-company-pro',
} as const

function createCompany(input: {
  id: string
  name: string
  ownerId: string
  plan: CompanyPlan
  taxCode: string
}): MockCompany {
  return {
    address: '1 Mock Street, Ho Chi Minh City',
    canPostJobs: true,
    completionPercent: 100,
    contactEmail: `contact@${input.id}.mock.nexhire`,
    contactPhone: null,
    createdAt: SEED_DATE,
    culture: null,
    description: `${input.name} is a fake company used by the NexHire mock services.`,
    foundedYear: 2020,
    heroImageDocumentId: null,
    heroImageUrl: null,
    id: input.id,
    industry: 'Software',
    logo: null,
    logoDocumentId: null,
    logoUrl: null,
    missingRequiredFields: [],
    mission: null,
    name: input.name,
    ownerId: input.ownerId,
    perks: [],
    plan: input.plan,
    renewsAt: input.plan === 'PRO' ? '2026-12-01T00:00:00.000Z' : null,
    rejectionReason: null,
    seatLimit: MOCK_SEAT_LIMITS[input.plan],
    size: '11-50',
    status: 'APPROVED',
    submittedAt: SEED_DATE,
    taxCode: input.taxCode,
    updatedAt: SEED_DATE,
    values: [],
    website: null,
  }
}

type AccountSeed = {
  key: string
  companyId: string
  email: string
  fullName: string
  role: CompanyRole
  status: MemberStatus
}

const ACCOUNT_SEEDS: AccountSeed[] = [
  { companyId: MOCK_COMPANY_IDS.free, email: 'owner.free@mock.nexhire', fullName: 'Free Owner', key: 'free-owner', role: 'OWNER', status: 'ACTIVE' },
  { companyId: MOCK_COMPANY_IDS.pro, email: 'owner.pro@mock.nexhire', fullName: 'Pro Owner', key: 'pro-owner', role: 'OWNER', status: 'ACTIVE' },
  { companyId: MOCK_COMPANY_IDS.pro, email: 'manager.pro@mock.nexhire', fullName: 'Pro Manager', key: 'pro-manager', role: 'MANAGER', status: 'ACTIVE' },
  { companyId: MOCK_COMPANY_IDS.pro, email: 'staff1.pro@mock.nexhire', fullName: 'Pro Staff One', key: 'pro-staff-1', role: 'STAFF', status: 'ACTIVE' },
  { companyId: MOCK_COMPANY_IDS.pro, email: 'staff2.pro@mock.nexhire', fullName: 'Pro Staff Two', key: 'pro-staff-2', role: 'STAFF', status: 'ACTIVE' },
  { companyId: MOCK_COMPANY_IDS.pro, email: 'staff3.pro@mock.nexhire', fullName: 'Pro Staff Three', key: 'pro-staff-3', role: 'STAFF', status: 'ACTIVE' },
  // Member locked by a PRO → FREE downgrade: stays in the FREE company as SUSPENDED (not deleted).
  { companyId: MOCK_COMPANY_IDS.free, email: 'suspended.free@mock.nexhire', fullName: 'Free Suspended Staff', key: 'free-suspended', role: 'STAFF', status: 'SUSPENDED' },
]

const userId = (key: string) => `mock-user-${key}`
const memberId = (key: string) => `mock-member-${key}`

function createJob(input: {
  id: string
  companyId: string
  companyName: string
  title: string
  status: CompanyJobStatus
  assigneeKey: string | null
  applicationCount?: number
  returnReason?: string | null
}): Job {
  const isPublished = input.status === 'PUBLISHED'

  return {
    applicationCount: input.applicationCount ?? 0,
    assigneeId: input.assigneeKey ? userId(input.assigneeKey) : null,
    benefits: null,
    categoryId: null,
    closedAt: null,
    companyId: input.companyId,
    companyLogoDocumentId: null,
    companyLogoUrl: null,
    companyName: input.companyName,
    createdAt: SEED_DATE,
    deadline: '2026-12-31T00:00:00.000Z',
    description: `Mock job description for ${input.title}.`,
    employmentType: 'FULL_TIME',
    experienceLevel: 'JUNIOR',
    id: input.id,
    isSalaryVisible: true,
    location: 'Ho Chi Minh City',
    moderation: { decision: null, matchedRules: [], reasons: [], riskLevel: null, riskScore: null },
    numberOfOpenings: 1,
    publishedAt: isPublished ? SEED_DATE : null,
    returnReason: input.returnReason ?? null,
    requirements: 'Mock requirements.',
    review: null,
    reviewReason: null,
    reviewedAt: null,
    salaryCurrency: 'VND',
    salaryMax: 30_000_000,
    salaryMin: 15_000_000,
    skills: ['TypeScript', 'React'],
    status: input.status,
    title: input.title,
    unpublishReason: null,
    unpublishedAt: null,
    updatedAt: SEED_DATE,
    version: 1,
    workingType: 'HYBRID',
  }
}

function createApplication(input: {
  id: string
  job: Job
  candidateName: string
  handlerKey: string | null
}): Application {
  const slug = input.candidateName.toLowerCase().replace(/\s+/g, '.')

  return {
    cancelledAt: null,
    candidateAvatarDocumentId: null,
    candidateAvatarUrl: null,
    candidateCvId: `${input.id}-cv`,
    candidateEmail: `${slug}@candidate.mock.nexhire`,
    candidateFullName: input.candidateName,
    candidateId: `${input.id}-candidate`,
    candidatePhone: null,
    candidateUserId: `${input.id}-candidate-user`,
    companyId: input.job.companyId,
    companyLogoDocumentId: null,
    companyLogoUrl: null,
    companyName: input.job.companyName ?? '',
    coverLetter: null,
    createdAt: SEED_DATE,
    cvDocumentId: `${input.id}-cv-doc`,
    cvFileName: `${slug}.pdf`,
    cvMimeType: 'application/pdf',
    cvParseStatus: 'PARSED',
    cvSize: 120_000,
    cvTitle: `${input.candidateName} CV`,
    decidedAt: null,
    handlerId: input.handlerKey ? userId(input.handlerKey) : null,
    id: input.id,
    jobId: input.job.id,
    jobTitle: input.job.title,
    matchLevel: 'MEDIUM',
    matchScore: 68,
    status: 'SUBMITTED',
    statusNote: null,
    submittedAt: SEED_DATE,
    updatedAt: SEED_DATE,
  }
}

export function createMockSeed(): MockDatabase {
  const freeCompany = createCompany({
    id: MOCK_COMPANY_IDS.free,
    name: 'Mock Free Company',
    ownerId: userId('free-owner'),
    plan: 'FREE',
    taxCode: '0000000001',
  })
  const proCompany = createCompany({
    id: MOCK_COMPANY_IDS.pro,
    name: 'Mock Pro Company',
    ownerId: userId('pro-owner'),
    plan: 'PRO',
    taxCode: '0000000002',
  })

  const accounts: MockAccount[] = ACCOUNT_SEEDS.map((seed) => ({
    companyId: seed.companyId,
    email: seed.email,
    fullName: seed.fullName,
    memberId: memberId(seed.key),
    password: MOCK_PASSWORD,
    phone: null,
    userId: userId(seed.key),
  }))

  const members: Member[] = ACCOUNT_SEEDS.map((seed) => ({
    companyId: seed.companyId,
    email: seed.email,
    id: memberId(seed.key),
    joinedAt: SEED_DATE,
    name: seed.fullName,
    role: seed.role,
    status: seed.status,
    userId: userId(seed.key),
  }))

  const pro = { companyId: proCompany.id, companyName: proCompany.name }
  const free = { companyId: freeCompany.id, companyName: freeCompany.name }

  const jobs: Job[] = [
    createJob({ ...pro, applicationCount: 2, assigneeKey: 'pro-manager', id: 'mock-job-pro-1', status: 'PUBLISHED', title: 'Senior Frontend Engineer' }),
    createJob({ ...pro, applicationCount: 0, assigneeKey: 'pro-staff-1', id: 'mock-job-pro-2', status: 'PENDING_APPROVAL', title: 'Backend Engineer (Node.js)' }),
    createJob({ ...pro, assigneeKey: 'pro-staff-2', id: 'mock-job-pro-3', status: 'DRAFT', title: 'QA Engineer' }),
    createJob({ ...pro, assigneeKey: 'pro-staff-1', id: 'mock-job-pro-4', returnReason: 'Please add the benefits section before resubmitting.', status: 'RETURNED', title: 'DevOps Engineer' }),
    createJob({ ...pro, applicationCount: 2, assigneeKey: 'pro-staff-3', id: 'mock-job-pro-5', status: 'PUBLISHED', title: 'Product Designer' }),
    createJob({ ...pro, assigneeKey: null, id: 'mock-job-pro-6', status: 'DRAFT', title: 'Data Analyst (unassigned)' }),
    createJob({ ...free, applicationCount: 1, assigneeKey: 'free-owner', id: 'mock-job-free-1', status: 'PUBLISHED', title: 'Fullstack Developer' }),
    createJob({ ...free, assigneeKey: 'free-owner', id: 'mock-job-free-2', status: 'DRAFT', title: 'Marketing Intern' }),
  ]

  const jobById = (id: string) => {
    const job = jobs.find((item) => item.id === id)
    if (!job) throw new Error(`Mock seed: unknown job ${id}`)
    return job
  }

  const applications: Application[] = [
    createApplication({ candidateName: 'Candidate Alpha', handlerKey: 'pro-manager', id: 'mock-app-pro-1', job: jobById('mock-job-pro-1') }),
    createApplication({ candidateName: 'Candidate Beta', handlerKey: 'pro-staff-1', id: 'mock-app-pro-2', job: jobById('mock-job-pro-1') }),
    createApplication({ candidateName: 'Candidate Gamma', handlerKey: 'pro-staff-3', id: 'mock-app-pro-3', job: jobById('mock-job-pro-5') }),
    createApplication({ candidateName: 'Candidate Delta', handlerKey: null, id: 'mock-app-pro-4', job: jobById('mock-job-pro-5') }),
    createApplication({ candidateName: 'Candidate Epsilon', handlerKey: 'free-owner', id: 'mock-app-free-1', job: jobById('mock-job-free-1') }),
  ]

  const auditLogs: AuditLog[] = [
    {
      action: 'MEMBER_ADDED',
      actorId: userId('pro-owner'),
      actorName: 'Pro Owner',
      companyId: proCompany.id,
      createdAt: '2026-09-02T03:00:00.000Z',
      id: 'mock-audit-1',
      metadata: { role: 'MANAGER' },
      targetId: memberId('pro-manager'),
      targetLabel: 'Pro Manager',
      targetType: 'MEMBER',
    },
    {
      action: 'JD_SUBMITTED',
      actorId: userId('pro-staff-1'),
      actorName: 'Pro Staff One',
      companyId: proCompany.id,
      createdAt: '2026-09-10T04:00:00.000Z',
      id: 'mock-audit-2',
      targetId: 'mock-job-pro-2',
      targetLabel: 'Backend Engineer (Node.js)',
      targetType: 'JOB',
    },
    {
      action: 'JD_RETURNED',
      actorId: userId('pro-manager'),
      actorName: 'Pro Manager',
      companyId: proCompany.id,
      createdAt: '2026-09-11T05:00:00.000Z',
      id: 'mock-audit-3',
      metadata: { returnReason: 'Please add the benefits section before resubmitting.' },
      targetId: 'mock-job-pro-4',
      targetLabel: 'DevOps Engineer',
      targetType: 'JOB',
    },
    {
      action: 'JD_APPROVED',
      actorId: userId('pro-manager'),
      actorName: 'Pro Manager',
      companyId: proCompany.id,
      createdAt: '2026-09-12T06:00:00.000Z',
      id: 'mock-audit-4',
      targetId: 'mock-job-pro-5',
      targetLabel: 'Product Designer',
      targetType: 'JOB',
    },
    {
      action: 'JD_ASSIGNED',
      actorId: userId('pro-manager'),
      actorName: 'Pro Manager',
      companyId: proCompany.id,
      createdAt: '2026-09-13T07:00:00.000Z',
      id: 'mock-audit-5',
      metadata: {
        fromAssigneeId: null,
        fromAssigneeName: null,
        toAssigneeId: userId('pro-staff-3'),
        toAssigneeName: 'Pro Staff Three',
      },
      targetId: 'mock-job-pro-5',
      targetLabel: 'Product Designer',
      targetType: 'JOB',
    },
    {
      action: 'PLAN_CHANGED',
      actorId: userId('free-owner'),
      actorName: 'Free Owner',
      companyId: freeCompany.id,
      createdAt: '2026-09-05T08:00:00.000Z',
      id: 'mock-audit-6',
      metadata: { fromPlan: 'PRO', toPlan: 'FREE' },
      targetId: freeCompany.id,
      targetLabel: freeCompany.name,
      targetType: 'COMPANY',
    },
  ]

  return {
    accounts,
    applications,
    auditLogs,
    companies: [freeCompany, proCompany],
    jobs,
    members,
  }
}
