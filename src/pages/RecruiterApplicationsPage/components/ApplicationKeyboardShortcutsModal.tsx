import { useEffect } from 'react'
import { ArrowDown, ArrowUp, Check, Eye, HelpCircle, Keyboard, UserCheck, UserX, X } from 'lucide-react'

type ApplicationKeyboardShortcutsModalProps = {
  isOpen: boolean
  onClose: () => void
}

type ShortcutRow = {
  description: string
  keys: string[]
  icon: typeof Keyboard
  category?: string
}

const SHORTCUTS: ReadonlyArray<ShortcutRow> = [
  {
    category: 'Điều hướng ứng viên',
    description: 'Chuyển sang ứng viên kế tiếp trong danh sách',
    keys: ['J', '↓'],
    icon: ArrowDown,
  },
  {
    category: 'Điều hướng ứng viên',
    description: 'Quay lại ứng viên trước đó trong danh sách',
    keys: ['K', '↑'],
    icon: ArrowUp,
  },
  {
    category: 'Điều hướng ứng viên',
    description: 'Bật / tắt chế độ xem mở rộng 2 cột (Đối chiếu CV & JD)',
    keys: ['V'],
    icon: Eye,
  },
  {
    category: 'Điều hướng ứng viên',
    description: 'Đóng ngăn chi tiết ứng viên hoặc đóng hộp thoại',
    keys: ['Esc'],
    icon: X,
  },
  {
    category: 'Quyết định tuyển dụng',
    description: 'Mở hộp thoại Phê duyệt / Đề nghị (Offer)',
    keys: ['O'],
    icon: UserCheck,
  },
  {
    category: 'Quyết định tuyển dụng',
    description: 'Mở hộp thoại Từ chối ứng viên (Reject)',
    keys: ['R'],
    icon: UserX,
  },
  {
    category: 'Trợ giúp',
    description: 'Mở / Đóng bảng hướng dẫn phím tắt này',
    keys: ['?'],
    icon: HelpCircle,
  },
]

export function ApplicationKeyboardShortcutsModal({
  isOpen,
  onClose,
}: ApplicationKeyboardShortcutsModalProps) {
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      aria-labelledby="recruiter-shortcuts-modal-title"
      aria-modal="true"
      className="recruiter-shortcuts-modal-backdrop"
      onClick={onClose}
      role="dialog"
    >
      <div
        className="recruiter-shortcuts-modal-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="recruiter-shortcuts-modal-header">
          <div className="recruiter-shortcuts-modal-header__title">
            <span className="recruiter-shortcuts-modal-header__icon">
              <Keyboard size={20} />
            </span>
            <div>
              <h2 id="recruiter-shortcuts-modal-title">Phím tắt thao tác nhanh (ATS Hotkeys)</h2>
              <p>Duyệt hồ sơ tốc độ cao tương tự các nền tảng ATS quốc tế (Greenhouse, Lever, Ashby).</p>
            </div>
          </div>
          <button
            aria-label="Đóng bảng phím tắt"
            className="recruiter-shortcuts-modal-close"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </header>

        <div className="recruiter-shortcuts-modal-body">
          <div className="recruiter-shortcuts-list">
            {SHORTCUTS.map((item, index) => {
              const Icon = item.icon
              const showCategory =
                index === 0 || item.category !== SHORTCUTS[index - 1].category

              return (
                <div key={item.description} className="recruiter-shortcut-item-wrapper">
                  {showCategory && (
                    <h3 className="recruiter-shortcut-category-title">{item.category}</h3>
                  )}
                  <div className="recruiter-shortcut-row">
                    <div className="recruiter-shortcut-row__info">
                      <span className="recruiter-shortcut-row__icon">
                        <Icon size={16} />
                      </span>
                      <span className="recruiter-shortcut-row__description">
                        {item.description}
                      </span>
                    </div>
                    <div className="recruiter-shortcut-row__keys">
                      {item.keys.map((key, keyIndex) => (
                        <span key={key} className="recruiter-shortcut-key-group">
                          {keyIndex > 0 && <span className="recruiter-shortcut-key-or">hoặc</span>}
                          <kbd className="recruiter-shortcut-kbd">{key}</kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <aside className="recruiter-shortcuts-modal-tip">
            <span className="recruiter-shortcuts-modal-tip__badge">
              <Check size={14} /> Mẹo thao tác
            </span>
            <p>
              Khi bạn đang nhập nội dung trong ô góp ý hoặc ô tìm kiếm, các phím tắt sẽ tự động tạm dừng để bạn gõ văn bản bình thường.
            </p>
          </aside>
        </div>

        <footer className="recruiter-shortcuts-modal-footer">
          <button
            className="recruiter-shortcuts-modal-action"
            onClick={onClose}
            type="button"
          >
            Đã hiểu
          </button>
        </footer>
      </div>
    </div>
  )
}
