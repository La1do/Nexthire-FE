import type { HomeTranslations } from '../../../types'

export const home: HomeTranslations = {
  states: {
    loading: 'Đang tải việc làm…',
    errorTitle: 'Không tải được mục này',
    errorDescription: 'Vui lòng tải lại trang hoặc thử lại sau giây lát.',
    emptyTitle: 'Chưa có dữ liệu',
    emptyDescription: 'Hiện chưa có kết quả phù hợp.',
  },
  hero: {
    eyebrow: 'Cơ hội nghề nghiệp',
    title: 'Tìm việc làm đúng với nhịp phát triển của bạn',
    description: 'Khám phá việc làm chất lượng từ các công ty đã xác thực, lọc nhanh theo địa điểm, mức lương và hình thức làm việc.',
    keywordLabel: 'Từ khóa công việc',
    keywordPlaceholder: 'Chức danh, kỹ năng hoặc công ty',
    locationLabel: 'Địa điểm',
    locationPlaceholder: 'Tất cả địa điểm',
    locationOptions: ['Hà Nội', 'TP. HCM', 'Đà Nẵng', 'Remote'],
    filterLabel: 'Mở bộ lọc',
    submit: 'Tìm kiếm',
    quickFilters: ['Remote', 'Hybrid', 'Senior', 'Lương 25M+'],
    stats: {
      openRoles: 'việc làm mở',
      companies: 'công ty xác thực',
      categories: 'nhóm nghề',
    },
    spotlight: {
      title: 'Đang tuyển mạnh',
      subtitle: 'Công ty có nhiều vị trí phù hợp trong tuần này',
    },
  },
  employers: {
    eyebrow: 'Đối tác tuyển dụng',
    title: 'Nhà tuyển dụng đang tăng tốc',
    viewAll: 'Xem tất cả',
  },
  jobs: {
    eyebrow: 'Danh sách việc làm',
    title: 'Việc làm phù hợp hôm nay',
    tabs: ['Phù hợp', 'Mới đăng', 'Lương cao'],
    loadMore: 'Xem thêm việc làm',
    saveLabel: 'Lưu việc làm',
  },
  categories: {
    eyebrow: 'Khám phá nhanh',
    title: 'Lọc theo nhóm nghề',
  },
  industryJobs: {
    eyebrow: 'Theo nhóm ngành',
    title: 'Cơ hội theo ngành',
    viewAll: 'Xem tất cả nhóm ngành',
    viewMore: 'Xem thêm',
    saveLabel: 'Lưu việc làm',
  },
  articles: {
    title: 'Cẩm nang nghề nghiệp',
    readMore: 'Đọc thêm',
    items: [
      {
        category: 'Interview',
        description: 'Checklist chuẩn bị câu trả lời, câu hỏi ngược và cách follow-up sau buổi phỏng vấn.',
        title: 'Cách tạo ấn tượng trong buổi phỏng vấn tiếp theo',
        tone: 'coral',
      },
      {
        category: 'CV',
        description: 'Cách trình bày thành tựu, kỹ năng và dự án để nhà tuyển dụng đọc nhanh hơn.',
        title: 'Xây dựng CV nổi bật trong 30 phút',
        tone: 'blue',
      },
      {
        category: 'Growth',
        description: 'Nhận diện thời điểm chuyển vai trò, thương lượng lương và xây dựng kế hoạch học tập.',
        title: 'Chiến lược phát triển sự nghiệp bền vững',
        tone: 'green',
      },
    ],
  },
  newsletter: {
    eyebrow: 'Nhận việc làm mới',
    title: 'Thiết lập job alert theo đúng mục tiêu',
    description: 'Nhận email hằng tuần về việc làm mới, lương tốt và nội dung nghề nghiệp hữu ích.',
    emailLabel: 'Email nhận thông báo',
    emailPlaceholder: 'Email của bạn',
    submit: 'Đăng ký',
    chips: ['Engineering', 'Remote', '25M+', 'Senior'],
    mockTitle: 'Bản tin phù hợp',
    mockLines: ['4 việc làm mới từ công ty đã xác thực', '2 vị trí remote có mức lương phù hợp', 'Checklist phỏng vấn cho tuần này'],
  },
}
