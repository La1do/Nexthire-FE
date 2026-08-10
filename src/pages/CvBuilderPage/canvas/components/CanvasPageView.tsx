import type { CanvasPage } from '../canvas.types';
import { ElementView } from './ElementView';

interface Props {
  page: CanvasPage;
  pageWidth: number;
  pageHeight: number;
  isActive: boolean;
  selectedIds: string[];
  editingId: string | null;
  onStartEdit: (id: string) => void;
  onStopEdit: () => void;
  onActivate: () => void;
}

export const CanvasPageView = ({
  page,
  pageWidth,
  pageHeight,
  isActive,
  selectedIds,
  editingId,
  onStartEdit,
  onStopEdit,
  onActivate,
}: Props) => {
  const ordered = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      data-cv-page-id={page.id}
      data-canvas-page={page.id}
      onMouseDown={onActivate}
      style={{
        position: 'relative',
        width: pageWidth,
        height: pageHeight,
        boxShadow: isActive
          ? '0 0 0 2px #f23b94, 0 10px 30px rgba(0,0,0,0.12)'
          : '0 10px 30px rgba(0,0,0,0.12)',
      }}
    >
      {/* Nội dung trang — export PDF chụp phần tử này */}
      <div
        data-cv-page-content
        style={{
          position: 'absolute',
          inset: 0,
          background: page.background,
          overflow: 'hidden',
        }}
      >
        {ordered.length === 0 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              color: '#9ca3af',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <span style={{ fontSize: 40 }}>✨</span>
            <p style={{ fontSize: 18, fontWeight: 600 }}>Trang trắng</p>
            <p style={{ fontSize: 14 }}>
              Chọn một mẫu ở tab “Mẫu” hoặc chèn phần tử từ bảng bên trái.
            </p>
          </div>
        )}

        {ordered.map((element) => (
          <ElementView
            key={element.id}
            element={element}
            selected={isActive && selectedIds.includes(element.id)}
            editing={editingId === element.id}
            autoGrowText
            onStartEdit={onStartEdit}
            onStopEdit={onStopEdit}
          />
        ))}
      </div>
    </div>
  );
};
