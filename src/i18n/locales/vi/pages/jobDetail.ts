import type { JobDetailTranslations } from '../../../types'

export const jobDetail: JobDetailTranslations = {
  routeLabel: 'Chi tiết việc làm',
  backToSearch: 'Quay lại kết quả tìm kiếm',
  hero: {
    metaLabel: 'Thông tin chính của việc làm',
    verifiedLabel: 'Công ty đã xác thực',
  },
  sidebar: {
    title: 'Tổng quan tuyển dụng',
    salary: 'Mức lương',
    location: 'Địa điểm',
    workMode: 'Hình thức',
    field: 'Nhóm nghề',
    postedAt: 'Thời gian đăng',
    apply: 'Ứng tuyển ngay',
    save: 'Lưu việc làm',
  },
  sections: {
    overview: {
      title: 'Tổng quan vai trò',
      body: '{{company}} đang tìm {{title}} thuộc nhóm {{field}}. Vai trò này phù hợp với ứng viên muốn làm việc theo mô hình {{workMode}} tại {{location}} và ưu tiên tốc độ triển khai sản phẩm.',
    },
    responsibilities: {
      title: 'Bạn sẽ phụ trách',
      items: [
        'Xây dựng và cải tiến các hạng mục chính liên quan đến {{tags}}.',
        'Phối hợp cùng đội sản phẩm để chuyển yêu cầu tuyển dụng thành trải nghiệm rõ ràng cho người dùng.',
        'Theo dõi chất lượng triển khai, ghi nhận phản hồi và tối ưu luồng làm việc sau mỗi vòng phát hành.',
      ],
    },
    requirements: {
      title: 'Yêu cầu phù hợp',
      items: [
        'Có kinh nghiệm thực tế với {{tags}} hoặc các kỹ năng tương đương trong nhóm {{field}}.',
        'Giao tiếp rõ ràng khi làm việc theo mô hình {{workMode}}.',
        'Chủ động phân tích vấn đề, đề xuất phương án và hoàn thành cam kết đúng nhịp đội nhóm.',
      ],
    },
    benefits: {
      title: 'Quyền lợi nổi bật',
      items: [
        'Dải lương tham khảo {{salary}} cùng quy trình phỏng vấn minh bạch.',
        'Môi trường {{workMode}} tại {{location}} với đội ngũ đã quen cách làm sản phẩm hiện đại.',
        'Hồ sơ từ NexHire được chuẩn hóa để nhà tuyển dụng phản hồi nhanh hơn.',
      ],
    },
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
