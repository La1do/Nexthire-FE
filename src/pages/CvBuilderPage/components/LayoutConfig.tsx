import { useCvBuilderStore } from '../store/useCvBuilderStore';

export const LayoutConfig = () => {
  const settings = useCvBuilderStore((state) => state.settings);
  const updateSetting = useCvBuilderStore((state) => state.updateSetting);

  return (
    <div className="rounded-[8px] border border-[#d9d9e3] bg-[#ffffff] p-5 shadow-sm">
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-[#374151]">Kiểu bố cục</label>
        <div className="grid grid-cols-2 gap-3">
          {(['one-column', 'two-column'] as const).map((layout) => (
            <button
              key={layout}
              onClick={() => updateSetting('layout', layout)}
              className={`rounded-md border p-3 text-sm transition-colors ${
                settings.layout === layout
                  ? 'border-[#f23b94] text-[#f23b94]'
                  : 'border-[#d9d9e3] text-[#374151] hover:border-[#111827]'
              }`}
            >
              {layout === 'one-column' ? '1 cột' : '2 cột'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#374151]">Vị trí ảnh đại diện</label>
        <div className="grid grid-cols-2 gap-3">
          {(['left', 'right'] as const).map((pos) => (
            <button
              key={pos}
              onClick={() => updateSetting('photoPosition', pos)}
              className={`rounded-md border p-3 text-sm transition-colors ${
                settings.photoPosition === pos
                  ? 'border-[#f23b94] text-[#f23b94]'
                  : 'border-[#d9d9e3] text-[#374151] hover:border-[#111827]'
              }`}
            >
              {pos === 'left' ? 'Bên trái' : 'Bên phải'}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-[#6b7280]">
        * Template cần đọc `settings.layout` / `settings.photoPosition` để áp dụng đúng — hiện tại
        `StandardTemplate`/`ProfessionalTemplate`/`ModernTemplate` chưa xử lý field này.
      </p>
    </div>
  );
};