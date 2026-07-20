import { useCvBuilderStore, type BuilderTab } from '../store/useCvBuilderStore';

const TABS: { key: BuilderTab; label: string }[] = [
  { key: 'content', label: 'Nội dung' },
  { key: 'design', label: 'Thiết kế & Font' },
  { key: 'layout', label: 'Bố cục' },
  { key: 'sections', label: 'Thêm mục' },
  { key: 'templates', label: 'Đổi mẫu CV' },
  { key: 'ai', label: 'Gợi ý viết CV' },
  { key: 'library', label: 'Thư viện CV' },
];

export const BuilderTabs = () => {
  const activeTab = useCvBuilderStore((state) => state.activeTab);
  const setActiveTab = useCvBuilderStore((state) => state.setActiveTab);

  return (
    <div className="flex shrink-0 flex-col gap-1 border-r border-[#d9d9e3] bg-[#ffffff] p-2 lg:w-[120px]">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`rounded-md px-2 py-3 text-center text-xs font-medium transition-colors ${
            activeTab === tab.key
              ? 'bg-[#f7f6fb] text-[#f23b94]'
              : 'text-[#6b7280] hover:bg-[#f7f6fb] hover:text-[#111827]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};