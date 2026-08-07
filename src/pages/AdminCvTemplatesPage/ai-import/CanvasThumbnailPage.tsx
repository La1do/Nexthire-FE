import type { CSSProperties } from 'react'

import { getIcon } from '../../CvBuilderPage/canvas/icons'
import {
  CANVAS_PAGE_HEIGHT,
  CANVAS_PAGE_WIDTH,
  type CanvasDocument,
  type CanvasElement,
} from '../../CvBuilderPage/canvas/canvas.types'

function ThumbnailElement({ element }: { element: CanvasElement }) {
  const box: CSSProperties = {
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
            element.strokeWidth > 0
              ? `${element.strokeWidth}px solid ${element.stroke}`
              : undefined,
          borderRadius:
            element.shape === 'ellipse' ? '50%' : element.borderRadius,
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
    return (
      <img
        alt=""
        src={element.src}
        style={{
          ...box,
          borderRadius: element.borderRadius,
          objectFit: element.objectFit,
        }}
      />
    )
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

export function CanvasThumbnailPage({ canvas }: { canvas: CanvasDocument }) {
  const page = canvas.pages[0]

  if (!page) {
    return null
  }

  return (
    <div
      data-admin-cv-template-thumbnail-page
      style={{
        width: CANVAS_PAGE_WIDTH,
        height: CANVAS_PAGE_HEIGHT,
        position: 'relative',
        background: page.background,
        overflow: 'hidden',
      }}
    >
      {page.elements.map((element) => (
        <ThumbnailElement element={element} key={element.id} />
      ))}
    </div>
  )
}
