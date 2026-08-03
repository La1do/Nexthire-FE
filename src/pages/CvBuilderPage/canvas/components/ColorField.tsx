interface Props {
  value: string;
  onChange: (v: string) => void;
  // giữ để tương thích chỗ gọi; native input không có khái niệm transparent riêng
  allowTransparent?: boolean;
}

// Ô chọn màu dùng input native (<input type="color">) + ô hex, bố cục full-width
// với ô màu nằm bên trái. Nhờ nằm bên trái của field (không sát mép phải màn hình),
// popup chọn màu của trình duyệt mở ra không bị tràn/khuất.
export const ColorField = ({ value, onChange }: Props) => {
  const isTransparent = value === 'transparent';
  return (
    <div className="flex w-full items-center gap-2">
      <input
        type="color"
        value={isTransparent ? '#ffffff' : value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-9 shrink-0 cursor-pointer rounded border border-[#e5e7eb] bg-white"
        title="Chọn màu"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-[#e5e7eb] px-2 py-1.5 text-sm text-[#111827] focus:border-[#f23b94] focus:outline-none"
        placeholder="#000000"
      />
    </div>
  );
};
