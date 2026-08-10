import { useMemo, useState } from 'react';
import { useAsync } from '../../../../hooks/useAsync';
import { useLocale, useTranslations } from '../../../../i18n';
import { cvTemplatePresetService } from '../../../../services/cvTemplatePreset.service';
import type { PublicCvTemplatePreset } from '../../../../types/cvTemplatePreset.types';
import { useCanvasStore } from '../store/useCanvasStore';
import { CV_TEMPLATES } from '../templates';
import { ElementView } from './ElementView';
import { CANVAS_PAGE_WIDTH, CANVAS_PAGE_HEIGHT, type CanvasPage } from '../canvas.types';
import { TemplateReplaceDialog } from './TemplateReplaceDialog';

const THUMB_WIDTH = 232;
const SCALE = THUMB_WIDTH / CANVAS_PAGE_WIDTH;

type BuilderTemplate = {
  id: string;
  name: string;
  description: string;
  accent: string;
  build: () => CanvasPage[];
};

const clonePages = (pages: CanvasPage[]): CanvasPage[] =>
  JSON.parse(JSON.stringify(pages)) as CanvasPage[];

const normalizePages = (pages: CanvasPage[]): CanvasPage[] =>
  pages.map((page, index) => ({
    ...page,
    id: page.id || `template-page-${index + 1}`,
    background: page.background || '#ffffff',
    elements: Array.isArray(page.elements) ? page.elements : [],
  }));

const localizedText = (
  value: Record<'vi' | 'en' | 'ja', string>,
  locale: string,
) => value[locale as 'vi' | 'en' | 'ja'] || value.vi || value.en || value.ja;

const toBuilderTemplate = (
  preset: PublicCvTemplatePreset,
  locale: string,
): BuilderTemplate | null => {
  if (!preset.canvas?.pages?.length) {
    return null;
  }

  const pages = normalizePages(preset.canvas.pages);
  return {
    id: preset.key,
    name: localizedText(preset.name, locale),
    description: localizedText(preset.description, locale),
    accent: preset.accent ?? '#2563eb',
    build: () => clonePages(pages),
  };
};

const TemplateThumb = ({ template }: { template: BuilderTemplate }) => {
  // Build 1 lần để preview (id cố định trong vòng đời card).
  const pages = useMemo(() => template.build(), [template]);
  const page = pages[0];

  return (
    <div
      style={{
        width: THUMB_WIDTH,
        height: CANVAS_PAGE_HEIGHT * SCALE,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 6,
        border: '1px solid #e5e7eb',
        background: page.background,
      }}
    >
      <div
        style={{
          width: CANVAS_PAGE_WIDTH,
          height: CANVAS_PAGE_HEIGHT,
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
      >
        {[...page.elements]
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => (
            <ElementView
              key={el.id}
              element={el}
              selected={false}
              editing={false}
              onStartEdit={() => {}}
              onStopEdit={() => {}}
            />
          ))}
      </div>
    </div>
  );
};

export const TemplatesPanel = () => {
  const { locale } = useLocale();
  const { pages } = useTranslations();
  const applyTemplate = useCanvasStore((s) => s.applyTemplate);
  const document = useCanvasStore((s) => s.document);
  const presetsState = useAsync(
    () => cvTemplatePresetService.list({ includeCanvas: true }),
    [],
  );
  const [pendingTemplate, setPendingTemplate] = useState<BuilderTemplate | null>(null);

  const hasContent = document.pages.some((p) => p.elements.length > 0);
  const templates = useMemo(() => {
    const remoteTemplates =
      presetsState.data
        ?.map((preset) => toBuilderTemplate(preset, locale))
        .filter((preset): preset is BuilderTemplate => Boolean(preset)) ?? [];

    return remoteTemplates.length > 0 ? remoteTemplates : CV_TEMPLATES;
  }, [locale, presetsState.data]);

  const applySelectedTemplate = (template: BuilderTemplate) => {
    applyTemplate(template.build(), template.name);
  };

  const handleApply = (template: BuilderTemplate) => {
    if (hasContent) {
      setPendingTemplate(template);
      return;
    }

    applySelectedTemplate(template);
  };

  const handleConfirmApply = () => {
    if (!pendingTemplate) {
      return;
    }

    applySelectedTemplate(pendingTemplate);
    setPendingTemplate(null);
  };

  return (
    <div>
      <h2 className="text-sm font-bold text-[#111827]">Mẫu CV</h2>
      <p className="mb-3 mt-1 text-xs text-[#6b7280]">
        Chọn một mẫu để bắt đầu, sau đó chỉnh sửa tự do.
      </p>
      <div className="flex flex-col gap-4">
        {templates.map((template) => (
          <div key={template.id} className="flex flex-col gap-2">
            <TemplateThumb template={template} />
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                {template.name}
              </p>
              <p className="text-xs text-[#6b7280]">{template.description}</p>
            </div>
            <button
              type="button"
              onClick={() => handleApply(template)}
              className="rounded-md px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: template.accent }}
            >
              {pages.cvTemplates.card.useTemplate}
            </button>
          </div>
        ))}
      </div>
      <TemplateReplaceDialog
        isOpen={Boolean(pendingTemplate)}
        onCancel={() => setPendingTemplate(null)}
        onConfirm={handleConfirmApply}
        templateName={pendingTemplate?.name ?? ''}
        translations={pages.cvTemplates.templateReplaceDialog}
      />
    </div>
  );
};
