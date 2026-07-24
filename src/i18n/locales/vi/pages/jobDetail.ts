import type { JobDetailTranslations } from '../../../types'

export const jobDetail: JobDetailTranslations = {
  routeLabel: 'Chi tiết việc làm',
  backToSearch: 'Quay lại kết quả tìm kiếm',
  states: {
    loading: 'Đang tải việc làm...',
    errorTitle: 'Không tải được việc làm',
    errorDescription: 'Đã có lỗi xảy ra khi tải tin tuyển dụng. Vui lòng thử lại.',
  },
  hero: {
    metaLabel: 'Thông tin chính của việc làm',
    verifiedLabel: 'Công ty đã xác thực',
  },
  sidebar: {
    title: 'Tổng quan tuyển dụng',
    salary: 'Mức lương',
    location: 'Địa điểm',
    workMode: 'Hình thức',
    postedAt: 'Thời gian đăng',
    deadline: 'Hạn nộp hồ sơ',
    noDeadline: 'Không giới hạn',
    openings: 'Số lượng tuyển',
    apply: 'Ứng tuyển ngay',
    save: 'Lưu việc làm',
    saved: 'Đã lưu',
    saveError: 'Không thể lưu việc làm này lúc này. Vui lòng thử lại.',
    jobNotPublic: 'Việc làm này đã ngừng công khai và không thể lưu.',
    loginHint: 'Đăng nhập để lưu việc làm và xem lại trong danh sách của bạn.',
  },
  sections: {
    description: 'Mô tả công việc',
    requirements: 'Yêu cầu công việc',
    benefits: 'Quyền lợi',
  },
  related: {
    title: 'Việc làm liên quan',
    viewAll: 'Xem thêm trên tìm kiếm',
    viewDetail: 'Xem chi tiết',
  },
  notFound: {
    title: 'Không tìm thấy việc làm',
    description: 'Tin tuyển dụng này có thể đã đóng hoặc đường dẫn chưa chính xác.',
    action: 'Quay lại trang tìm kiếm',
  },
}
