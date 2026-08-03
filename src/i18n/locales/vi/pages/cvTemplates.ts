export const cvTemplates = {
  routeLabel: 'Mẫu CV',
  hero: {
    inventoryLabel: '01 mẫu đang khả dụng · CV builder có xuất PDF',
    title: 'Tạo CV từ mẫu chuẩn tuyển dụng',
    description:
      'Chọn mẫu đang hỗ trợ trong builder, chỉnh nội dung theo hồ sơ của bạn và xuất PDF khi sẵn sàng ứng tuyển.',
    primaryAction: 'Dùng mẫu Professional',
    secondaryAction: 'Xem danh sách mẫu',
  },
  stats: {
    readyTemplates: '{{count}} mẫu sẵn sàng',
    categoryGroups: '{{count}} nhóm ngành',
    exportReady: 'Xuất PDF trong builder',
  },
  filters: {
    label: 'Lọc mẫu CV theo nhóm ngành',
    countLabel: '{{count}} mẫu',
    emptyTitle: 'Chưa có mẫu phù hợp',
    emptyDescription: 'Thử chọn “Tất cả” hoặc quay lại khi NexHire mở thêm template mới.',
  },
  categories: {
    all: 'Tất cả',
    it: 'Công nghệ thông tin',
    marketing: 'Marketing / PR',
    sales: 'Kinh doanh / Bán hàng',
    hr: 'Nhân sự / Hành chính',
  },
  card: {
    readyLabel: 'Đang dùng được',
    categoriesLabel: 'Phù hợp',
    useTemplate: 'Dùng mẫu này',
    previewAlt: 'Xem trước mẫu CV {{name}}',
  },
  notes: {
    title: 'Flow hiện tại',
    items: [
      'Dữ liệu nhập trong builder được giữ khi đổi tab cấu hình.',
      'Template Professional đã có renderer thật và dùng được ngay.',
      'Các mẫu mới sẽ bật nút dùng khi có renderer tương ứng.',
    ],
  },
  upcoming: {
    title: 'Đang chuẩn bị',
    description: 'Các layout dưới đây chỉ là định hướng UI, chưa mở nút dùng mẫu để tránh dẫn sai vào builder.',
    badge: 'Sắp ra mắt',
    items: [
      {
        name: 'Minimal ATS',
        description: 'Một cột, ít màu, ưu tiên đọc nhanh qua hệ thống ATS.',
        category: 'IT / Operations',
      },
      {
        name: 'Portfolio Focus',
        description: 'Dành cho ứng viên cần đưa dự án và thành tựu lên trước.',
        category: 'Marketing / Product',
      },
      {
        name: 'Graduate Start',
        description: 'Nhẹ, rõ học vấn và hoạt động cho ứng viên mới đi làm.',
        category: 'Entry level',
      },
    ],
  },
}
