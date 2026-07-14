import type { SearchTranslations } from '../../../types'

export const search: SearchTranslations = {
  routeLabel: 'Tìm kiếm việc làm',
  toolbar: {
    title: 'Tìm việc theo tiêu chí của bạn',
    description: 'Tinh chỉnh từ khóa, địa điểm và bộ lọc để xem những vị trí phù hợp nhất.',
    keywordLabel: 'Từ khóa',
    keywordPlaceholder: 'Chức danh, kỹ năng hoặc công ty',
    locationLabel: 'Địa điểm',
    locationPlaceholder: 'Tất cả địa điểm',
    submit: 'Cập nhật tìm kiếm',
  },
  filters: {
    title: 'Bộ lọc',
    description: 'Giữ bộ lọc ngắn gọn để bạn quét kết quả nhanh hơn.',
    fieldLabel: 'Nhóm nghề',
    locationLabel: 'Địa điểm',
    salaryLabel: 'Mức lương tối thiểu',
    workModeLabel: 'Hình thức làm việc',
    allOption: 'Tất cả',
    clear: 'Xóa bộ lọc',
    apply: 'Áp dụng',
    fieldOptions: [
      { label: 'Engineering', value: 'Engineering' },
      { label: 'Marketing', value: 'Marketing' },
      { label: 'Design', value: 'Design' },
      { label: 'Business', value: 'Business' },
    ],
    salaryOptions: [
      { label: 'Từ 15 triệu', value: '15' },
      { label: 'Từ 20 triệu', value: '20' },
      { label: 'Từ 25 triệu', value: '25' },
      { label: 'Từ 35 triệu', value: '35' },
    ],
    workModeOptions: [
      { label: 'Remote', value: 'Remote' },
      { label: 'Hybrid', value: 'Hybrid' },
      { label: 'On-site', value: 'On-site' },
    ],
  },
  results: {
    title: 'Kết quả phù hợp',
    countLabel: '{{count}} việc làm được tìm thấy',
    emptyQuery: 'Tất cả việc làm đang mở',
    sortLabel: 'Sắp xếp',
    sortOptions: [
      { label: 'Phù hợp nhất', value: 'relevance' },
      { label: 'Mới nhất', value: 'newest' },
      { label: 'Lương cao', value: 'salary' },
    ],
    saveLabel: 'Lưu việc làm',
    verifiedLabel: 'Đã xác thực',
    detailLabel: 'Xem chi tiết',
    activeFiltersLabel: 'Bộ lọc đang dùng',
  },
  empty: {
    title: 'Chưa có việc làm phù hợp',
    description: 'Thử rút gọn từ khóa hoặc xóa bớt bộ lọc để mở rộng kết quả.',
    action: 'Xem tất cả việc làm',
  },
}
