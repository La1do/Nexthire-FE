import { useState } from 'react';
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

type RightTab = 'properties' | 'layers';
type LeftTab = 'insert' | 'templates' | 'mine';

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

export function CvBuilderPage() {
  useCanvasKeyboard();
  const [rightTab, setRightTab] = useState<RightTab>('properties');
  const [leftTab, setLeftTab] = useState<LeftTab>('insert');
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftW, setLeftW] = useState(280);
  const [rightW, setRightW] = useState(320);

  const tabBtn = (active: boolean) =>
    `flex-1 border-b-2 px-3 py-2 text-sm font-medium ${
      active
        ? 'border-[#f23b94] text-[#f23b94]'
        : 'border-transparent text-[#6b7280] hover:text-[#111827]'
    }`;

  const collapseBtn =
    'mx-1 flex h-8 w-8 shrink-0 items-center justify-center self-center rounded-md border border-[#e5e7eb] bg-white text-[#6b7280] transition-colors hover:border-[#f23b94] hover:bg-[#fef3f8] hover:text-[#f23b94]';

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#f7f6fb]">
      <CanvasHeader />

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
    </div>
  );
}

export default CvBuilderPage;
