import { useCallback, useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import 'pdfjs-dist/web/pdf_viewer.css'
import {
  AlertCircle,
  ExternalLink,
  Maximize2,
  RefreshCw,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { configurePdfJsWorker } from './pdfWorkerHelper'

export type PdfCvViewerProps = {
  url: string
  fileName?: string
  searchQuery?: string | null
  snippetText?: string | null
  className?: string
  onFallbackToIframe?: () => void
  onClearSearch?: () => void
}

function extractSearchTerms(query?: string | null, snippet?: string | null): string[] {
  const terms: string[] = []
  if (query?.trim()) {
    const qClean = query.trim().replace(/[.,;:!?()"']/g, '')
    if (qClean.length >= 2) {
      terms.push(qClean)
      const lower = qClean.toLowerCase()
      if (lower === 'k8s') terms.push('kubernetes')
      if (lower === 'kubernetes') terms.push('k8s')
      if (lower === 'postgres' || lower === 'postgresql') {
        terms.push('postgres', 'postgresql')
      }
      if (lower === 'ts' || lower === 'typescript') {
        terms.push('typescript', 'ts')
      }
      if (lower === 'js' || lower === 'javascript') {
        terms.push('javascript', 'js')
      }
      if (lower === 'react' || lower === 'reactjs') {
        terms.push('reactjs', 'react')
      }
      if (lower === 'golang' || lower === 'go') {
        terms.push('golang', 'go')
      }
      if (lower === 'py' || lower === 'python') {
        terms.push('python', 'py')
      }

      // Add component words if query is multi-word
      const words = qClean.split(/\s+/).filter((w) => w.length >= 3)
      terms.push(...words)
    }
  }

  if (snippet?.trim()) {
    const sentences = snippet
      .split(/[.;\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 8)

    for (const s of sentences.slice(0, 2)) {
      const sWords = s.split(/\s+/).slice(0, 5).join(' ').replace(/[.,;:!?()"']/g, '')
      if (sWords.length >= 6) {
        terms.push(sWords)
      }
    }
  }

  const unique = Array.from(new Set(terms.filter((t) => t.length >= 2)))
  return unique.sort((a, b) => b.length - a.length)
}

export function PdfCvViewer({
  url,
  fileName = 'CV Document',
  searchQuery,
  snippetText,
  className = '',
  onFallbackToIframe,
  onClearSearch,
}: PdfCvViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [scale, setScale] = useState<number>(1.25)
  const [highlightCount, setHighlightCount] = useState<number>(0)
  const [isHighlighting, setIsHighlighting] = useState<boolean>(false)

  const viewerContainerRef = useRef<HTMLDivElement | null>(null)
  const pageContainerRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const renderedPagesRef = useRef<Set<number>>(new Set())

  // Ensure worker is configured on mount
  useEffect(() => {
    configurePdfJsWorker()
  }, [])

  // Load PDF Document
  useEffect(() => {
    if (!url) return

    let cancelled = false
    setIsLoading(true)
    setLoadError(null)
    setPdfDoc(null)
    setNumPages(0)
    pageContainerRefs.current.clear()
    renderedPagesRef.current.clear()

    const loadingTask = pdfjsLib.getDocument({
      url,
      withCredentials: false,
    })

    loadingTask.promise
      .then((doc) => {
        if (cancelled) return
        setPdfDoc(doc)
        setNumPages(doc.numPages)
        setIsLoading(false)
      })
      .catch((err: Error) => {
        if (cancelled) return
        console.warn('PDF.js failed to load document:', err.message)
        setLoadError(err.message || 'Không thể tải tệp PDF bằng trình đọc HTML5.')
        setIsLoading(false)
      })

    return () => {
      cancelled = true
      try {
        loadingTask.destroy()
      } catch {
        // ignore cancellation errors
      }
    }
  }, [url])

  // Apply search highlights and auto-scroll to matching text
  const applyHighlightsAndScroll = useCallback(
    (query?: string | null, snippet?: string | null) => {
      if (!viewerContainerRef.current) return
      const container = viewerContainerRef.current

      // 1. Clear previous highlights
      const spans = container.querySelectorAll<HTMLSpanElement>(
        '.textLayer span[role="presentation"], .textLayer span',
      )

      for (const span of spans) {
        if (span.hasAttribute('data-raw-text')) {
          span.textContent = span.getAttribute('data-raw-text') || ''
          span.removeAttribute('data-raw-text')
        }
      }

      const terms = extractSearchTerms(query, snippet)
      if (terms.length === 0) {
        setHighlightCount(0)
        setIsHighlighting(false)
        return
      }

      setIsHighlighting(true)
      const pattern = terms.map((t) => t.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')
      const regex = new RegExp(`(${pattern})`, 'gi')

      const matchingMarks: HTMLElement[] = []

      for (const span of spans) {
        const text = span.textContent || ''
        if (regex.test(text)) {
          span.setAttribute('data-raw-text', text)
          span.innerHTML = text.replace(
            regex,
            '<mark class="pdf-cv-highlight" data-matched-term="$1">$1</mark>',
          )
          const marks = span.querySelectorAll<HTMLElement>('.pdf-cv-highlight')
          matchingMarks.push(...Array.from(marks))
        }
      }

      setHighlightCount(matchingMarks.length)

      // Auto-scroll to the first match with smooth transition
      if (matchingMarks.length > 0) {
        const firstMatch = matchingMarks[0]
        firstMatch.classList.add('pdf-cv-highlight--focused')
        setTimeout(() => {
          firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 120)
      }
    },
    [],
  )

  // Render individual page
  const renderPage = useCallback(
    async (doc: PDFDocumentProxy, pageNumber: number, targetScale: number) => {
      const pageContainer = pageContainerRefs.current.get(pageNumber)
      if (!pageContainer) return

      try {
        const page: PDFPageProxy = await doc.getPage(pageNumber)
        const viewport = page.getViewport({ scale: targetScale })

        // Configure Page Container Dimensions
        pageContainer.style.width = `${Math.floor(viewport.width)}px`
        pageContainer.style.height = `${Math.floor(viewport.height)}px`
        pageContainer.innerHTML = ''

        // 1. Canvas for high-fidelity vector rendering
        const canvas = document.createElement('canvas')
        canvas.className = 'pdf-cv-canvas'
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        pageContainer.appendChild(canvas)

        const canvasContext = canvas.getContext('2d', { alpha: false })
        if (!canvasContext) return

        await page.render({
          canvasContext,
          viewport,
        }).promise

        // 2. Text Layer for selectable & searchable DOM text
        const textLayerDiv = document.createElement('div')
        textLayerDiv.className = 'textLayer pdf-cv-text-layer'
        textLayerDiv.style.width = `${Math.floor(viewport.width)}px`
        textLayerDiv.style.height = `${Math.floor(viewport.height)}px`
        textLayerDiv.style.setProperty('--scale-factor', `${targetScale}`)
        pageContainer.appendChild(textLayerDiv)

        const textContent = await page.getTextContent()
        const textLayer = new pdfjsLib.TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport,
        })

        await textLayer.render()
        renderedPagesRef.current.add(pageNumber)

        // If this is the last page, apply search highlights
        if (renderedPagesRef.current.size === doc.numPages) {
          applyHighlightsAndScroll(searchQuery, snippetText)
        }
      } catch (err) {
        console.warn(`Error rendering PDF page ${pageNumber}:`, err)
      }
    },
    [applyHighlightsAndScroll, searchQuery, snippetText],
  )

  // Render all pages when document or scale changes
  useEffect(() => {
    if (!pdfDoc) return

    renderedPagesRef.current.clear()
    for (let p = 1; p <= pdfDoc.numPages; p++) {
      void renderPage(pdfDoc, p, scale)
    }
  }, [pdfDoc, scale, renderPage])

  // When searchQuery or snippetText changes, apply highlights immediately
  useEffect(() => {
    if (!pdfDoc || renderedPagesRef.current.size < pdfDoc.numPages) return
    applyHighlightsAndScroll(searchQuery, snippetText)
  }, [searchQuery, snippetText, pdfDoc, applyHighlightsAndScroll])

  return (
    <div className={`pdf-cv-viewer ${className}`}>
      {/* Top Floating Toolbar */}
      <div className="pdf-cv-viewer__toolbar">
        <div className="pdf-cv-viewer__toolbar-left">
          <span className="pdf-cv-viewer__page-indicator" title={fileName}>
            {numPages > 0 ? `${numPages} trang` : 'Đang tải...'}
          </span>

          {searchQuery && isHighlighting && (
            <div className="pdf-cv-viewer__search-indicator">
              <Search size={12} className="pdf-cv-viewer__search-indicator-icon" />
              <span>
                Đang soi: <strong>"{searchQuery}"</strong> ({highlightCount} vị trí bôi vàng)
              </span>
              <button
                type="button"
                className="pdf-cv-viewer__clear-search-btn"
                onClick={() => {
                  onClearSearch?.()
                  applyHighlightsAndScroll(null, null)
                }}
                title="Bỏ bôi vàng"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="pdf-cv-viewer__toolbar-right">
          <button
            type="button"
            className="pdf-cv-viewer__tool-btn"
            onClick={() => setScale((s) => Math.max(0.8, Number((s - 0.15).toFixed(2))))}
            title="Thu nhỏ"
          >
            <ZoomOut size={14} />
          </button>
          <span className="pdf-cv-viewer__zoom-label">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            className="pdf-cv-viewer__tool-btn"
            onClick={() => setScale((s) => Math.min(2.0, Number((s + 0.15).toFixed(2))))}
            title="Phóng to"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            className="pdf-cv-viewer__tool-btn"
            onClick={() => setScale(1.15)}
            title="Kích thước vừa vặn"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* Viewport & Pages Container */}
      <div className="pdf-cv-viewer__viewport" ref={viewerContainerRef}>
        {isLoading && (
          <div className="pdf-cv-viewer__loading">
            <div className="pdf-cv-viewer__spinner" />
            <p>Đang tải tài liệu PDF với bộ phân tích HTML5...</p>
          </div>
        )}

        {!isLoading && loadError && (
          <div className="pdf-cv-viewer__error">
            <AlertCircle size={32} />
            <h4>Không thể tải trực tiếp bằng trình đọc HTML5</h4>
            <p>{loadError}</p>
            <div className="pdf-cv-viewer__error-actions">
              {onFallbackToIframe && (
                <button
                  type="button"
                  className="pdf-cv-viewer__action-btn pdf-cv-viewer__action-btn--primary"
                  onClick={onFallbackToIframe}
                >
                  <RefreshCw size={13} />
                  <span>Dùng bản xem trước dự phòng (Iframe)</span>
                </button>
              )}
              <a
                className="pdf-cv-viewer__action-btn"
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={13} />
                <span>Mở trong tab mới</span>
              </a>
            </div>
          </div>
        )}

        {!isLoading && !loadError && numPages > 0 && (
          <div className="pdf-cv-viewer__pages-list">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={pageNum}
                className="pdf-cv-page-wrapper"
                data-page-number={pageNum}
                ref={(el) => {
                  if (el) {
                    pageContainerRefs.current.set(pageNum, el)
                  } else {
                    pageContainerRefs.current.delete(pageNum)
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
