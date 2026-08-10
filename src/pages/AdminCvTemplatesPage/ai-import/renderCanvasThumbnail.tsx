import html2canvas from 'html2canvas'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'

import {
  CANVAS_PAGE_HEIGHT,
  CANVAS_PAGE_WIDTH,
  type CanvasDocument,
} from '../../CvBuilderPage/canvas/canvas.types'
import { CanvasThumbnailPage } from './CanvasThumbnailPage'

function nextFrame() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()))
  })
}

export async function renderCanvasThumbnail(canvas: CanvasDocument): Promise<string | null> {
  if (!canvas.pages[0]) {
    return null
  }

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.width = `${CANVAS_PAGE_WIDTH}px`
  container.style.height = `${CANVAS_PAGE_HEIGHT}px`
  container.style.pointerEvents = 'none'
  document.body.appendChild(container)

  const root = createRoot(container)

  try {
    root.render(createElement(CanvasThumbnailPage, { canvas }))
    await document.fonts?.ready
    await nextFrame()

    const pageElement = container.querySelector<HTMLElement>(
      '[data-admin-cv-template-thumbnail-page]',
    )
    if (!pageElement) {
      return null
    }

    const rendered = await html2canvas(pageElement, {
      scale: 0.45,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: CANVAS_PAGE_WIDTH,
      height: CANVAS_PAGE_HEIGHT,
    })

    return rendered.toDataURL('image/jpeg', 0.82)
  } finally {
    root.unmount()
    container.remove()
  }
}
