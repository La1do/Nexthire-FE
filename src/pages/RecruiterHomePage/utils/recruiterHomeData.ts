import type {
  CompanyVerificationFormValues,
  RecruiterApplication,
  RecruiterCompany,
  RecruiterPerformancePoint,
  RecruiterPipelineItem,
  RecruiterQuickAction,
  RecruiterStat,
  RecruiterTask,
} from '../types'

export const recruiterCompanyFixture: RecruiterCompany = {
  id: 'company-fpt',
  address: 'Toa nha FPT, Duy Tan, Cau Giay, Ha Noi',
  completion: 72,
  description: 'Cong ty cong nghe cung cap dich vu phan mem va giai phap chuyen doi so cho thi truong quoc te.',
  logo: '',
  name: 'FPT Software',
  status: 'NO_COMPANY',
  submittedAt: '10/06/2026',
  taxCode: '0101092557',
  website: 'https://fpt.com.vn',
}

export const recruiterStats: ReadonlyArray<RecruiterStat> = [
  { id: 'activeJobs', delta: '+3 tuan nay', label: 'Tin dang tuyen', tone: 'blue', value: '12' },
  { id: 'pendingJobs', delta: 'Can theo doi', label: 'Cho duyet', tone: 'amber', value: '2' },
  { id: 'newApplications', delta: '+18%', label: 'Ung vien moi', tone: 'green', value: '48' },
  { id: 'responseRate', delta: 'Tot', label: 'Ty le phan hoi', tone: 'coral', value: '87%' },
]

export const recruiterQuickActions: ReadonlyArray<RecruiterQuickAction> = [
  {
    id: 'postJob',
    description: 'Tao tin tuyen dung moi va gui duyet nhanh.',
    disabledWhenUnverified: true,
    href: '/recruiter/jobs/new',
    label: 'Dang tin moi',
  },
  {
    id: 'reviewCandidates',
    description: 'Loc ung vien moi theo diem phu hop.',
    disabledWhenUnverified: true,
    href: '/recruiter/candidates',
    label: 'Xem ung vien',
  },
  {
    id: 'companyProfile',
    description: 'Cap nhat ho so, logo va tai lieu xac minh.',
    href: '/recruiter/company',
    label: 'Ho so cong ty',
  },
]

export const recruiterPipeline: ReadonlyArray<RecruiterPipelineItem> = [
  { id: 'draft', count: 4, label: 'Nhap', tone: 'amber' },
  { id: 'pending', count: 2, label: 'Cho duyet', tone: 'coral' },
  { id: 'active', count: 12, label: 'Dang tuyen', tone: 'green' },
  { id: 'paused', count: 3, label: 'Tam dung', tone: 'blue' },
]

export const recruiterApplications: ReadonlyArray<RecruiterApplication> = [
  {
    id: 'app-01',
    candidateName: 'Nguyen Minh Khoa',
    role: 'Senior Frontend Engineer',
    score: '92%',
    stage: 'Moi ung tuyen',
    status: 'SUBMITTED',
    submittedAt: 'Hom nay',
  },
  {
    id: 'app-02',
    candidateName: 'Tran Thi Huong',
    role: 'Backend Engineer',
    score: '86%',
    stage: 'Cho phong van',
    status: 'OFFERED',
    submittedAt: 'Hom qua',
  },
  {
    id: 'app-03',
    candidateName: 'Le Quoc Bao',
    role: 'Product Designer',
    score: '78%',
    stage: 'Can phan hoi',
    status: 'SUBMITTED',
    submittedAt: '2 ngay truoc',
  },
]

export const recruiterPerformance: ReadonlyArray<RecruiterPerformancePoint> = [
  { count: 42, id: 'mon', label: 'T2' },
  { count: 58, id: 'tue', label: 'T3' },
  { count: 74, id: 'wed', label: 'T4' },
  { count: 62, id: 'thu', label: 'T5' },
  { count: 88, id: 'fri', label: 'T6' },
  { count: 54, id: 'sat', label: 'T7' },
]

export const recruiterTasks: ReadonlyArray<RecruiterTask> = [
  {
    id: 'verify-company',
    description: 'Hoan tat dang ky xac thuc de mo khoa dang tin.',
    label: 'Xac thuc cong ty',
    tone: 'coral',
  },
  {
    id: 'pending-jobs',
    description: '2 tin dang cho admin duyet trong hang doi.',
    label: 'Theo doi tin cho duyet',
    tone: 'amber',
  },
  {
    id: 'reply-candidates',
    description: '5 ung vien chua nhan phan hoi trong 48 gio.',
    label: 'Phan hoi ung vien',
    tone: 'green',
  },
]

export function createCompanyFormValues(company: RecruiterCompany): CompanyVerificationFormValues {
  return {
    address: company.address,
    description: company.description,
    documents: [],
    logo: company.logo,
    name: company.name,
    taxCode: company.taxCode,
    website: company.website,
  }
}
