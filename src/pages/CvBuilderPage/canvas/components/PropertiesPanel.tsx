import { useRef } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';
import { ColorField } from './ColorField';
import type {
  CanvasElement,
  IconElement,
  ImageElement,
  ShapeElement,
  TextAlign,
  TextElement,
} from '../canvas.types';

const FONT_FAMILIES = [
  'Roboto, sans-serif',
  'Arial, sans-serif',
  'Georgia, serif',
  '"Times New Roman", serif',
  '"Courier New", monospace',
  'Montserrat, sans-serif',
];

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className="mb-3 block">
    <span className="mb-1 block text-xs font-medium text-[#6b7280]">
      {label}
    </span>
    {children}
  </label>
);

const inputCls =
  'w-full rounded-md border border-[#e5e7eb] bg-white px-2 py-1.5 text-sm text-[#111827] focus:border-[#f23b94] focus:outline-none';

const NumberInput = ({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) => (
  <input
    type="number"
    className={inputCls}
    value={value}
    min={min}
    max={max}
    step={step}
    onChange={(e) => onChange(Number(e.target.value))}
  />
);

const ColorInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => <ColorField value={value} onChange={onChange} />;

const TextProps = ({ el }: { el: TextElement }) => {
  const update = useCanvasStore((s) => s.updateElement);
  const set = (patch: Partial<TextElement>) => update(el.id, patch);

  const toggleBtn = (active: boolean) =>
    `flex-1 rounded-md border px-2 py-1.5 text-sm ${
      active
        ? 'border-[#f23b94] bg-[#fef3f8] text-[#f23b94]'
        : 'border-[#e5e7eb] bg-white text-[#111827]'
    }`;

  return (
    <>
      <Field label="Phông chữ">
        <select
          className={inputCls}
          value={el.fontFamily}
          onChange={(e) => set({ fontFamily: e.target.value })}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {f.split(',')[0].replace(/"/g, '')}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Cỡ chữ">
          <NumberInput
            value={el.fontSize}
            min={6}
            max={200}
            onChange={(v) => set({ fontSize: v })}
          />
        </Field>
        <Field label="Độ đậm">
          <select
            className={inputCls}
            value={el.fontWeight}
            onChange={(e) => set({ fontWeight: Number(e.target.value) })}
          >
            {[300, 400, 500, 600, 700, 800].map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Màu chữ">
        <ColorInput value={el.color} onChange={(v) => set({ color: v })} />
      </Field>

      <Field label="Kiểu chữ">
        <div className="flex gap-2">
          <button
            type="button"
            className={toggleBtn(el.italic)}
            onClick={() => set({ italic: !el.italic })}
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={toggleBtn(el.underline)}
            onClick={() => set({ underline: !el.underline })}
          >
            <u>U</u>
          </button>
        </div>
      </Field>

      <Field label="Canh lề">
        <div className="flex gap-2">
          {(['left', 'center', 'right'] as TextAlign[]).map((a) => (
            <button
              key={a}
              type="button"
              className={toggleBtn(el.align === a)}
              onClick={() => set({ align: a })}
            >
              {a === 'left' ? '⬅' : a === 'center' ? '↔' : '➡'}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Giãn dòng">
          <NumberInput
            value={el.lineHeight}
            min={0.8}
            max={4}
            step={0.1}
            onChange={(v) => set({ lineHeight: v })}
          />
        </Field>
        <Field label="Giãn chữ">
          <NumberInput
            value={el.letterSpacing}
            min={-5}
            max={20}
            step={0.5}
            onChange={(v) => set({ letterSpacing: v })}
          />
        </Field>
      </div>
    </>
  );
};

const ImageProps = ({ el }: { el: ImageElement }) => {
  const update = useCanvasStore((s) => s.updateElement);
  const set = (patch: Partial<ImageElement>) => update(el.id, patch);
  const fileRef = useRef<HTMLInputElement>(null);

  const replace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set({ src: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <>
      <Field label="Cách hiển thị">
        <select
          className={inputCls}
          value={el.objectFit}
          onChange={(e) =>
            set({ objectFit: e.target.value as 'cover' | 'contain' })
          }
        >
          <option value="cover">Lấp đầy (cover)</option>
          <option value="contain">Vừa khung (contain)</option>
        </select>
      </Field>
      <Field label="Bo góc (px)">
        <NumberInput
          value={el.borderRadius}
          min={0}
          max={999}
          onChange={(v) => set({ borderRadius: v })}
        />
      </Field>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="mb-3 w-full rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-sm hover:border-[#f23b94]"
      >
        Thay ảnh khác
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={replace}
      />
    </>
  );
};

const ShapeProps = ({ el }: { el: ShapeElement }) => {
  const update = useCanvasStore((s) => s.updateElement);
  const set = (patch: Partial<ShapeElement>) => update(el.id, patch);

  return (
    <>
      {el.shape !== 'line' && (
        <Field label="Màu nền">
          <ColorInput value={el.fill} onChange={(v) => set({ fill: v })} />
        </Field>
      )}
      <Field label="Màu viền">
        <ColorInput value={el.stroke} onChange={(v) => set({ stroke: v })} />
      </Field>
      <Field label="Độ dày viền (px)">
        <NumberInput
          value={el.strokeWidth}
          min={0}
          max={40}
          onChange={(v) => set({ strokeWidth: v })}
        />
      </Field>
      {el.shape === 'rect' && (
        <Field label="Bo góc (px)">
          <NumberInput
            value={el.borderRadius}
            min={0}
            max={200}
            onChange={(v) => set({ borderRadius: v })}
          />
        </Field>
      )}
    </>
  );
};

const IconProps = ({ el }: { el: IconElement }) => {
  const update = useCanvasStore((s) => s.updateElement);
  return (
    <Field label="Màu biểu tượng">
      <ColorInput
        value={el.color}
        onChange={(v) => update(el.id, { color: v })}
      />
    </Field>
  );
};

const CommonProps = ({ el }: { el: CanvasElement }) => {
  const update = useCanvasStore((s) => s.updateElement);
  return (
    <>
      <Field label={`Độ mờ (${Math.round(el.opacity * 100)}%)`}>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={el.opacity}
          onChange={(e) => update(el.id, { opacity: Number(e.target.value) })}
          className="w-full accent-[#f23b94]"
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Xoay (độ)">
          <NumberInput
            value={Math.round(el.rotation)}
            onChange={(v) => update(el.id, { rotation: v })}
          />
        </Field>
      </div>
    </>
  );
};

export const PropertiesPanel = () => {
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const getSelectedElements = useCanvasStore((s) => s.getSelectedElements);
  const removeElements = useCanvasStore((s) => s.removeElements);
  const duplicateElements = useCanvasStore((s) => s.duplicateElements);
  const bringToFront = useCanvasStore((s) => s.bringToFront);
  const sendToBack = useCanvasStore((s) => s.sendToBack);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);
  const toggleLock = useCanvasStore((s) => s.toggleLock);
  const groupSelected = useCanvasStore((s) => s.groupSelected);
  const ungroupSelected = useCanvasStore((s) => s.ungroupSelected);

  const selected = getSelectedElements();

  if (selected.length === 0) {
    return (
      <div className="p-4 text-sm text-[#6b7280]">
        Chọn một phần tử để chỉnh sửa thuộc tính, hoặc chèn phần tử mới từ
        bảng bên trái.
      </div>
    );
  }

  const single = selected.length === 1 ? selected[0] : null;
  const zBtn =
    'rounded-md border border-[#e5e7eb] bg-white px-2 py-1.5 text-xs hover:border-[#f23b94]';

  return (
    <div className="p-4">
      <h2 className="mb-3 text-sm font-bold text-[#111827]">
        {single ? typeLabel(single) : `${selected.length} phần tử`}
      </h2>

      {single?.type === 'text' && <TextProps el={single} />}
      {single?.type === 'image' && <ImageProps el={single} />}
      {single?.type === 'shape' && <ShapeProps el={single} />}
      {single?.type === 'icon' && <IconProps el={single} />}
      {single && <CommonProps el={single} />}

      <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
        Sắp xếp lớp
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className={zBtn}
          onClick={() => bringForward(selectedIds)}
        >
          ↑ Lên trên
        </button>
        <button
          type="button"
          className={zBtn}
          onClick={() => sendBackward(selectedIds)}
        >
          ↓ Xuống dưới
        </button>
        <button
          type="button"
          className={zBtn}
          onClick={() => bringToFront(selectedIds)}
        >
          ⤒ Trên cùng
        </button>
        <button
          type="button"
          className={zBtn}
          onClick={() => sendToBack(selectedIds)}
        >
          ⤓ Dưới cùng
        </button>
      </div>

      <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
        Hành động
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className={zBtn}
          onClick={() => duplicateElements(selectedIds)}
        >
          ⧉ Nhân bản
        </button>
        <button
          type="button"
          className={zBtn}
          onClick={() => toggleLock(selectedIds)}
        >
          {single?.locked ? '🔓 Mở khóa' : '🔒 Khóa'}
        </button>
        {selected.length >= 2 && (
          <button
            type="button"
            className={zBtn}
            onClick={() => groupSelected()}
          >
            ⛶ Nhóm
          </button>
        )}
        {selected.some((e) => e.groupId) && (
          <button
            type="button"
            className={zBtn}
            onClick={() => ungroupSelected()}
          >
            ⛶ Bỏ nhóm
          </button>
        )}
        <button
          type="button"
          className="col-span-2 rounded-md border border-[#fecaca] bg-white px-2 py-1.5 text-xs text-[#dc2626] hover:bg-[#fef2f2]"
          onClick={() => removeElements(selectedIds)}
        >
          🗑 Xóa
        </button>
      </div>
    </div>
  );
};

const typeLabel = (el: CanvasElement) =>
  el.type === 'text'
    ? 'Văn bản'
    : el.type === 'image'
      ? 'Hình ảnh'
      : el.type === 'shape'
        ? 'Hình khối'
        : 'Biểu tượng';
