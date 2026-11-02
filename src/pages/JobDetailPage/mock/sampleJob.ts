import type { PublicJobDetail } from '../../../types/job.types'
import type { JobCompanyInfo, JobDetailHighlightBox, JobDetailLocationTime, JobDetailOverviewData } from '../types'

export const SAMPLE_JOB_DETAIL: PublicJobDetail = {
  id: 'demo',
  title: 'Trưởng Nhóm Kiểm Toán (Audit Team Leader) - Thu Nhập 18-25 + Thưởng KPI',
  companyId: 'company-ito',
  companyName: 'CÔNG TY TNHH KIỂM TOÁN I.T.O',
  companyLogoUrl: 'https://cdn-new.topcv.vn/unsafe/150x/https://static.topcv.vn/company_logos/cong-ty-tnhh-kiem-toan-ito-602e3ecae3cae.jpg',
  companyLogoDocumentId: null,
  skills: ['Trưởng nhóm kiểm toán', 'Tài chính', 'Kế toán', 'Kiểm toán'],
  categoryId: 'audit',
  employmentType: 'FULL_TIME',
  workingType: 'ONSITE',
  experienceLevel: 'LEAD',
  location: 'Hồ Chí Minh',
  salaryMin: 18000000,
  salaryMax: 25000000,
  salaryCurrency: 'VND',
  isSalaryVisible: true,
  deadline: '2026-11-30T00:00:00.000Z',
  publishedAt: '2026-10-15T00:00:00.000Z',
  numberOfOpenings: 1,
  createdAt: '2026-10-15T00:00:00.000Z',
  updatedAt: '2026-10-15T00:00:00.000Z',
  description: `• Điều hành và phụ trách các cuộc kiểm toán Báo cáo tài chính.
• Phân công, hướng dẫn và kiểm soát công việc của các thành viên trong nhóm.
• Soát xét hồ sơ kiểm toán, Báo cáo tài chính và các tài liệu liên quan.
• Trao đổi trực tiếp với khách hàng, xử lý các vấn đề phát sinh trong quá trình kiểm toán.
• Đảm bảo tiến độ và chất lượng hợp đồng kiểm toán.
• Tham gia đào tạo và phát triển nhân sự trong nhóm.`,
  requirements: `• Tốt nghiệp Đại học chuyên ngành Kế toán, Kiểm toán, Tài chính hoặc liên quan.
• Có từ 3 năm kinh nghiệm trong lĩnh vực kiểm toán.
• Có kinh nghiệm thực hiện kiểm toán Báo cáo tài chính và dẫn dắt nhóm.
• Nắm vững Chuẩn mực kiểm toán và các quy định kế toán liên quan.
• Có khả năng giao tiếp và làm việc trực tiếp với khách hàng.
• CPA/ACCA hoặc các chứng chỉ chuyên môn là lợi thế, không bắt buộc.`,
  benefits: `• Lương 18–25 triệu/tháng + KPI/thưởng.
• Thu nhập tăng thêm khi đạt hoặc vượt KPI.
• Được đào tạo chuyên môn và kỹ năng quản lý.
• Có lộ trình phát triển lên Audit Manager/Trưởng phòng theo năng lực.
• Được tiếp xúc đa dạng khách hàng và các hợp đồng kiểm toán thực tế.
• Môi trường chuyên nghiệp, đồng nghiệp hỗ trợ và đề cao năng lực.
• Đầy đủ BHXH và các chế độ phúc lợi theo quy định.`,
}

export const SAMPLE_COMPANY_INFO: JobCompanyInfo = {
  id: 'company-ito',
  name: 'CÔNG TY TNHH KIỂM TOÁN I.T.O',
  logoUrl: 'https://cdn-new.topcv.vn/unsafe/150x/https://static.topcv.vn/company_logos/cong-ty-tnhh-kiem-toan-ito-602e3ecae3cae.jpg',
  scale: '25-99 nhân viên',
  address: '56 Nguyễn Đình Chiểu, Phường Tân Định, Thành phố Hồ Chí...',
  industry: 'Hoạt động liên quan đến kế toán, kiểm toán và tư vấn về thuế',
}

export const SAMPLE_OVERVIEW: JobDetailOverviewData = {
  requirements: ['3 năm kinh nghiệm chuyên môn', 'Đại Học trở lên'],
  benefits: ['Bảo hiểm xã hội', 'Thưởng hiệu quả làm việc', 'Khám sức khỏe định kỳ'],
  benefitsRow2: ['Bảo hiểm xã hội', 'Thưởng hiệu quả làm việc', 'Khám sức khỏe định kỳ'],
  specialties: ['Trưởng nhóm kiểm toán', 'Tài chính', 'Kế toán', 'Kiểm toán'],
}

export const SAMPLE_CANDIDATE_HIGHLIGHTS: JobDetailHighlightBox[] = [
  {
    iconType: 'knowledge',
    label: 'Kiến thức ngành',
    value: 'Tài chính, Kế toán, Kiểm toán',
  },
  {
    iconType: 'requiredSkill',
    label: 'Kỹ năng cần có',
    value: 'Kế Toán, Kiểm Toán, Tài Chính',
  },
  {
    iconType: 'preferredSkill',
    label: 'Kỹ năng nên có',
    value: 'trưởng nhóm, Audit Team Leader',
  },
]

export const SAMPLE_SUPPLEMENTAL_BENEFITS: string[] = [
  'Bảo hiểm xã hội',
  'Thưởng hiệu quả làm việc',
  'Khám sức khỏe định kỳ',
  'Du lịch hàng năm',
]

export const SAMPLE_LOCATION_TIME: JobDetailLocationTime = {
  workLocation: 'Hồ Chí Minh: 18H Cộng Hòa, Phường Tân Sơn Nhất (Phường Tân Sơn Nhất thuộc quận Tân Bình cũ)',
  workHours: [
    'Thứ 2 - Thứ 6 (từ 08:00 đến 17:00)',
    'Từ thứ 2 - thứ 6 (Tháng 4 đến tháng 11). Từ thứ 2 - thứ 7 (Tháng 12 đến tháng 3).',
  ],
  applyNote: 'Ứng viên nộp hồ sơ trực tuyến bằng cách bấm Ứng tuyển ngay dưới đây.',
}
