import {
  useCvBuilderStore,
  type BuilderTab,
} from '../store/useCvBuilderStore';

interface BuilderTabsProps {
  onClose: () => void;
}

interface TabItem {
  key: BuilderTab;
  label: string;
  title: string;
  icon: string;
}

const TABS: TabItem[] = [
  {
    key: 'design',
    label: 'Thiết kế',
    title: 'Thiết kế và phông chữ',
    icon: '◉',
  },
  {
    key: 'layout',
    label: 'Bố cục',
    title: 'Bố cục CV',
    icon: '▦',
  },
  {
    key: 'sections',
    label: 'Mục',
    title: 'Quản lý các mục',
    icon: '☷',
  },
  {
    key: 'templates',
    label: 'Mẫu',
    title: 'Đổi mẫu CV',
    icon: '▤',
  },
  {
    key: 'ai',
    label: 'AI',
    title: 'Gợi ý viết CV',
    icon: '✦',
  },
  {
    key: 'library',
    label: 'Thư viện',
    title: 'Thư viện CV',
    icon: '▣',
  },
];

export const BuilderTabs = ({
  onClose,
}: BuilderTabsProps) => {
  const activeTab =
    useCvBuilderStore(
      (state) => state.activeTab,
    );

  const setActiveTab =
    useCvBuilderStore(
      (state) => state.setActiveTab,
    );

  return (
    <nav
      className="
        flex
        h-full
        w-[72px]
        shrink-0
        flex-col
        border-r
        border-[#d9d9e3]
        bg-white
      "
      aria-label="Công cụ chỉnh sửa CV"
    >
      <div
        className="
          flex
          h-11
          shrink-0
          items-center
          justify-center
          border-b
          border-[#eeeeF2]
        "
      >
        <button
          type="button"
          onClick={onClose}
          title="Ẩn thanh công cụ"
          aria-label="Ẩn thanh công cụ"
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            text-lg
            text-[#6b7280]
            transition-colors
            hover:bg-[#f7f6fb]
            hover:text-[#111827]
          "
        >
          ‹
        </button>
      </div>

      <div
        className="
          flex
          min-h-0
          flex-1
          flex-col
          gap-1
          overflow-y-auto
          px-1.5
          py-2
        "
      >
        {TABS.map((tab) => {
          const isActive =
            activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              title={tab.title}
              aria-label={tab.title}
              aria-pressed={isActive}
              onClick={() =>
                setActiveTab(tab.key)
              }
              className={`
                flex
                min-h-[58px]
                w-full
                shrink-0
                flex-col
                items-center
                justify-center
                gap-1
                rounded-lg
                px-1
                py-2
                text-center
                transition-colors
                ${
                  isActive
                    ? `
                      bg-[#fef3f8]
                      text-[#f23b94]
                    `
                    : `
                      text-[#6b7280]
                      hover:bg-[#f7f6fb]
                      hover:text-[#111827]
                    `
                }
              `}
            >
              <span
                className="
                  text-base
                  leading-none
                "
                aria-hidden="true"
              >
                {tab.icon}
              </span>

              <span
                className="
                  max-w-full
                  truncate
                  text-[10px]
                  font-medium
                  leading-tight
                "
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BuilderTabs;