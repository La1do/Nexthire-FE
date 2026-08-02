import { useCvBuilderStore } from '../store/useCvBuilderStore';
import { LANGUAGE_OPTIONS } from '../../../constants/TemplateCVsections';

const FONTS = [
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Be Vietnam Pro', value: '"Be Vietnam Pro", sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
];

const COLORS = ['#f25555', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#111827'];

export const DesignConfig = () => {
  const settings = useCvBuilderStore((state) => state.settings);
  const updateSetting = useCvBuilderStore((state) => state.updateSetting);

  return (
    <div className="rounded-[8px] border border-[#d9d9e3] bg-[#ffffff] p-5 shadow-sm">
      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-[#374151]">Ngôn ngữ CV</label>
        <div className="grid grid-cols-2 gap-2">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang.value}
              onClick={() => updateSetting('language', lang.value)}
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                settings.language === lang.value
                  ? 'border-[#f23b94] text-[#f23b94]'
                  : 'border-[#d9d9e3] text-[#374151] hover:border-[#111827]'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-[#374151]">Phông chữ</label>
        <select
          value={settings.fontFamily}
          onChange={(e) => updateSetting('fontFamily', e.target.value)}
          className="w-full rounded-md border border-[#d9d9e3] px-3 py-2 text-sm focus:border-[#f23b94] focus:outline-none"
        >
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-[#374151]">
          Cỡ chữ ({Math.round(settings.fontScale * 100)}%)
        </label>
        <input
          type="range"
          min={0.85}
          max={1.3}
          step={0.05}
          value={settings.fontScale}
          onChange={(e) => updateSetting('fontScale', Number(e.target.value))}
          className="w-full accent-[#f23b94]"
        />
        <div className="mt-1 flex justify-between text-xs text-[#6b7280]">
          <span>Nhỏ</span>
          <span>Trung bình</span>
          <span>Siêu lớn</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-[#374151]">
          Khoảng cách dòng ({settings.lineHeight.toFixed(1)})
        </label>
        <input
          type="range"
          min={1}
          max={2}
          step={0.1}
          value={settings.lineHeight}
          onChange={(e) => updateSetting('lineHeight', Number(e.target.value))}
          className="w-full accent-[#f23b94]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#374151]">Màu chủ đề</label>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => updateSetting('themeColor', color)}
              className={`h-8 w-8 rounded-full transition-all ${
                settings.themeColor === color ? 'ring-2 ring-[#111827] ring-offset-2' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};