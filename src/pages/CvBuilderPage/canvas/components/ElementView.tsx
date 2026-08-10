import { useEffect, useLayoutEffect, useRef } from 'react';
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
      borderRadius: element.borderRadius,
      pointerEvents: 'none',
      display: 'block',
    }}
  />
);

const ShapeContent = ({ element }: { element: ShapeElement }) => {
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
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: element.fill,
        border:
          element.strokeWidth > 0
            ? `${element.strokeWidth}px solid ${element.stroke}`
            : 'none',
        borderRadius:
          element.shape === 'ellipse' ? '50%' : element.borderRadius,
        boxSizing: 'border-box',
      }}
    />
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
      {element.type === 'shape' && <ShapeContent element={element} />}
      {element.type === 'icon' && <IconContent element={element} />}
    </div>
  );
};
