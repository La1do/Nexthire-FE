import type { CvSettings } from './../../../types/cv.types';

interface StyleConfiguratorProps {
  settings: CvSettings;
  onChange: (newSettings: CvSettings) => void;
  onSubmit: () => void;
}

const FONTS = [
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Be Vietnam Pro', value: '"Be Vietnam Pro", sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
];

const COLORS = ['#f25555', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#111827'];

export const StyleConfigurator = ({ settings, onChange, onSubmit }: StyleConfiguratorProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#d9d9e3] p-6">
      <h2 className="text-lg font-bold text-[#111827] mb-6">Tùy chỉnh giao diện</h2>

      
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#374151] mb-2">Phông chữ</label>
        <select 
          className="w-full border border-[#d9d9e3] rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#f23b94]"
          value={settings.fontFamily}
          onChange={(e) => onChange({ ...settings, fontFamily: e.target.value })}
        >
          {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#374151] mb-2">Màu chủ đạo</label>
        <div className="flex flex-wrap gap-3">
          {COLORS.map(color => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                settings.themeColor === color ? 'ring-2 ring-offset-2 ring-[#111827]' : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onChange({ ...settings, themeColor: color })}
            />
          ))}
        </div>
      </div>

      
      <div className="mb-8">
        <label className="block text-sm font-medium text-[#374151] mb-2">Cỡ chữ</label>
        <div className="flex bg-[#f7f6fb] rounded-md p-1 border border-[#d9d9e3]">
          {['small', 'medium', 'large'].map((size) => (
            <button
              key={size}
              className={`flex-1 py-1.5 text-sm rounded transition-colors ${
                settings.fontSize === size 
                  ? 'bg-white shadow-sm font-medium text-[#111827]' 
                  : 'text-[#6b7280] hover:text-[#111827]'
              }`}
              onClick={() => onChange({ ...settings, fontSize: size as any })}
            >
              {size === 'small' ? 'Nhỏ' : size === 'medium' ? 'Vừa' : 'Lớn'}
            </button>
          ))}
        </div>
      </div>

      
      <button 
        onClick={onSubmit}
        className="w-full py-3 rounded-md font-medium text-white shadow-md transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(to right, #f23b94, #ff6a21)' }}
      >
        Tạo CV với mẫu này
      </button>
    </div>
  );
};