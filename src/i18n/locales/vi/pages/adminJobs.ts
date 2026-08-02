import type { AdminJobsTranslations } from '../../../types'

export const adminJobs: AdminJobsTranslations = {
  routeLabel: 'Quản trị viên — Tin tuyển dụng',
  pageTitle: 'Kiểm duyệt tin tuyển dụng',
  pageSubtitle: 'Theo dõi nội dung, mức độ rủi ro và xử lý các hàng đợi kiểm duyệt.',
  tabs: { all: 'Tất cả tin', review: 'Tin chờ duyệt', revisions: 'Bản chỉnh sửa' },
  stats: { total: 'Tổng tin', review: 'Chờ kiểm duyệt', published: 'Đang đăng', revisions: 'Bản sửa chờ duyệt' },
  filters: { searchLabel: 'Tìm kiếm', searchPlaceholder: 'Tiêu đề, công ty, địa điểm hoặc kỹ năng', statusLabel: 'Trạng thái', statusAll: 'Tất cả trạng thái', riskLabel: 'Mức rủi ro', riskAll: 'Tất cả mức độ', companyLabel: 'Công ty', companyAll: 'Tất cả công ty', sortLabel: 'Sắp xếp', clear: 'Xóa lọc' },
  columns: { job: 'Tin tuyển dụng', company: 'Công ty', status: 'Trạng thái', risk: 'Rủi ro', applications: 'Ứng tuyển', updated: 'Cập nhật', actions: 'Hành động' },
  statuses: { DRAFT: 'Bản nháp', PENDING_REVIEW: 'Chờ duyệt', NEEDS_REVIEW: 'Cần xem xét', SHOULD_REJECT: 'Đề xuất từ chối', PUBLISHED: 'Đã đăng', UNPUBLISHED: 'Đã ẩn', REJECTED: 'Đã từ chối', CLOSED: 'Đã đóng', EXPIRED: 'Hết hạn', APPROVED: 'Đã duyệt', CANCELLED: 'Đã hủy' },
  risks: { LOW: 'Thấp', MEDIUM: 'Trung bình', HIGH: 'Cao', CRITICAL: 'Nghiêm trọng', NONE: 'Chưa đánh giá' },
  sorts: { latest: 'Mới nhất', oldest: 'Cũ nhất', risk: 'Rủi ro cao nhất', applications: 'Nhiều ứng tuyển nhất' },
  detail: { title: 'Chi tiết kiểm duyệt', description: 'Mô tả công việc', requirements: 'Yêu cầu', benefits: 'Quyền lợi', skills: 'Kỹ năng', moderation: 'Phân tích kiểm duyệt', reasons: 'Lý do cảnh báo', rules: 'Quy tắc khớp', changeSummary: 'Tóm tắt thay đổi', noData: 'Chưa có dữ liệu', close: 'Đóng' },
  actions: { view: 'Xem chi tiết', approve: 'Duyệt', reject: 'Từ chối', unpublish: 'Gỡ đăng', republish: 'Đăng lại', close: 'Đóng tin', cancel: 'Hủy', confirmTitle: 'Xác nhận thao tác', confirmDescription: 'Bạn có chắc muốn {{action}} “{{title}}”?', reasonTitle: 'Nhập lý do xử lý', reasonDescription: 'Vui lòng nêu rõ lý do {{action}} “{{title}}”.', reasonLabel: 'Lý do', reasonPlaceholder: 'Nhập lý do để nhà tuyển dụng và quản trị viên có thể đối chiếu...', reasonRequired: 'Lý do không được để trống.' },
  feedback: { loading: 'Đang tải dữ liệu tin tuyển dụng', errorTitle: 'Không tải được tin tuyển dụng', errorDescription: 'Không thể lấy dữ liệu quản trị tin tuyển dụng.', retry: 'Thử lại', emptyTitle: 'Không có tin phù hợp', emptyDescription: 'Hãy thay đổi từ khóa hoặc bộ lọc để mở rộng kết quả.', countLabel: '{{count}} tin tuyển dụng', actionSuccess: 'Cập nhật tin tuyển dụng thành công.', actionError: 'Không thể thực hiện thao tác.' },
  pagination: { prev: 'Trang trước', next: 'Trang sau', pageOf: 'Trang {{current}} / {{total}}' },
}
