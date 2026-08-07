import { useState } from 'react'

import { getIcon } from '../../CvBuilderPage/canvas/icons'
import {
  CANVAS_PAGE_HEIGHT,
  CANVAS_PAGE_WIDTH,
  type CanvasDocument,
  type CanvasElement,
} from '../../CvBuilderPage/canvas/canvas.types'

const SCALE = 0.34 // 794 × 0.34 ≈ 270px, vừa cột phải của modal

/**
 * Renderer read-only tối giản cho preview.
 *
 * KHÔNG tái dùng ElementView của CV Builder: nó kéo theo useCanvasStore, mà store
 * đó đọc localStorage ngay lúc khởi tạo module (useCanvasStore.ts:19). Preview chỉ
 * để nhìn nên không đáng đánh đổi bằng một side effect và cả store vào bundle admin.
 *
 * Đánh đổi: renderer này có thể lệch với builder theo thời gian. Giới hạn thiệt hại
 * bằng cách chỉ render đúng những thuộc tính mà sanitizer đảm bảo có thật.
 */
function PreviewElement({ element }: { element: CanvasElement }) {
  const box: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    opacity: element.opacity,
  }

  if (element.type === 'shape') {
    return (
      <div
        style={{
          ...box,
          background: element.fill,
          border:
            element.strokeWidth > 0 ? `${element.strokeWidth}px solid ${element.stroke}` : undefined,
          borderRadius: element.shape === 'ellipse' ? '50%' : element.borderRadius,
        }}
      />
    )
  }

  if (element.type === 'icon') {
    const Icon = getIcon(element.name)
    return (
      <div style={{ ...box, color: element.color }}>
        <Icon size={Math.min(element.width, element.height)} />
      </div>
    )
  }

  if (element.type === 'image') {
    return <div style={{ ...box, background: '#e5e7eb' }} />
  }

  return (
    <div
      style={{
        ...box,
        color: element.color,
        fontFamily: element.fontFamily,
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
        fontStyle: element.italic ? 'italic' : undefined,
        textDecoration: element.underline ? 'underline' : undefined,
        textAlign: element.align,
        lineHeight: element.lineHeight,
        letterSpacing: element.letterSpacing,
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
      }}
    >
      {element.text}
    </div>
  )
}

export function CanvasPreview({
  canvas,
  pageLabel,
}: {
  canvas: CanvasDocument
  pageLabel: (current: number, total: number) => string
}) {
  const [pageIndex, setPageIndex] = useState(0)
  const page = canvas.pages[Math.min(pageIndex, canvas.pages.length - 1)]

  if (!page) {
    return null
  }

  return (
    <div className="admin-cv-template-ai__preview">
      <div
        className="admin-cv-template-ai__preview-frame"
        style={{ width: CANVAS_PAGE_WIDTH * SCALE, height: CANVAS_PAGE_HEIGHT * SCALE }}
      >
        <div
          style={{
            width: CANVAS_PAGE_WIDTH,
            height: CANVAS_PAGE_HEIGHT,
            position: 'relative',
            background: page.background,
            transform: `scale(${SCALE})`,
            transformOrigin: 'top left',
          }}
        >
          {page.elements.map((element) => (
            <PreviewElement element={element} key={element.id} />
          ))}
        </div>
      </div>

      {canvas.pages.length > 1 ? (
        <div className="admin-cv-template-ai__preview-pager">
          <button
            disabled={pageIndex === 0}
            onClick={() => setPageIndex((i) => i - 1)}
            type="button"
          >
            ‹
          </button>
          <span>{pageLabel(pageIndex + 1, canvas.pages.length)}</span>
          <button
            disabled={pageIndex >= canvas.pages.length - 1}
            onClick={() => setPageIndex((i) => i + 1)}
            type="button"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  )
}
