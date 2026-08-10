import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { CanvasHeader } from './canvas/components/CanvasHeader';
import { InsertPanel } from './canvas/components/InsertPanel';
import { TemplatesPanel } from './canvas/components/TemplatesPanel';
import { MyCvsPanel } from './canvas/components/MyCvsPanel';
import { ColorField } from './canvas/components/ColorField';
import { CanvasStage } from './canvas/components/CanvasStage';
import { PropertiesPanel } from './canvas/components/PropertiesPanel';
import { LayersPanel } from './canvas/components/LayersPanel';
import { useCanvasStore } from './canvas/store/useCanvasStore';
import { useCanvasKeyboard } from './canvas/hooks/useCanvasKeyboard';
import { CV_TEMPLATES } from './canvas/templates';
import { cvTemplatePresetService } from '../../services/cvTemplatePreset.service';
import { useLocale } from '../../i18n';
import type { CanvasDocument } from './canvas/canvas.types';

type RightTab = 'properties' | 'layers';
type LeftTab = 'insert' | 'templates' | 'mine';
type MobilePanel = 'left' | 'right' | null;

const PageControls = () => {
  const doc = useCanvasStore((s) => s.document);
  const activePageId = useCanvasStore((s) => s.activePageId);
  const duplicatePage = useCanvasStore((s) => s.duplicatePage);
  const removePage = useCanvasStore((s) => s.removePage);
  const setPageBackground = useCanvasStore((s) => s.setPageBackground);

  const page = doc.pages.find((p) => p.id === activePageId);
  const idx = doc.pages.findIndex((p) => p.id === activePageId);

  return (
    <div className="border-t border-[#e5e7eb] p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
        Trang {idx + 1}/{doc.pages.length}
      </p>
      <div className="mb-3">
        <p className="mb-1 text-sm text-[#111827]">Màu nền</p>
        <ColorField
          value={page?.background ?? '#ffffff'}
          onChange={(v) => setPageBackground(activePageId, v)}
          allowTransparent={false}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => duplicatePage(activePageId)}
          className="rounded-md border border-[#e5e7eb] bg-white px-2 py-1.5 text-xs hover:border-[#f23b94]"
        >
          ⧉ Nhân bản trang
        </button>
        <button
          type="button"
          disabled={doc.pages.length <= 1}
          onClick={() => removePage(activePageId)}
          className="rounded-md border border-[#fecaca] bg-white px-2 py-1.5 text-xs text-[#dc2626] hover:bg-[#fef2f2] disabled:cursor-not-allowed disabled:opacity-40"
        >
          🗑 Xóa trang
        </button>
      </div>
    </div>
  );
};

