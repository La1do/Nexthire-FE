import type { CompaniesTranslations } from '../../../types'

export const companies: CompaniesTranslations = {
  routeLabel: 'Công ty',
  hero: {
    title: 'Khám phá công ty đang tuyển',
    description:
      'Theo dõi các nhà tuyển dụng đã xác thực, xem vai trò đang mở và chọn môi trường phù hợp trước khi ứng tuyển.',
    searchLabel: 'Tìm công ty',
    searchPlaceholder: 'Tên công ty, vị trí hoặc kỹ năng',
    locationLabel: 'Địa điểm',
    locationAll: 'Tất cả địa điểm',
    workModeLabel: 'Hình thức',
    workModeAll: 'Tất cả hình thức',
    reset: 'Xóa lọc',
  },
  stats: {
    companies: 'công ty đang tuyển',
    openRoles: 'việc làm mở',
    remoteFriendly: 'công ty hỗ trợ remote',
  },
  sort: {
    mostJobs: 'Nhiều việc nhất',
    latest: 'Mới tuyển gần đây',
    name: 'Tên A-Z',
  },
  sections: {
    directoryTitle: 'Danh sách công ty',
    directoryDescription: 'Lọc nhanh theo công ty, địa điểm và hình thức làm việc.',
    latestJobsTitle: 'Vai trò mới nổi bật',
    latestJobsDescription: 'Một vài vị trí mới nhất từ các công ty trong danh sách.',
  },
  card: {
    verified: 'Đã xác thực',
    openRoles: 'việc đang tuyển',
    latestHiring: 'Hoạt động gần nhất',
    locations: 'Địa điểm',
    workModes: 'Hình thức',
    rolesPreview: 'Vai trò mới',
    noLocation: 'Chưa cập nhật',
    noJobs: 'Chưa có vị trí hiển thị',
  },
  actions: {
    viewCompany: 'Xem hồ sơ',
    viewJobs: 'Xem việc làm',
    retry: 'Thử lại',
  },
  states: {
    loading: 'Đang tải danh sách công ty...',
    errorTitle: 'Không tải được danh sách công ty',
    errorDescription: 'Vui lòng thử lại sau ít phút.',
    emptyTitle: 'Không có công ty phù hợp',
    emptyDescription: 'Thử đổi từ khóa, địa điểm hoặc hình thức làm việc.',
  },
}
