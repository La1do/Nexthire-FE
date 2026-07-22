import {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
} from 'react-router-dom';

import {
  BuilderHeader,
} from './components/BuilderHeader';

import {
  BuilderTabs,
} from './components/BuilderTabs';

import {
  DesignConfig,
} from './components/DesignConfig';

import {
  LayoutConfig,
} from './components/LayoutConfig';

import {
  SectionManager,
} from './components/SectionManager';

import {
  TemplateSwitcher,
} from './components/TemplateSwitcher';

import {
  AiSuggestions,
} from './components/AiSuggestions';

import {
  CvLibrary,
} from './components/CvLibrary';

import {
  BuilderPreview,
} from './components/BuilderPreview';

import {
  useCvBuilderStore,
  type BuilderTab,
} from './store/useCvBuilderStore';

type AvailablePanelTab = Exclude<
  BuilderTab,
  'content'
>;

const PANEL_BY_TAB: Record<
  AvailablePanelTab,
  React.ComponentType
> = {
  design: DesignConfig,
  layout: LayoutConfig,
  sections: SectionManager,
  templates: TemplateSwitcher,
  ai: AiSuggestions,
  library: CvLibrary,
};

const isAvailablePanelTab = (
  tab: BuilderTab,
): tab is AvailablePanelTab =>
  tab !== 'design';

export function CvBuilderPage() {
  const {
    templateId,
  } = useParams<{
    templateId: string;
  }>();

  const activeTab =
    useCvBuilderStore(
      (state) => state.activeTab,
    );

  const setActiveTab =
    useCvBuilderStore(
      (state) => state.setActiveTab,
    );

  const setTemplateId =
    useCvBuilderStore(
      (state) => state.setTemplateId,
    );

  const [
    isSidebarVisible,
    setIsSidebarVisible,
  ] = useState(true);

  const [
    isPanelVisible,
    setIsPanelVisible,
  ] = useState(true);

  useEffect(() => {
    if (templateId) {
      setTemplateId(templateId);
    }
  }, [
    templateId,
    setTemplateId,
  ]);

  useEffect(() => {
    if (
      !isAvailablePanelTab(
        activeTab,
      )
    ) {
      setActiveTab('design');
    }
  }, [
    activeTab,
    setActiveTab,
  ]);

  const safeActiveTab:
    AvailablePanelTab =
    isAvailablePanelTab(
      activeTab,
    )
      ? activeTab
      : 'design';

  const ActivePanel =
    PANEL_BY_TAB[
      safeActiveTab
    ];

  const handleCloseSidebar =
    () => {
      setIsSidebarVisible(
        false,
      );
    };

  const handleOpenSidebar =
    () => {
      setIsSidebarVisible(
        true,
      );

      setIsPanelVisible(true);
    };

  return (
    <div
      className="
        flex
        h-screen
        min-h-0
        flex-col
        overflow-hidden
        bg-[#f7f6fb]
      "
    >
      <BuilderHeader />

      <div
        className="
          relative
          flex
          min-h-0
          flex-1
          overflow-hidden
        "
      >
        {isSidebarVisible && (
          <div
            className="
              flex
              h-full
              shrink-0
            "
          >
            <BuilderTabs
              onClose={
                handleCloseSidebar
              }
            />

            {isPanelVisible && (
              <aside
                className="
                  relative
                  hidden
                  h-full
                  w-[280px]
                  shrink-0
                  overflow-y-auto
                  border-r
                  border-[#d9d9e3]
                  bg-[#f7f6fb]
                  p-4
                  md:block
                  lg:w-[300px]
                  xl:w-[320px]
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setIsPanelVisible(
                      false,
                    )
                  }
                  title="Thu gọn bảng cài đặt"
                  aria-label="Thu gọn bảng cài đặt"
                  className="
                    sticky
                    top-0
                    z-20
                    ml-auto
                    mb-2
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#d9d9e3]
                    bg-white
                    text-sm
                    text-[#6b7280]
                    shadow-sm
                    transition-colors
                    hover:bg-[#f7f6fb]
                    hover:text-[#111827]
                  "
                >
                  ‹
                </button>

                <ActivePanel />
              </aside>
            )}

            {!isPanelVisible && (
              <div
                className="
                  hidden
                  w-8
                  shrink-0
                  items-start
                  justify-center
                  border-r
                  border-[#d9d9e3]
                  bg-[#f7f6fb]
                  pt-3
                  md:flex
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setIsPanelVisible(
                      true,
                    )
                  }
                  title="Mở bảng cài đặt"
                  aria-label="Mở bảng cài đặt"
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#d9d9e3]
                    bg-white
                    text-sm
                    text-[#6b7280]
                    shadow-sm
                    transition-colors
                    hover:bg-[#f7f6fb]
                    hover:text-[#111827]
                  "
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}

        {!isSidebarVisible && (
          <button
            type="button"
            onClick={
              handleOpenSidebar
            }
            title="Hiện thanh công cụ"
            aria-label="Hiện thanh công cụ"
            className="
              absolute
              left-3
              top-3
              z-50
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-[#d9d9e3]
              bg-white
              text-xl
              text-[#6b7280]
              shadow-lg
              transition-all
              hover:scale-105
              hover:bg-[#f7f6fb]
              hover:text-[#111827]
            "
          >
            ›
          </button>
        )}

        <main
          className="
            custom-scrollbar
            relative
            min-w-0
            flex-1
            overflow-hidden
          "
        >
          <BuilderPreview />
        </main>
      </div>
    </div>
  );
}

export default CvBuilderPage;