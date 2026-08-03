import { useMemo } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';
import { CV_TEMPLATES, type CvTemplate } from '../templates';
import { ElementView } from './ElementView';
import { CANVAS_PAGE_WIDTH, CANVAS_PAGE_HEIGHT } from '../canvas.types';

const THUMB_WIDTH = 232;
const SCALE = THUMB_WIDTH / CANVAS_PAGE_WIDTH;

const TemplateThumb = ({ template }: { template: CvTemplate }) => {
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
  const applyTemplate = useCanvasStore((s) => s.applyTemplate);
  const document = useCanvasStore((s) => s.document);

  const hasContent = document.pages.some((p) => p.elements.length > 0);

  const handleApply = (template: CvTemplate) => {
    if (
      hasContent &&
      !window.confirm(
        'Áp dụng mẫu sẽ thay thế toàn bộ nội dung hiện tại. Tiếp tục?',
      )
    ) {
      return;
    }
    applyTemplate(template.build());
  };

  return (
    <div>
      <h2 className="text-sm font-bold text-[#111827]">Mẫu CV</h2>
      <p className="mb-3 mt-1 text-xs text-[#6b7280]">
        Chọn một mẫu để bắt đầu, sau đó chỉnh sửa tự do.
      </p>
      <div className="flex flex-col gap-4">
        {CV_TEMPLATES.map((template) => (
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
              Dùng mẫu này
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
