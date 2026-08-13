import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BringToFront,
  Check,
  Copy,
  Crop,
  Eye,
  EyeOff,
  Group,
  Italic,
  Layers,
  Layers2,
  Lock,
  LockOpen,
  SendToBack,
  Trash2,
  Underline,
  Ungroup,
} from "lucide-react";
import { useCanvasStore } from "../store/useCanvasStore";
import { ColorField } from "./ColorField";
import "./PropertiesPanel.css";
import type {
  CanvasElement,
  IconElement,
  ImageElement,
  ShapeElement,
  TextAlign,
  TextElement,
} from "../canvas.types";

const FONT_FAMILIES = [
  "Roboto, sans-serif",
  "Arial, sans-serif",
  "Georgia, serif",
  '"Times New Roman", serif',
  '"Courier New", monospace',
  "Montserrat, sans-serif",
];

const Field = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <label className="mb-2 block">
    <span className="mb-1 block text-[11px] font-medium text-[#6b7280]">
      {label}
    </span>
    {children}
  </label>
);

// 2 cột — dùng cho các field ngắn để bảng bên phải bớt dài.
const Row = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-2 gap-2">{children}</div>
);

const Section = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) => (
  <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#f1f1f5] pt-3">
    <span className="flex min-w-0 items-center gap-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9ca3af]">
        {label}
      </span>
      {hint && (
        <span
          title={`Độ sâu (z-index): ${hint}`}
          className="shrink-0 rounded bg-[#f1f1f5] px-1 text-[10px] font-semibold tabular-nums leading-4 text-[#6b7280]"
        >
          {hint}
        </span>
      )}
    </span>
    <div className="flex gap-1">{children}</div>
  </div>
);

const iconBtnCls =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#e5e7eb] bg-white text-[#6b7280] transition-colors hover:border-[#f23b94] hover:bg-[#fef3f8] hover:text-[#f23b94]";

const IconBtn = ({
  label,
  onClick,
  danger,
  active,
  // Trạng thái "đang bật" cần nổi bật hơn (khóa/ẩn) — dùng nền hổ phách.
  warn,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
  warn?: boolean;
  children: ReactNode;
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active || warn ? true : undefined}
    onClick={onClick}
    className={
      danger
        ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#fecaca] bg-white text-[#dc2626] transition-colors hover:bg-[#fef2f2]"
        : warn
          ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#fcd34d] bg-[#fffbeb] text-[#b45309]"
          : active
            ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#f23b94] bg-[#fef3f8] text-[#f23b94]"
            : iconBtnCls
    }
  >
    {children}
  </button>
);

const inputCls =
  "w-full rounded-md border border-[#e5e7eb] bg-white px-2 py-1 text-[13px] text-[#111827] focus:border-[#f23b94] focus:outline-none";

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
}) => {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const clamp = (next: number) => {
    let normalized = next;
    if (typeof min === "number") {
      normalized = Math.max(min, normalized);
    }
    if (typeof max === "number") {
      normalized = Math.min(max, normalized);
    }
    return normalized;
  };

  const commit = (raw: string) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const next = clamp(parsed);
    setDraft(String(next));
    onChange(next);
  };

  return (
    <input
      type="number"
      className={inputCls}
      value={draft}
      min={min}
      max={max}
      step={step}
      inputMode="decimal"
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);

        if (
          raw === "" ||
          raw === "-" ||
          raw === "." ||
          raw === "-." ||
          raw.endsWith(".")
        ) {
          return;
        }

        const parsed = Number(raw);
        if (Number.isFinite(parsed)) {
          onChange(clamp(parsed));
        }
      }}
      onBlur={(e) => {
        if (e.target.value.trim() === "") {
          setDraft(String(value));
          return;
        }
        commit(e.target.value);
      }}
    />
  );
};

const ColorInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => <ColorField value={value} onChange={onChange} />;