const CollapsedRail = ({
  onOpen,
  side,
  title,
  label,
}: {
  onOpen: () => void;
  side: 'left' | 'right';
  title: string;
  label: string;
}) => {
  const Icon = side === 'left' ? PanelLeftOpen : PanelRightOpen;
  return (
    <button
      type="button"
      onClick={onOpen}
      title={title}
      aria-label={title}
      className={`group hidden w-11 shrink-0 cursor-pointer flex-col items-center gap-3 bg-[#f7f6fb] pt-3 transition-colors hover:bg-[#efeef6] md:flex ${
        side === 'left'
          ? 'border-r border-[#d9d9e3]'
          : 'border-l border-[#d9d9e3]'
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d9d9e3] bg-white text-[#6b7280] shadow-sm transition-colors group-hover:border-[#f23b94] group-hover:bg-[#fef3f8] group-hover:text-[#f23b94]">
        <Icon size={18} />
      </span>
      <span className="select-none text-[11px] font-semibold tracking-wide text-[#9ca3af] [writing-mode:vertical-rl] group-hover:text-[#6b7280]">
        {label}
      </span>
    </button>
  );
};

const MIN_W = 220;
const MAX_W = 460;

function firstLocalizedText(value: Record<'vi' | 'en' | 'ja', string>, locale: string) {
  return value[locale as 'vi' | 'en' | 'ja'] || value.vi || value.en || value.ja;
}

function normalizePresetDocument(document: CanvasDocument, name: string): CanvasDocument {
  return {
    ...document,
    id: document.id || `template-${Date.now()}`,
    name: document.name || name,
    pageSize: document.pageSize ?? { width: 794, height: 1123 },
    pages: document.pages.map((page, index) => ({
      ...page,
      id: page.id || `template-page-${index + 1}`,
      background: page.background || '#ffffff',
      elements: Array.isArray(page.elements) ? page.elements : [],
    })),
  };
}

// Thanh kéo để đổi bề rộng sidebar.
const ResizeHandle = ({
  side,
  width,
  setWidth,
}: {
  side: 'left' | 'right';
  width: number;
  setWidth: (w: number) => void;
}) => {
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = width;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const next = side === 'left' ? startW + dx : startW - dx;
      setWidth(Math.max(MIN_W, Math.min(MAX_W, next)));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div
      onMouseDown={onMouseDown}
      title="Kéo để đổi bề rộng"
      className="hidden w-1.5 shrink-0 cursor-col-resize bg-transparent transition-colors hover:bg-[#f23b94]/40 md:block"
    />
  );
};

const MobileDrawer = ({
  open,
  side,
  title,
  onClose,
  children,
}: {
  open: boolean;
  side: 'left' | 'right';
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <button
        type="button"
        aria-label="Đóng bảng"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <aside
        className={`absolute top-0 flex h-full w-[min(88vw,360px)] flex-col bg-[#f7f6fb] shadow-2xl ${
          side === 'left' ? 'left-0' : 'right-0'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#d9d9e3] bg-white px-4 py-3">
          <p className="text-sm font-bold text-[#111827]">{title}</p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e5e7eb] text-[#6b7280]"
            aria-label="Đóng bảng"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </div>
  );
};

export function CvBuilderPage() {
  useCanvasKeyboard();
  const { locale } = useLocale();
  const { templateId } = useParams<{ templateId?: string }>();
  const loadDocument = useCanvasStore((s) => s.loadDocument);
  const applyTemplate = useCanvasStore((s) => s.applyTemplate);
  const [rightTab, setRightTab] = useState<RightTab>('properties');
  const [leftTab, setLeftTab] = useState<LeftTab>('insert');
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftW, setLeftW] = useState(280);
  const [rightW, setRightW] = useState(320);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);

  useEffect(() => {
    if (!templateId) {
      return;
    }

    let active = true;
    const localTemplate = CV_TEMPLATES.find((template) => template.id === templateId);

    cvTemplatePresetService.get(templateId)
      .then((preset) => {
        if (!active) return;
        if (preset.canvas?.pages?.length) {
          loadDocument(
            normalizePresetDocument(
              preset.canvas,
              firstLocalizedText(preset.name, locale),
            ),
            null,
          );
          return;
        }
        if (localTemplate) {
          applyTemplate(localTemplate.build(), localTemplate.name);
        }
      })
      .catch(() => {
        if (!active || !localTemplate) return;
        applyTemplate(localTemplate.build(), localTemplate.name);
      });

    return () => {
      active = false;
    };
  }, [applyTemplate, loadDocument, locale, templateId]);

  const tabBtn = (active: boolean) =>
    `flex-1 border-b-2 px-3 py-2 text-sm font-medium ${
      active
        ? 'border-[#f23b94] text-[#f23b94]'
        : 'border-transparent text-[#6b7280] hover:text-[#111827]'
    }`;

  const collapseBtn =
    'mx-1 flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-md border border-[#e5e7eb] bg-white text-[#6b7280] transition-colors hover:border-[#f23b94] hover:bg-[#fef3f8] hover:text-[#f23b94]';

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden bg-[#f7f6fb]">
      <CanvasHeader />

      <div className="border-b border-[#d9d9e3] bg-white px-4 py-2 md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMobilePanel('left')}
            className="rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-medium text-[#111827]"
          >
            Công cụ
          </button>
          <button
            type="button"
            onClick={() => setMobilePanel('right')}
            className="rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-medium text-[#111827]"
          >
            Thuộc tính
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        {/* Left: chèn nội dung / mẫu */}
        {leftOpen ? (
          <aside
            style={{ width: leftW }}
            className="hidden h-full shrink-0 flex-col overflow-hidden border-r border-[#d9d9e3] bg-[#f7f6fb] md:flex"
          >
            <div className="flex shrink-0 border-b border-[#d9d9e3]">
              <button
                type="button"
                className={tabBtn(leftTab === 'insert')}
                onClick={() => setLeftTab('insert')}
              >
                Chèn
              </button>
              <button
                type="button"
                className={tabBtn(leftTab === 'templates')}
                onClick={() => setLeftTab('templates')}
              >
                Mẫu
              </button>
              <button
                type="button"
                className={tabBtn(leftTab === 'mine')}
                onClick={() => setLeftTab('mine')}
              >
                Đã lưu
              </button>
              <button
                type="button"
                onClick={() => setLeftOpen(false)}
                title="Thu gọn bảng bên trái"
                aria-label="Thu gọn bảng bên trái"
                className={collapseBtn}
              >
                <PanelLeftClose size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {leftTab === 'insert' && <InsertPanel />}
              {leftTab === 'templates' && <TemplatesPanel />}
              {leftTab === 'mine' && <MyCvsPanel />}
            </div>
          </aside>
        ) : (
          <CollapsedRail
            side="left"
            onOpen={() => setLeftOpen(true)}
            title="Mở bảng công cụ"
            label="CÔNG CỤ"
          />
        )}

        {leftOpen && (
          <ResizeHandle side="left" width={leftW} setWidth={setLeftW} />
        )}

        {/* Center: canvas */}
        <main className="relative flex min-w-0 flex-1 overflow-hidden">
          <CanvasStage />
        </main>

        {rightOpen && (
          <ResizeHandle side="right" width={rightW} setWidth={setRightW} />
        )}

        {/* Right: thuộc tính / layers */}
        {rightOpen ? (
          <aside
            style={{ width: rightW }}
            className="hidden h-full shrink-0 flex-col overflow-hidden border-l border-[#d9d9e3] bg-white md:flex"
          >
            <div className="flex shrink-0 border-b border-[#e5e7eb]">
              <button
                type="button"
                onClick={() => setRightOpen(false)}
                title="Thu gọn bảng bên phải"
                aria-label="Thu gọn bảng bên phải"
                className={collapseBtn}
              >
                <PanelRightClose size={16} />
              </button>
              <button
                type="button"
                className={tabBtn(rightTab === 'properties')}
                onClick={() => setRightTab('properties')}
              >
                Thuộc tính
              </button>
              <button
                type="button"
                className={tabBtn(rightTab === 'layers')}
                onClick={() => setRightTab('layers')}
              >
                Lớp
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {rightTab === 'properties' ? <PropertiesPanel /> : <LayersPanel />}
            </div>
            <PageControls />
          </aside>
        ) : (
          <CollapsedRail
            side="right"
            onOpen={() => setRightOpen(true)}
            title="Mở bảng thuộc tính"
            label="THUỘC TÍNH"
          />
        )}
      </div>

      <MobileDrawer
        open={mobilePanel === 'left'}
        side="left"
        title="Công cụ"
        onClose={() => setMobilePanel(null)}
      >
        <div className="flex shrink-0 border-b border-[#d9d9e3]">
          <button
            type="button"
            className={tabBtn(leftTab === 'insert')}
            onClick={() => setLeftTab('insert')}
          >
            Chèn
          </button>
          <button
            type="button"
            className={tabBtn(leftTab === 'templates')}
            onClick={() => setLeftTab('templates')}
          >
            Mẫu
          </button>
          <button
            type="button"
            className={tabBtn(leftTab === 'mine')}
            onClick={() => setLeftTab('mine')}
          >
            Đã lưu
          </button>
        </div>
        <div className="pt-4">
          {leftTab === 'insert' && <InsertPanel />}
          {leftTab === 'templates' && <TemplatesPanel />}
          {leftTab === 'mine' && <MyCvsPanel />}
        </div>
      </MobileDrawer>

      <MobileDrawer
        open={mobilePanel === 'right'}
        side="right"
        title="Thuộc tính"
        onClose={() => setMobilePanel(null)}
      >
        <div className="flex shrink-0 border-b border-[#e5e7eb]">
          <button
            type="button"
            className={tabBtn(rightTab === 'properties')}
            onClick={() => setRightTab('properties')}
          >
            Thuộc tính
          </button>
          <button
            type="button"
            className={tabBtn(rightTab === 'layers')}
            onClick={() => setRightTab('layers')}
          >
            Lớp
          </button>
        </div>
        <div className="pt-4">
          {rightTab === 'properties' ? <PropertiesPanel /> : <LayersPanel />}
          <PageControls />
        </div>
      </MobileDrawer>
    </div>
  );
}

export default CvBuilderPage;
