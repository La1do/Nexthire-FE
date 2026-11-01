import { useCallback, useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
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
  searchTerms?: string[] | null
  activeHighlightTerm?: string | null
  snippetText?: string | null
  className?: string
  onFallbackToIframe?: () => void
  onClearSearch?: () => void
}

function getAliasesForTerm(term: string): string[] {
  const clean = term.trim().replace(/[.,;:!?()"']/g, '')
  if (clean.length < 2) return []
  const lower = clean.toLowerCase()
  const aliases: string[] = [clean]

  if (lower === 'k8s') aliases.push('kubernetes')
  if (lower === 'kubernetes') aliases.push('k8s')
  if (lower === 'postgres' || lower === 'postgresql') {
    aliases.push('postgres', 'postgresql', 'psql')
  }
  if (lower === 'ts' || lower === 'typescript') {
    aliases.push('typescript', 'ts')
  }
  if (lower === 'js' || lower === 'javascript') {
    aliases.push('javascript', 'js')
  }
  if (lower === 'react' || lower === 'reactjs') {
    aliases.push('reactjs', 'react', 'react 18', 'react 19')
  }
  if (lower === 'golang' || lower === 'go') {
    aliases.push('golang', 'go')
  }
  if (lower === 'py' || lower === 'python') {
    aliases.push('python', 'py')
  }
  if (lower === 'rest api' || lower === 'rest' || lower === 'crud') {
    aliases.push('rest api', 'rest apis', 'restful', 'crud apis', 'crud api', 'crud')
  }
  if (lower === 'node' || lower === 'node.js' || lower === 'nodejs') {
    aliases.push('node.js', 'nodejs', 'node')
  }
  if (lower === 'socket.io' || lower === 'websocket') {
    aliases.push('socket.io', 'websocket')
  }
  if (lower === 'docker' || lower === 'docker compose') {
    aliases.push('docker', 'docker compose')
  }
  if (lower === 'ci/cd' || lower === 'gitlab ci' || lower === 'github actions') {
    aliases.push('gitlab ci', 'github actions', 'ci/cd', 'ci')
  }

  // Multi-word breakdown
  const words = clean.split(/\s+/).filter((w) => w.length >= 3)
  aliases.push(...words)

  return aliases
}

function extractAllTerms(
  query?: string | null,
  termsList?: string[] | null,
  snippet?: string | null,
): string[] {
  const terms: string[] = []

  // 1. If specific query
  if (query?.trim()) {
    terms.push(...getAliasesForTerm(query))
  } else if (termsList && termsList.length > 0) {
    // 2. If all terms (e.g. matched skills on CV)
    for (const item of termsList) {
      if (item?.trim()) {
        terms.push(...getAliasesForTerm(item))
      }
    }
  }

  // 3. From relevant span snippet
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

type PdfPageItemProps = {
  doc: PDFDocumentProxy
  pageNumber: number
  scale: number
  onPageRendered: (pageNumber: number, container: HTMLDivElement) => void
}

function PdfPageItem({ doc, pageNumber, scale, onPageRendered }: PdfPageItemProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    let currentRenderTask: any = null

    async function render() {
      try {
        const page = await doc.getPage(pageNumber)
        if (cancelled) return

        const targetContainer = containerRef.current
        if (!targetContainer) return

        const viewport = page.getViewport({ scale })
        targetContainer.style.width = `${Math.floor(viewport.width)}px`
        targetContainer.style.height = `${Math.floor(viewport.height)}px`
        targetContainer.innerHTML = ''

        // 1. Canvas vector rendering
        const canvas = document.createElement('canvas')
        canvas.className = 'pdf-cv-canvas'
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        targetContainer.appendChild(canvas)

        const canvasContext = canvas.getContext('2d', { alpha: false })
        if (!canvasContext) return

        const renderTask = page.render({ canvasContext, viewport })
        currentRenderTask = renderTask as any
        await renderTask.promise
        if (cancelled) return

        // 2. Selectable & Searchable DOM Text Layer
        const textLayerDiv = document.createElement('div')
        textLayerDiv.className = 'textLayer pdf-cv-text-layer'
        textLayerDiv.style.width = `${Math.floor(viewport.width)}px`
        textLayerDiv.style.height = `${Math.floor(viewport.height)}px`
        textLayerDiv.style.setProperty('--scale-factor', `${scale}`)
        targetContainer.appendChild(textLayerDiv)

        const textContent = await page.getTextContent()
        if (cancelled) return

        const textLayer = new pdfjsLib.TextLayer({
          textContentSource: textContent,
          container: textLayerDiv,
          viewport,
        })
        await textLayer.render()
        if (cancelled) return

        onPageRendered(pageNumber, targetContainer)
      } catch (err: unknown) {
        if ((err as Error)?.name === 'RenderingCancelledException') {
          return
        }
        console.warn(`Failed to render page ${pageNumber}:`, err)
      }
    }

    void render()

    return () => {
      cancelled = true
      if (currentRenderTask && typeof (currentRenderTask as any).cancel === 'function') {
        try {
          ;(currentRenderTask as any).cancel()
        } catch {
          // ignore
        }
      }
    }
  }, [doc, pageNumber, scale, onPageRendered])

  return (
    <div
      ref={containerRef}
      className="pdf-cv-page-wrapper"
      data-page-number={pageNumber}
    />
  )
}

export function PdfCvViewer({
  url,
  fileName = 'CV Document',
  searchQuery,
  searchTerms,
  activeHighlightTerm,
  snippetText,
  className = '',
  onFallbackToIframe,
  onClearSearch,
}: PdfCvViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [scale, setScale] = useState<number>(1.2)
  const [renderedCount, setRenderedCount] = useState<number>(0)
  const [highlightCount, setHighlightCount] = useState<number>(0)
  const [isHighlighting, setIsHighlighting] = useState<boolean>(false)

  const viewerContainerRef = useRef<HTMLDivElement | null>(null)
  const renderedPagesMap = useRef<Map<number, HTMLDivElement>>(new Map())

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
    setRenderedCount(0)
    renderedPagesMap.current.clear()

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
        // ignore cancellation
      }
    }
  }, [url])

  // Apply search highlights and auto-scroll to matching text
  const applyHighlightsAndScroll = useCallback(
    (
      query?: string | null,
      termsList?: string[] | null,
      snippet?: string | null,
      focusTerm?: string | null,
    ) => {
      if (!viewerContainerRef.current) return
      const container = viewerContainerRef.current

      // 1. Clear previous highlights
      const spans = container.querySelectorAll<HTMLSpanElement>('.textLayer span')
      for (const span of spans) {
        const raw = span.getAttribute('data-raw-text')
        if (raw !== null) {
          span.textContent = raw
          span.removeAttribute('data-raw-text')
        }
      }

      const terms = extractAllTerms(query, termsList, snippet)
      if (terms.length === 0) {
        setHighlightCount(0)
        setIsHighlighting(false)
        return
      }

      setIsHighlighting(true)
      const pattern = terms.map((t) => t.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')
      const regex = new RegExp(`(${pattern})`, 'gi')

      const matchingMarks: HTMLElement[] = []
      let focusedMatch: HTMLElement | null = null
      const focusTarget = (focusTerm || query || '').toLowerCase().trim()

      for (const span of spans) {
        const text = span.textContent || ''
        if (regex.test(text)) {
          span.setAttribute('data-raw-text', text)
          span.innerHTML = text.replace(regex, (match) => {
            const isFocused = focusTarget && match.toLowerCase().includes(focusTarget)
            return `<mark class="pdf-cv-highlight ${isFocused ? 'pdf-cv-highlight--focused' : ''}" data-matched-term="${match}">${match}</mark>`
          })
          const marks = span.querySelectorAll<HTMLElement>('.pdf-cv-highlight')
          for (const m of marks) {
            matchingMarks.push(m)
            if (!focusedMatch && focusTarget && m.textContent?.toLowerCase().includes(focusTarget)) {
              focusedMatch = m
            }
          }
        }
      }

      setHighlightCount(matchingMarks.length)

      // Auto-scroll to the focused match or the first match
      const targetToScroll = focusedMatch || matchingMarks[0]
      if (targetToScroll && (query || focusTerm)) {
        targetToScroll.classList.add('pdf-cv-highlight--focused')
        setTimeout(() => {
          targetToScroll.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 120)
      }
    },
    [],
  )

  const handlePageRendered = useCallback(
    (pageNumber: number, container: HTMLDivElement) => {
      renderedPagesMap.current.set(pageNumber, container)
      setRenderedCount((prev) => {
        const next = prev + 1
        return next
      })
    },
    [],
  )

  // Re-apply highlights whenever searchQuery, searchTerms, snippetText or activeHighlightTerm changes
  useEffect(() => {
    if (renderedCount > 0 && renderedCount === numPages) {
      applyHighlightsAndScroll(searchQuery, searchTerms, snippetText, activeHighlightTerm)
    }
  }, [searchQuery, searchTerms, snippetText, activeHighlightTerm, renderedCount, numPages, applyHighlightsAndScroll])

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
            onClick={() => {
              setRenderedCount(0)
              setScale((s) => Math.max(0.8, Number((s - 0.15).toFixed(2))))
            }}
            title="Thu nhỏ"
          >
            <ZoomOut size={14} />
          </button>
          <span className="pdf-cv-viewer__zoom-label">{Math.round(scale * 100)}%</span>
          <button
            type="button"
            className="pdf-cv-viewer__tool-btn"
            onClick={() => {
              setRenderedCount(0)
              setScale((s) => Math.min(2.0, Number((s + 0.15).toFixed(2))))
            }}
            title="Phóng to"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            className="pdf-cv-viewer__tool-btn"
            onClick={() => {
              setRenderedCount(0)
              setScale(1.15)
            }}
            title="Kích thước chuẩn"
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

        {!isLoading && !loadError && pdfDoc && numPages > 0 && (
          <div className="pdf-cv-viewer__pages-list">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
              <PdfPageItem
                key={`${pdfDoc.fingerprints?.[0] || 'doc'}-page-${pageNum}-${scale}`}
                doc={pdfDoc}
                pageNumber={pageNum}
                scale={scale}
                onPageRendered={handlePageRendered}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