const RangeInput = ({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
}) => {
  const progress = max === min ? 0 : ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="canvas-property-range"
      style={{ "--range-progress": `${Math.min(100, Math.max(0, progress))}%` } as CSSProperties}
    />
  );
};

const ImagePositionFields = ({
  x,
  y,
  onChange,
}: {
  x?: number;
  y?: number;
  onChange: (patch: { x?: number; y?: number }) => void;
}) => (
  <Row>
    <Field label={`Ngang (${Math.round(x ?? 50)}%)`}>
      <RangeInput
        value={x ?? 50}
        min={0}
        max={100}
        step={1}
        onChange={(value) => onChange({ x: value })}
      />
    </Field>
    <Field label={`Dọc (${Math.round(y ?? 50)}%)`}>
      <RangeInput
        value={y ?? 50}
        min={0}
        max={100}
        step={1}
        onChange={(value) => onChange({ y: value })}
      />
    </Field>
  </Row>
);

const TextProps = ({ el }: { el: TextElement }) => {
  const update = useCanvasStore((s) => s.updateElement);
  const set = (patch: Partial<TextElement>) => update(el.id, patch);

  const alignIcon = { left: AlignLeft, center: AlignCenter, right: AlignRight };

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
              {f.split(",")[0].replace(/"/g, "")}
            </option>
          ))}
        </select>
      </Field>

      <Row>
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
      </Row>

      <Field label="Màu chữ">
        <ColorInput value={el.color} onChange={(v) => set({ color: v })} />
      </Field>

      <Field label="Kiểu & canh lề">
        <div className="flex gap-1">
          <IconBtn
            label="Nghiêng"
            active={el.italic}
            onClick={() => set({ italic: !el.italic })}
          >
            <Italic size={14} />
          </IconBtn>
          <IconBtn
            label="Gạch chân"
            active={el.underline}
            onClick={() => set({ underline: !el.underline })}
          >
            <Underline size={14} />
          </IconBtn>
          <span className="mx-1 w-px bg-[#e5e7eb]" />
          {(["left", "center", "right"] as TextAlign[]).map((a) => {
            const Icon = alignIcon[a];
            return (
              <IconBtn
                key={a}
                label={
                  a === "left" ? "Canh trái" : a === "center" ? "Canh giữa" : "Canh phải"
                }
                active={el.align === a}
                onClick={() => set({ align: a })}
              >
                <Icon size={14} />
              </IconBtn>
            );
          })}
        </div>
      </Field>

      <Row>
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
      </Row>
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
    e.target.value = "";
  };

  return (
    <>
      <Row>
        <Field label="Hiển thị">
          <select
            className={inputCls}
            value={el.objectFit}
            onChange={(e) =>
              set({ objectFit: e.target.value as "cover" | "contain" | "fill" })
            }
          >
            <option value="cover">Lấp đầy</option>
            <option value="contain">Vừa khung</option>
            <option value="fill">Kéo giãn</option>
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
      </Row>
      <ImagePositionFields
        x={el.objectPositionX}
        y={el.objectPositionY}
        onChange={(patch) =>
          set({
            ...(patch.x === undefined ? {} : { objectPositionX: patch.x }),
            ...(patch.y === undefined ? {} : { objectPositionY: patch.y }),
          })
        }
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="mb-2 w-full rounded-md border border-[#e5e7eb] bg-white px-2 py-1.5 text-xs hover:border-[#f23b94]"
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
  const croppingId = useCanvasStore((s) => s.croppingId);
  const setCroppingId = useCanvasStore((s) => s.setCroppingId);
  const set = (patch: Partial<ShapeElement>) => update(el.id, patch);
  const fileRef = useRef<HTMLInputElement>(null);
  const cropping = croppingId === el.id;

  const replaceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      set({
        imageSrc: reader.result as string,
        imageFit: el.imageFit ?? "cover",
        imagePositionX: el.imagePositionX ?? 50,
        imagePositionY: el.imagePositionY ?? 50,
      });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <>
      {el.shape !== "line" && (
        <>
          <Field label="Ảnh trong hình khối">
            <Row>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-md border border-[#e5e7eb] bg-white px-2 py-1 text-xs hover:border-[#f23b94]"
              >
                {el.imageSrc ? "Đổi ảnh" : "Tải ảnh"}
              </button>
              <button
                type="button"
                disabled={!el.imageSrc}
                onClick={() => {
                  if (cropping) setCroppingId(null);
                  set({ imageSrc: undefined });
                }}
                className="rounded-md border border-[#fecaca] bg-white px-2 py-1 text-xs text-[#dc2626] hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Xóa ảnh
              </button>
            </Row>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={replaceImage}
            />
          </Field>
          {el.imageSrc && (
            <>
              <Row>
                <Field label="Hiển thị ảnh">
                  <select
                    className={inputCls}
                    value={el.imageFit ?? "cover"}
                    onChange={(e) =>
                      set({ imageFit: e.target.value as "cover" | "contain" | "fill" })
                    }
                  >
                    <option value="cover">Lấp đầy</option>
                    <option value="contain">Vừa khung</option>
                    <option value="fill">Kéo giãn</option>
                  </select>
                </Field>
                <Field label="Vị trí ảnh">
                  <button
                    type="button"
                    onClick={() => setCroppingId(cropping ? null : el.id)}
                    className={`flex w-full items-center justify-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors ${
                      cropping
                        ? "border-[#f23b94] bg-[#f23b94] text-white"
                        : "border-[#e5e7eb] bg-white text-[#111827] hover:border-[#f23b94]"
                    }`}
                  >
                    {cropping ? <Check size={13} /> : <Crop size={13} />}
                    {cropping ? "Xong" : "Chỉnh ảnh"}
                  </button>
                </Field>
              </Row>
              {cropping && (
                <p className="mb-2 rounded-md bg-[#fef3f8] px-2 py-1.5 text-[11px] leading-snug text-[#9d174d]">
                  Đang chỉnh ảnh: kéo để dịch ảnh bên trong khung. Bấm “Xong”
                  hoặc phím Esc để quay lại chế độ di chuyển khối.
                </p>
              )}
            </>
          )}
        </>
      )}
      {el.shape !== "line" && (
        <Field label="Màu nền">
          <ColorInput value={el.fill} onChange={(v) => set({ fill: v })} />
        </Field>
      )}
      <Field label="Màu viền">
        <ColorInput value={el.stroke} onChange={(v) => set({ stroke: v })} />
      </Field>
      <Row>
        <Field label="Độ dày viền">
          <NumberInput
            value={el.strokeWidth}
            min={0}
            max={40}
            onChange={(v) => set({ strokeWidth: v })}
          />
        </Field>
        {el.shape === "rect" && (
          <Field label="Bo góc (px)">
            <NumberInput
              value={el.borderRadius}
              min={0}
              max={200}
              onChange={(v) => set({ borderRadius: v })}
            />
          </Field>
        )}
      </Row>
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
    <Row>
      <Field label={`Độ mờ (${Math.round(el.opacity * 100)}%)`}>
        <RangeInput
          value={el.opacity}
          min={0}
          max={1}
          step={0.05}
          onChange={(value) => update(el.id, { opacity: value })}
        />
      </Field>
      <Field label="Xoay (độ)">
        <NumberInput
          value={Math.round(el.rotation)}
          onChange={(v) => update(el.id, { rotation: v })}
        />
      </Field>
    </Row>
  );
};

