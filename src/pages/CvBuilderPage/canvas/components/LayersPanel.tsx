import {
  Circle,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Minus,
  Image as ImageIcon,
  Square,
  Star,
  Type,
} from 'lucide-react';
import { useCanvasStore } from '../store/useCanvasStore';
import type { CanvasElement } from '../canvas.types';

const label = (el: CanvasElement): string => {
  if (el.type === 'text') return el.text.slice(0, 24) || 'Văn bản';
  if (el.type === 'image') return 'Hình ảnh';
  if (el.type === 'icon') return `Icon: ${el.name}`;
  return el.shape === 'rect'
    ? 'Chữ nhật'
    : el.shape === 'ellipse'
      ? 'Hình tròn'
      : 'Đường kẻ';
};

const TypeIcon = ({ el }: { el: CanvasElement }) => {
  const props = { size: 13, className: 'shrink-0 text-[#9ca3af]' };
  if (el.type === 'text') return <Type {...props} />;
  if (el.type === 'image') return <ImageIcon {...props} />;
  if (el.type === 'icon') return <Star {...props} />;
  if (el.shape === 'ellipse') return <Circle {...props} />;
  if (el.shape === 'line') return <Minus {...props} />;
  return <Square {...props} />;
};

// Nút bật/tắt trạng thái: khi bật dùng nền hổ phách để nhìn ra ngay item nào
// đang bị ẩn hoặc khóa, thay vì emoji khó phân biệt ở cỡ nhỏ.
const toggleCls = (on: boolean) =>
  `flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${
    on
      ? 'border-[#fcd34d] bg-[#fffbeb] text-[#b45309]'
      : 'border-transparent text-[#c3c3cd] hover:border-[#e5e7eb] hover:bg-white hover:text-[#6b7280]'
  }`;

export const LayersPanel = () => {
  const doc = useCanvasStore((s) => s.document);
  const activePageId = useCanvasStore((s) => s.activePageId);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const select = useCanvasStore((s) => s.select);
  const toggleHidden = useCanvasStore((s) => s.toggleHidden);
  const toggleLock = useCanvasStore((s) => s.toggleLock);

  const page = doc.pages.find((p) => p.id === activePageId);
  if (!page) return null;

  // Lớp trên cùng hiển thị đầu danh sách.
  const ordered = [...page.elements].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="p-3">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[#111827]">
          Lớp (Layers)
        </h2>
        <span className="text-[10px] uppercase tracking-wide text-[#9ca3af]">
          Độ sâu
        </span>
      </div>
      {ordered.length === 0 && (
        <p className="text-[13px] text-[#6b7280]">Trang chưa có phần tử nào.</p>
      )}
      <ul className="flex flex-col gap-0.5">
        {ordered.map((el) => {
          const active = selectedIds.includes(el.id);
          return (
            <li key={el.id}>
              <div
                className={`flex items-center gap-1.5 rounded-md border px-1.5 py-1 text-[13px] ${
                  active
                    ? 'border-[#f23b94] bg-[#fef3f8]'
                    : 'border-transparent hover:bg-[#f7f6fb]'
                }`}
              >
                <span
                  title={`Độ sâu (z-index): ${el.zIndex}`}
                  className="w-5 shrink-0 rounded bg-[#f1f1f5] text-center text-[10px] font-semibold tabular-nums leading-4 text-[#6b7280]"
                >
                  {el.zIndex}
                </span>
                <TypeIcon el={el} />
                <button
                  type="button"
                  className={`min-w-0 flex-1 truncate text-left ${
                    el.hidden ? 'text-[#9ca3af] line-through' : 'text-[#111827]'
                  }`}
                  onClick={() => select([el.id])}
                  title={label(el)}
                >
                  {label(el)}
                </button>
                <button
                  type="button"
                  title={el.hidden ? 'Hiện phần tử' : 'Ẩn phần tử'}
                  aria-label={el.hidden ? 'Hiện phần tử' : 'Ẩn phần tử'}
                  aria-pressed={el.hidden}
                  onClick={() => toggleHidden([el.id])}
                  className={toggleCls(el.hidden)}
                >
                  {el.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button
                  type="button"
                  title={el.locked ? 'Mở khóa' : 'Khóa'}
                  aria-label={el.locked ? 'Mở khóa' : 'Khóa'}
                  aria-pressed={el.locked}
                  onClick={() => toggleLock([el.id])}
                  className={toggleCls(el.locked)}
                >
                  {el.locked ? <Lock size={13} /> : <LockOpen size={13} />}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
