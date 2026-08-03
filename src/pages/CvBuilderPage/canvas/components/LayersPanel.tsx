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
    <div className="p-4">
      <h2 className="mb-3 text-sm font-bold text-[#111827]">Lớp (Layers)</h2>
      {ordered.length === 0 && (
        <p className="text-sm text-[#6b7280]">Trang chưa có phần tử nào.</p>
      )}
      <ul className="flex flex-col gap-1">
        {ordered.map((el) => {
          const active = selectedIds.includes(el.id);
          return (
            <li key={el.id}>
              <div
                className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm ${
                  active
                    ? 'border-[#f23b94] bg-[#fef3f8]'
                    : 'border-transparent hover:bg-[#f7f6fb]'
                }`}
              >
                <button
                  type="button"
                  className="flex-1 truncate text-left text-[#111827]"
                  onClick={() => select([el.id])}
                  title={label(el)}
                >
                  {label(el)}
                </button>
                <button
                  type="button"
                  title={el.hidden ? 'Hiện' : 'Ẩn'}
                  onClick={() => toggleHidden([el.id])}
                  className="text-[#6b7280] hover:text-[#111827]"
                >
                  {el.hidden ? '🙈' : '👁'}
                </button>
                <button
                  type="button"
                  title={el.locked ? 'Mở khóa' : 'Khóa'}
                  onClick={() => toggleLock([el.id])}
                  className="text-[#6b7280] hover:text-[#111827]"
                >
                  {el.locked ? '🔒' : '🔓'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
