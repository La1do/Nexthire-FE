import type { AdminSettingsTranslations } from '../../../types'

export const adminSettings: AdminSettingsTranslations = {
  routeLabel: 'Quản trị viên — Cài đặt',
  pageTitle: 'Cài đặt quản trị',
  pageSubtitle: 'Quản lý thông tin cá nhân, bảo mật và tùy chọn hiển thị của tài khoản.',
  summary: { accountId: 'Mã tài khoản', email: 'Email', role: 'Vai trò', adminRole: 'Quản trị viên', fallbackName: 'Quản trị viên NexHire', changeAvatar: 'Thay ảnh', saveAvatar: 'Lưu ảnh', cancelAvatar: 'Hủy', removeAvatar: 'Xóa ảnh', avatarHint: 'JPG, PNG hoặc WEBP, tối đa 5 MB.', invalidAvatar: 'Ảnh phải là JPG, PNG hoặc WEBP và không vượt quá 5 MB.', avatarError: 'Không thể cập nhật ảnh đại diện.' },
  profile: {
    title: 'Thông tin cá nhân', description: 'Thông tin được dùng để nhận diện tài khoản trong khu vực quản trị.',
    fullName: 'Họ và tên', fullNamePlaceholder: 'Nhập họ và tên', phone: 'Số điện thoại', phonePlaceholder: 'Nhập số điện thoại',
    email: 'Email đăng nhập', emailHint: 'Email không thể thay đổi tại đây.', role: 'Vai trò', save: 'Lưu thay đổi', saving: 'Đang lưu...',
    reset: 'Hủy thay đổi', saveSuccess: 'Thông tin tài khoản đã được cập nhật.', saveError: 'Không thể cập nhật thông tin tài khoản.',
    validation: { fullNameRequired: 'Vui lòng nhập họ và tên.', fullNameMin: 'Họ tên phải có ít nhất 2 ký tự.', fullNameMax: 'Họ tên không được vượt quá 255 ký tự.', phoneInvalid: 'Số điện thoại không hợp lệ.', phoneMax: 'Số điện thoại không được vượt quá 30 ký tự.' },
  },
  password: {
    title: 'Đổi mật khẩu', description: 'Dùng mật khẩu mạnh và không trùng với mật khẩu hiện tại.', current: 'Mật khẩu hiện tại', next: 'Mật khẩu mới', confirm: 'Xác nhận mật khẩu mới',
    show: 'Hiện mật khẩu', hide: 'Ẩn mật khẩu', submit: 'Cập nhật mật khẩu', submitting: 'Đang cập nhật...', success: 'Mật khẩu đã được thay đổi.', error: 'Không thể thay đổi mật khẩu.',
    rulesTitle: 'Mật khẩu mạnh nên có:', lengthRule: 'Từ 8 đến 128 ký tự', caseRule: 'Chữ hoa và chữ thường', numberRule: 'Ít nhất một chữ số', symbolRule: 'Ít nhất một ký tự đặc biệt',
    validation: { currentRequired: 'Vui lòng nhập mật khẩu hiện tại.', nextRequired: 'Vui lòng nhập mật khẩu mới.', confirmRequired: 'Vui lòng xác nhận mật khẩu mới.', length: 'Mật khẩu phải có từ 8 đến 128 ký tự.', mismatch: 'Mật khẩu xác nhận không khớp.', reuse: 'Mật khẩu mới không được giống mật khẩu hiện tại.' },
    apiErrors: { invalidCredentials: 'Mật khẩu hiện tại không đúng.', passwordReuse: 'Mật khẩu mới không được trùng mật khẩu cũ.', credentialMissing: 'Không tìm thấy thông tin mật khẩu của tài khoản.' },
  },
  preferences: { title: 'Tùy chọn và phiên đăng nhập', description: 'Điều chỉnh ngôn ngữ hoặc kết thúc phiên quản trị hiện tại.', language: 'Ngôn ngữ hiển thị', languageHint: 'Dropdown ở header chỉ đổi tạm trên thiết bị này. Bấm lưu tại đây để đồng bộ vào tài khoản.', languageReset: 'Hoàn tác', languageSave: 'Lưu ngôn ngữ', languageSaveError: 'Chưa thể lưu ngôn ngữ.', languageSaveSuccess: 'Ngôn ngữ hiển thị đã được lưu.', languageSaving: 'Đang lưu...', sessionTitle: 'Phiên đăng nhập', sessionDescription: 'Đăng xuất an toàn khỏi thiết bị này.', logout: 'Đăng xuất' },
  logout: { title: 'Xác nhận đăng xuất', description: 'Bạn sẽ cần đăng nhập lại để truy cập khu vực quản trị.', confirm: 'Đăng xuất', cancel: 'Ở lại' },
  feedback: { loading: 'Đang tải thông tin tài khoản', errorTitle: 'Không tải được cài đặt', errorDescription: 'Không thể lấy thông tin tài khoản quản trị.', retry: 'Thử lại' },
}
