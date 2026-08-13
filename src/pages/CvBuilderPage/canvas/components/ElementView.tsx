import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { useCanvasStore } from '../store/useCanvasStore';
import { getIcon } from '../icons';
import type {
  CanvasElement,
  IconElement,
  ImageElement,
  ShapeElement,
  TextElement,
} from '../canvas.types';

interface Props {
  element: CanvasElement;
  selected: boolean;
  editing: boolean;
  autoGrowText?: boolean;
  onStartEdit: (id: string) => void;
  onStopEdit: () => void;
}

const TextContent = ({
  element,
  editing,
  autoGrow,
  onStopEdit,
}: {
  element: TextElement;
  editing: boolean;
  autoGrow: boolean;
  onStopEdit: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const updateElement = useCanvasStore((s) => s.updateElement);

  useEffect(() => {
    if (editing && ref.current) {
      ref.current.focus();
      // Đặt con trỏ cuối văn bản.
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [editing]);

  useLayoutEffect(() => {
    if (!autoGrow || !ref.current) {
      return;
    }

    const nextHeight = Math.ceil(ref.current.scrollHeight);
    if (Number.isFinite(nextHeight) && nextHeight > element.height + 1) {
      updateElement(element.id, { height: nextHeight });
    }
  }, [
    autoGrow,
    element.id,
    element.text,
    element.fontFamily,
    element.fontSize,
    element.fontWeight,
    element.italic,
    element.underline,
    element.lineHeight,
    element.letterSpacing,
    element.width,
    element.height,
    updateElement,
  ]);

  const style: CSSProperties = {
    width: '100%',
    height: 'auto',
    minHeight: '100%',
    fontFamily: element.fontFamily,
    fontSize: element.fontSize,
    fontWeight: element.fontWeight,
    fontStyle: element.italic ? 'italic' : 'normal',
    textDecoration: element.underline ? 'underline' : 'none',
    color: element.color,
    textAlign: element.align,
    lineHeight: element.lineHeight,
    letterSpacing: `${element.letterSpacing}px`,
    outline: 'none',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    cursor: editing ? 'text' : 'inherit',
    userSelect: editing ? 'text' : 'none',
  };

  return (
    <div
      ref={ref}
      style={style}
      contentEditable={editing}
      suppressContentEditableWarning
      onBlur={(e) => {
        updateElement(element.id, { text: e.currentTarget.innerText });
        onStopEdit();
      }}
    >
      {element.text}
    </div>
  );
};

const ImageContent = ({ element }: { element: ImageElement }) => (
  <img
    src={element.src}
    alt=""
    draggable={false}
    style={{
      width: '100%',
      height: '100%',
      objectFit: element.objectFit,
      objectPosition: `${element.objectPositionX ?? 50}% ${element.objectPositionY ?? 50}%`,
      borderRadius: element.borderRadius,
      pointerEvents: 'none',
      display: 'block',
    }}
  />
);

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const ShapeContent = ({
  element,
  cropMode,
  selected,
}: {
  element: ShapeElement;
  cropMode: boolean;
  selected: boolean;
}) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const [guideAspectRatio, setGuideAspectRatio] = useState<number | null>(null);

  // Phải nằm trước nhánh 'line' return sớm, nếu không thứ tự hook sẽ đổi khi
  // element chuyển qua lại giữa line và các shape khác.
  useEffect(() => {
    setGuideAspectRatio(null);
  }, [element.imageSrc]);

  if (element.shape === 'line') {
    return (
      <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
        <line
          x1={0}
          y1={element.height / 2}
          x2={element.width}
          y2={element.height / 2}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          strokeLinecap="round"
        />
      </svg>
    );
  }
  const borderRadius = element.shape === 'ellipse' ? '50%' : element.borderRadius;
  const canRepositionImage = Boolean(element.imageSrc && cropMode && selected && !element.locked);
  const imagePositionX = element.imagePositionX ?? 50;
  const imagePositionY = element.imagePositionY ?? 50;
  const guideOffsetX = 50 + (50 - imagePositionX) * 0.45;
  const guideOffsetY = 50 + (50 - imagePositionY) * 0.45;

  const handleImagePointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!canRepositionImage) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);

    const frame = event.currentTarget.parentElement;
    const rect = frame?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const startX = event.clientX;
    const startY = event.clientY;
    const startPositionX = imagePositionX;
    const startPositionY = imagePositionY;

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    const onMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault();
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      updateElement(element.id, {
        imagePositionX: clampPercent(startPositionX - (dx / rect.width) * 100),
        imagePositionY: clampPercent(startPositionY - (dy / rect.height) * 100),
      });
    };

    const onUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius,
        overflow: cropMode ? 'visible' : 'hidden',
      }}
    >
      {cropMode && element.imageSrc ? (
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.08)',
            border: '1px dashed rgba(37, 99, 235, 0.34)',
            borderRadius: 14,
            boxShadow: '0 18px 36px rgba(15, 23, 42, 0.14)',
            left: `${guideOffsetX}%`,
            aspectRatio: guideAspectRatio ?? 1,
            pointerEvents: 'none',
            position: 'absolute',
            top: `${guideOffsetY}%`,
            transform: 'translate(-50%, -50%)',
            width: '240%',
            zIndex: 0,
          }}
        >
          <img
            alt=""
            draggable={false}
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              if (naturalWidth > 0 && naturalHeight > 0) {
                setGuideAspectRatio(naturalWidth / naturalHeight);
              }
            }}
            src={element.imageSrc}
            style={{
              display: 'block',
              height: '100%',
              objectFit: 'contain',
              opacity: 0.48,
              width: '100%',
            }}
          />
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: cropMode && element.imageSrc ? 'rgba(255, 255, 255, 0.92)' : element.fill,
          border:
            element.strokeWidth > 0
              ? `${element.strokeWidth}px solid ${element.stroke}`
              : 'none',
          borderRadius,
          boxSizing: 'border-box',
          boxShadow: cropMode
            ? '0 16px 28px rgba(15, 23, 42, 0.22), 0 0 0 2px rgba(242, 59, 148, 0.78)'
            : undefined,
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        {element.imageSrc ? (
          <img
            alt=""
            draggable={false}
            onPointerDown={handleImagePointerDown}
            src={element.imageSrc}
            style={{
              display: 'block',
              height: '100%',
              inset: 0,
              objectFit: element.imageFit ?? 'cover',
              objectPosition: `${imagePositionX}% ${imagePositionY}%`,
              cursor: canRepositionImage ? 'grab' : 'inherit',
              pointerEvents: canRepositionImage ? 'auto' : 'none',
              position: 'absolute',
              touchAction: 'none',
              width: '100%',
            }}
          />
        ) : null}
      </div>
    </div>
  );
};

