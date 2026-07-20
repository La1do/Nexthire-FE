import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BuilderHeader } from './components/BuilderHeader';
import { BuilderTabs } from './components/BuilderTabs';
import { ContentForm } from './components/ContentForm';
import { DesignConfig } from './components/DesignConfig';
import { LayoutConfig } from './components/LayoutConfig';
import { SectionManager } from './components/SectionManager';
import { TemplateSwitcher } from './components/TemplateSwitcher';
import { AiSuggestions } from './components/AiSuggestions';
import { CvLibrary } from './components/CvLibrary';
import { BuilderPreview } from './components/BuilderPreview';
import { useCvBuilderStore } from './store/useCvBuilderStore';

const PANEL_BY_TAB = {
  content: ContentForm,
  design: DesignConfig,
  layout: LayoutConfig,
  sections: SectionManager,
  templates: TemplateSwitcher,
  ai: AiSuggestions,
  library: CvLibrary,
} as const;

export function CvBuilderPage() {
  const { templateId } = useParams<{ templateId: string }>();
  const activeTab = useCvBuilderStore((state) => state.activeTab);
  const setTemplateId = useCvBuilderStore((state) => state.setTemplateId);

  useEffect(() => {
    if (templateId) setTemplateId(templateId);
  }, [templateId, setTemplateId]);

  const ActivePanel = PANEL_BY_TAB[activeTab];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f7f6fb]">
      <BuilderHeader />

      <div className="flex flex-1 overflow-hidden">
        <BuilderTabs />

        <aside className="w-full shrink-0 overflow-y-auto border-r border-[#d9d9e3] bg-[#f7f6fb] p-6 lg:w-[380px] xl:w-[420px]">
          <ActivePanel />
        </aside>

        <main className="custom-scrollbar relative flex-1 overflow-hidden">
          <BuilderPreview />
        </main>
      </div>
    </div>
  );
}

export default CvBuilderPage;