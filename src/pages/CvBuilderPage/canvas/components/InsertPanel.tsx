import { useRef } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';
import { ICON_NAMES, getIcon } from '../icons';
import {
  createIconElement,
  createImageElement,
  createShapeElement,
  createTextElement,
  type ShapeKind,
  type TextPreset,
} from '../canvas.types';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
    {children}
  </p>
);

export const InsertPanel = () => {
  const addElement = useCanvasStore((s) => s.addElement);
  const activePageId = useCanvasStore((s) => s.activePageId);
  const getMaxZIndex = useCanvasStore((s) => s.getMaxZIndex);
  const fileRef = useRef<HTMLInputElement>(null);

  const nextZ = () => getMaxZIndex(activePageId) + 1;

  const addText = (preset: TextPreset) =>
    addElement(activePageId, createTextElement(nextZ(), preset));

  const addShape = (shape: ShapeKind) =>
    addElement(activePageId, createShapeElement(nextZ(), shape));

  const addIcon = (name: string) =>
    addElement(activePageId, createIconElement(nextZ(), name));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const maxSide = 260;
        const ratio = img.width / img.height || 1;
        let w = maxSide;
        let h = maxSide;
        if (ratio >= 1) h = Math.round(maxSide / ratio);
        else w = Math.round(maxSide * ratio);
        addElement(activePageId, createImageElement(nextZ(), src, w, h));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const btn =
    'flex w-full items-center gap-2 rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-left text-sm text-[#111827] transition-colors hover:border-[#f23b94] hover:bg-[#fef3f8]';

  return (
    <div>
      <h2 className="text-sm font-bold text-[#111827]">Chèn nội dung</h2>

      <SectionTitle>Văn bản</SectionTitle>
      <div className="flex flex-col gap-2">
        <button type="button" className={btn} onClick={() => addText('heading')}>
          <span className="text-2xl font-bold">T</span>
          <span>Thêm tiêu đề</span>
        </button>
        <button
          type="button"
          className={btn}
          onClick={() => addText('subheading')}
        >
          <span className="text-lg font-semibold">T</span>
          <span>Thêm tiêu đề phụ</span>
        </button>
        <button type="button" className={btn} onClick={() => addText('body')}>
          <span className="text-sm">T</span>
          <span>Thêm đoạn văn bản</span>
        </button>
      </div>

      <SectionTitle>Hình ảnh</SectionTitle>
      <button
        type="button"
        className={btn}
        onClick={() => fileRef.current?.click()}
      >
        <span>🖼️</span>
        <span>Tải ảnh lên</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />

      <SectionTitle>Hình khối</SectionTitle>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => addShape('rect')}
          title="Chữ nhật"
          className="flex h-14 items-center justify-center rounded-md border border-[#e5e7eb] bg-white hover:border-[#f23b94]"
        >
          <div className="h-7 w-9 rounded bg-[#f25555]" />
        </button>
        <button
          type="button"
          onClick={() => addShape('ellipse')}
          title="Hình tròn"
          className="flex h-14 items-center justify-center rounded-md border border-[#e5e7eb] bg-white hover:border-[#f23b94]"
        >
          <div className="h-8 w-8 rounded-full bg-[#f25555]" />
        </button>
        <button
          type="button"
          onClick={() => addShape('line')}
          title="Đường kẻ"
          className="flex h-14 items-center justify-center rounded-md border border-[#e5e7eb] bg-white hover:border-[#f23b94]"
        >
          <div className="h-[3px] w-9 rounded bg-[#111827]" />
        </button>
      </div>

      <SectionTitle>Biểu tượng</SectionTitle>
      <div className="grid grid-cols-5 gap-2">
        {ICON_NAMES.map((name) => {
          const Icon = getIcon(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => addIcon(name)}
              title={name}
              className="flex h-10 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#111827] hover:border-[#f23b94] hover:bg-[#fef3f8]"
            >
              <Icon size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
