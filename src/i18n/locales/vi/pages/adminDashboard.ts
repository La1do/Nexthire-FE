import type { AdminDashboardTranslations } from '../../../types'

export const adminDashboard: AdminDashboardTranslations = {
  routeLabel: 'Tổng quan quản trị',
  pageTitle: 'Tổng quan quản trị',
  subtitle: 'Theo dõi người dùng, doanh nghiệp và hoạt động kiểm duyệt trên toàn hệ thống.',
  loadingLabel: 'Đang tải dữ liệu tổng quan',
  header: {
    lastUpdated: 'Cập nhật lúc',
    refresh: 'Làm mới',
    refreshing: 'Đang làm mới',
  },
  growth: {
    title: 'Tăng trưởng người dùng',
    description: 'Theo dõi quy mô người dùng và số tài khoản mới theo thời gian.',
    demoBadge: 'Dữ liệu minh họa',
    comparisonLabel: 'So với kỳ trước',
    unavailableLabel: 'Chưa thể so sánh',
    totalUsers: 'Tổng người dùng',
    newUsers: 'Người dùng mới',
    periods: {
      '7d': '7 ngày',
      '30d': '30 ngày',
      '90d': '90 ngày',
    },
  },
  error: {
    title: 'Không thể tải tổng quan',
    description: 'Dữ liệu quản trị hiện chưa khả dụng. Vui lòng thử lại.',
    retry: 'Thử lại',
  },
  empty: {
    title: 'Chưa có dữ liệu hệ thống',
    description: 'Các chỉ số sẽ xuất hiện khi hệ thống có người dùng, doanh nghiệp hoặc tin tuyển dụng.',
  },
  stats: {
    users: 'Tổng người dùng',
    pendingCompanies: 'Doanh nghiệp chờ duyệt',
    pendingJobs: 'Tin chờ kiểm duyệt',
    pendingRevisions: 'Bản chỉnh sửa chờ duyệt',
  },
  charts: {
    usersByRole: 'Người dùng theo vai trò',
    companiesByStatus: 'Doanh nghiệp theo trạng thái',
    jobsByStatus: 'Tin tuyển dụng theo trạng thái',
    noData: 'Chưa có dữ liệu',
  },
  roles: {
    CANDIDATE: 'Ứng viên',
    RECRUITER: 'Nhà tuyển dụng',
    ADMIN: 'Quản trị viên',
  },
  companyStatuses: {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    SUSPENDED: 'Tạm khóa',
  },
  jobStatuses: {
    DRAFT: 'Bản nháp',
    PENDING_REVIEW: 'Chờ duyệt',
    NEEDS_REVIEW: 'Cần xem xét',
    SHOULD_REJECT: 'Đề xuất từ chối',
    PUBLISHED: 'Đã đăng',
    UNPUBLISHED: 'Đã ẩn',
    CLOSED: 'Đã đóng',
    REJECTED: 'Từ chối',
    ARCHIVED: 'Lưu trữ',
  },
  queues: {
    title: 'Hàng chờ cần xử lý',
    description: 'Đi thẳng đến các mục đang cần quản trị viên xem xét.',
    companies: 'Doanh nghiệp chờ xác minh',
    jobs: 'Tin tuyển dụng chờ kiểm duyệt',
    revisions: 'Bản chỉnh sửa chờ kiểm duyệt',
    action: 'Xem danh sách',
  },
}