export const PropertiesPanel = () => {
  const doc = useCanvasStore((s) => s.document);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const selected = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return doc.pages
      .flatMap((page) => page.elements)
      .filter((element) => selectedSet.has(element.id));
  }, [doc, selectedIds]);
  const removeElements = useCanvasStore((s) => s.removeElements);
  const duplicateElements = useCanvasStore((s) => s.duplicateElements);
  const bringToFront = useCanvasStore((s) => s.bringToFront);
  const sendToBack = useCanvasStore((s) => s.sendToBack);
  const bringForward = useCanvasStore((s) => s.bringForward);
  const sendBackward = useCanvasStore((s) => s.sendBackward);
  const toggleLock = useCanvasStore((s) => s.toggleLock);
  const toggleHidden = useCanvasStore((s) => s.toggleHidden);
  const groupSelected = useCanvasStore((s) => s.groupSelected);
  const ungroupSelected = useCanvasStore((s) => s.ungroupSelected);

  if (selected.length === 0) {
    return (
      <div className="p-3 text-[13px] leading-snug text-[#6b7280]">
        Chọn một phần tử để chỉnh sửa thuộc tính, hoặc chèn phần tử mới từ bảng
        bên trái.
      </div>
    );
  }

  const single = selected.length === 1 ? selected[0] : null;
  // Độ sâu = z-index. Nhiều lựa chọn thì hiện khoảng thấp nhất → cao nhất.
  const depths = selected.map((el) => el.zIndex);
  const minDepth = Math.min(...depths);
  const maxDepth = Math.max(...depths);
  const depthHint =
    minDepth === maxDepth ? `${minDepth}` : `${minDepth}–${maxDepth}`;

  return (
    <div className="p-3">
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#111827]">
        {single ? typeLabel(single) : `${selected.length} phần tử`}
      </h2>

      {single?.type === "text" && <TextProps el={single} />}
      {single?.type === "image" && <ImageProps el={single} />}
      {single?.type === "shape" && <ShapeProps el={single} />}
      {single?.type === "icon" && <IconProps el={single} />}
      {single && <CommonProps el={single} />}

      <Section label="Lớp" hint={depthHint}>
        <IconBtn label="Lên trên" onClick={() => bringForward(selectedIds)}>
          <Layers2 size={14} />
        </IconBtn>
        <IconBtn label="Xuống dưới" onClick={() => sendBackward(selectedIds)}>
          <Layers size={14} />
        </IconBtn>
        <IconBtn label="Trên cùng" onClick={() => bringToFront(selectedIds)}>
          <BringToFront size={14} />
        </IconBtn>
        <IconBtn label="Dưới cùng" onClick={() => sendToBack(selectedIds)}>
          <SendToBack size={14} />
        </IconBtn>
      </Section>

      <Section label="Hành động">
        <IconBtn
          label="Nhân bản"
          onClick={() => duplicateElements(selectedIds)}
        >
          <Copy size={14} />
        </IconBtn>
        <IconBtn
          label={single?.locked ? "Mở khóa" : "Khóa"}
          warn={Boolean(single?.locked)}
          onClick={() => toggleLock(selectedIds)}
        >
          {single?.locked ? <Lock size={14} /> : <LockOpen size={14} />}
        </IconBtn>
        <IconBtn
          label={single?.hidden ? "Hiện phần tử" : "Ẩn phần tử"}
          warn={Boolean(single?.hidden)}
          onClick={() => toggleHidden(selectedIds)}
        >
          {single?.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
        </IconBtn>
        {selected.length >= 2 && (
          <IconBtn label="Nhóm" onClick={() => groupSelected()}>
            <Group size={14} />
          </IconBtn>
        )}
        {selected.some((e) => e.groupId) && (
          <IconBtn label="Bỏ nhóm" onClick={() => ungroupSelected()}>
            <Ungroup size={14} />
          </IconBtn>
        )}
        <IconBtn label="Xóa" danger onClick={() => removeElements(selectedIds)}>
          <Trash2 size={14} />
        </IconBtn>
      </Section>
    </div>
  );
};

const typeLabel = (el: CanvasElement) =>
  el.type === "text"
    ? "Văn bản"
    : el.type === "image"
      ? "Hình ảnh"
      : el.type === "shape"
        ? "Hình khối"
        : "Biểu tượng";