const IconContent = ({ element }: { element: IconElement }) => {
  const Icon = getIcon(element.name);
  return (
    <Icon
      width="100%"
      height="100%"
      color={element.color}
      strokeWidth={2}
    />
  );
};

export const ElementView = ({
  element,
  selected,
  editing,
  autoGrowText = false,
  onStartEdit,
  onStopEdit,
}: Props) => {
  const shapeImageSrc = element.type === 'shape' ? element.imageSrc : undefined;
  // Chế độ chỉnh ảnh trong khung là state tường minh của store (bật/tắt từ bảng
  // thuộc tính), không phải toggle ẩn bằng double click — nếu không người dùng
  // dễ rơi vào trạng thái "kéo mà element không di chuyển".
  const cropMode = useCanvasStore(
    (s) => s.croppingId === element.id && Boolean(shapeImageSrc),
  );
  const setCroppingId = useCanvasStore((s) => s.setCroppingId);

  useEffect(() => {
    if (cropMode && (!selected || !shapeImageSrc)) {
      setCroppingId(null);
    }
  }, [cropMode, selected, shapeImageSrc, setCroppingId]);

  if (element.hidden) return null;

  const wrapperStyle: CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation}deg)`,
    transformOrigin: 'center center',
    zIndex: element.zIndex,
    opacity: element.opacity,
    cursor: element.locked ? 'default' : 'move',
    outline: selected ? '1px solid #f23b94' : 'none',
    outlineOffset: 2,
  };

  return (
    <div
      className="canvas-element"
      data-element-id={element.id}
      data-locked={element.locked ? 'true' : 'false'}
      style={wrapperStyle}
      onDoubleClick={() => {
        if (element.type === 'text' && !element.locked) {
          onStartEdit(element.id);
        }
      }}
    >
      {element.type === 'text' && (
        <TextContent
          element={element}
          editing={editing}
          autoGrow={autoGrowText}
          onStopEdit={onStopEdit}
        />
      )}
      {element.type === 'image' && <ImageContent element={element} />}
      {element.type === 'shape' && (
        <ShapeContent element={element} cropMode={cropMode} selected={selected} />
      )}
      {element.type === 'icon' && <IconContent element={element} />}
    </div>
  );
};
