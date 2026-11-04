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
import { highlightPdfQuote, scopePdfSections } from './pdfTextSearch'
import { configurePdfJsWorker } from './pdfWorkerHelper'

export type PdfCvViewerProps = {
  url: string
  fileName?: string
  searchQuery?: string | null
  searchTerms?: string[] | null
  activeHighlightTerm?: string | null
  snippetText?: string | null
  searchRequestId?: number
  sourceSection?: string
  pageHint?: number | null
  occurrenceHint?: number | null
  className?: string
  onFallbackToIframe?: () => void
  onClearSearch?: () => void
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
  searchRequestId = 0,
  sourceSection,
  pageHint,
  occurrenceHint,
  className = '',
  onFallbackToIframe,
  onClearSearch,
}: PdfCvViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [scale, setScale] = useState<number>(1.05)
  const [zoomMode, setZoomMode] = useState<'fit-width' | 'fit-page' | 'custom'>('fit-width')
  const [pageBaseWidth, setPageBaseWidth] = useState<number>(612)
  const [pageBaseHeight, setPageBaseHeight] = useState<number>(792)
  const [renderedCount, setRenderedCount] = useState<number>(0)
  const [highlightCount, setHighlightCount] = useState<number>(0)
  const [isPartialMatch, setIsPartialMatch] = useState(false)
  const [isLexicalMatch, setIsLexicalMatch] = useState(false)
  const [sourceScopeFound, setSourceScopeFound] = useState(true)
  const [isHighlighting, setIsHighlighting] = useState<boolean>(false)

  const viewerContainerRef = useRef<HTMLDivElement | null>(null)
  const renderedPagesMap = useRef<Map<number, HTMLDivElement>>(new Map())
  const matchesRef = useRef<HTMLElement[][]>([])
  const [activeOccurrence, setActiveOccurrence] = useState(0)
  const navigatedRequest = useRef<string | null>(null)
  const zoomModeRef = useRef(zoomMode)
  zoomModeRef.current = zoomMode

  // Ensure worker is configured on mount
  useEffect(() => {
    configurePdfJsWorker()
  }, [])

  // 1. Fit Page: Co vừa cả chiều cao lẫn chiều rộng để hiển thị TRỌN VẸN 1 trang trong khung nhìn
  const calculateFitPageScale = useCallback((baseWidth: number, baseHeight: number) => {
    const container = viewerContainerRef.current
    if (!container) return 0.85
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight
    if (!containerWidth || !containerHeight) return 0.85

    // Safe padding: 36px ngang, 28px dọc
    const availableWidth = Math.max(240, containerWidth - 36)
    const availableHeight = Math.max(280, containerHeight - 28)

    const scaleW = availableWidth / baseWidth
    const scaleH = availableHeight / baseHeight

    // Min giữa scaleW và scaleH để 1 trang hiển thị trọn vẹn mà không bị cắt lề dưới
    const fitScale = Math.min(scaleW, scaleH)
    return Number(Math.min(1.4, Math.max(0.45, fitScale)).toFixed(2))
  }, [])

  // 2. Fit Width: Co vừa chiều rộng khung nhìn (chữ to rõ 12-14px, dễ đọc nhất)
  const calculateFitWidthScale = useCallback((baseWidth: number) => {
    const container = viewerContainerRef.current
    if (!container) return 1.05
    const containerWidth = container.clientWidth
    if (!containerWidth || containerWidth < 200) return 1.05
    const targetWidth = Math.max(260, containerWidth - 36)
    const computed = Number((targetWidth / baseWidth).toFixed(2))
    return Math.min(1.45, Math.max(0.25, computed))
  }, [])

  // Listen for container resize to adjust scale dynamically based on active zoom mode
  useEffect(() => {
    const container = viewerContainerRef.current
    if (!container || zoomMode === 'custom' || !pageBaseWidth || !pageBaseHeight) return

    let timeoutId: any
    const observer = new ResizeObserver(() => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        const newScale =
          zoomMode === 'fit-width'
            ? calculateFitWidthScale(pageBaseWidth)
            : calculateFitPageScale(pageBaseWidth, pageBaseHeight)

        setScale((prev) => {
          if (Math.abs(prev - newScale) >= 0.03) {
            return newScale
          }
          return prev
        })
      }, 150)
    })

    observer.observe(container)
    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [zoomMode, pageBaseWidth, pageBaseHeight, calculateFitPageScale, calculateFitWidthScale])

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

    const controller = new AbortController()
    let loadingTask: ReturnType<typeof pdfjsLib.getDocument> | undefined

    // Buffer the signed URL before starting the worker. PDF.js 4.10 can emit an
    // unhandled worker rejection when destroyed during an incomplete URL stream.
    // same-origin matches PDF.js withCredentials:false (no cross-origin cookies).
    const loadDocument = async () => {
      const response = await fetch(url, { signal: controller.signal, credentials: 'same-origin' })
      if (!response.ok) throw new Error(`Unable to load PDF (HTTP ${response.status})`)
      const data = new Uint8Array(await response.arrayBuffer())
      if (cancelled) return null
      loadingTask = pdfjsLib.getDocument({ data })
      return loadingTask.promise
    }

    loadDocument()
      .then(async (doc) => {
        if (!doc) return
        if (cancelled) return
        setPdfDoc(doc)
        setNumPages(doc.numPages)
        try {
          const page1 = await doc.getPage(1)
          if (cancelled) return
          const baseViewport = page1.getViewport({ scale: 1.0 })
          const baseWidth = baseViewport.width || 612
          const baseHeight = baseViewport.height || 792
          setPageBaseWidth(baseWidth)
          setPageBaseHeight(baseHeight)
          const initialScale =
            zoomMode === 'fit-width'
              ? calculateFitWidthScale(baseWidth)
              : calculateFitPageScale(baseWidth, baseHeight)
          setScale(initialScale)
        } catch {
          // fallback
        }
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
      controller.abort()
      // destroy() is asynchronous; preserve unexpected cleanup failures rather
      // than leaving its rejection unobserved or suppressing global errors.
      void loadingTask?.destroy().catch((error: unknown) => {
        console.warn('PDF.js document cleanup failed:', error)
      })
    }
  }, [url, calculateFitPageScale, calculateFitWidthScale])

  // Content keys, not array identities: parents may allocate searchTerms on every render.
  // Evidence is searched as a complete quote; skills are never a fallback for it.
  const evidenceQuote = (searchQuery || activeHighlightTerm || snippetText || '').trim()
  const evidenceKey = JSON.stringify([url, evidenceQuote, searchRequestId, pageHint, occurrenceHint, sourceSection])
  const [manualSearch, setManualSearch] = useState<{ evidenceKey: string; query: string; id: number } | null>(null)
  const manual = manualSearch?.evidenceKey === evidenceKey ? manualSearch : null
  const quote = manual?.query ?? evidenceQuote
  const requestKey = JSON.stringify([evidenceKey, manual?.id])
  const effectivePageHint = manual ? null : pageHint
  const effectiveOccurrenceHint = manual ? null : occurrenceHint
  const scrollToOccurrence = useCallback((index: number) => {
    const container = viewerContainerRef.current
    const marks = matchesRef.current[index]
    if (!container || !marks?.[0]) return
    container.querySelectorAll('.pdf-cv-highlight--focused').forEach(mark => mark.classList.remove('pdf-cv-highlight--focused'))
    marks.forEach(mark => mark.classList.add('pdf-cv-highlight--focused'))
    const target = marks[0].getBoundingClientRect()
    const bounds = container.getBoundingClientRect()
    // Only move the PDF viewport, never the drawer or document scroll ancestors.
    container.scrollTo({ top: container.scrollTop + target.top - bounds.top - container.clientHeight / 2, behavior: 'auto' })
    setActiveOccurrence(index)
  }, [])

  useEffect(() => {
    renderedPagesMap.current.clear()
    setRenderedCount(0)
  }, [scale, pdfDoc])

  const handlePageRendered = useCallback((pageNumber: number, container: HTMLDivElement) => {
    renderedPagesMap.current.set(pageNumber, container)
    setRenderedCount(renderedPagesMap.current.size)
  }, [])

  useEffect(() => {
    if (!pdfDoc || isLoading || !numPages || renderedCount !== numPages) return
    const layers = [...renderedPagesMap.current].sort(([a], [b]) => a - b)
      .flatMap(([, page]) => { const layer = page.querySelector<HTMLElement>('.textLayer'); return layer ? [layer] : [] })
    const scoped = scopePdfSections(layers, manual ? undefined : sourceSection)
    setSourceScopeFound(scoped)
    const matches: HTMLElement[][] = []
    for (const [number, page] of [...renderedPagesMap.current].sort(([a], [b]) => a - b)) {
      const layer = page.querySelector<HTMLElement>('.textLayer')
      if (!layer) continue
      const found = highlightPdfQuote(layer, scoped ? quote : '')
      // A supplied page is a constraint, not a suggestion to silently ignore.
      if (effectivePageHint == null || number === effectivePageHint) matches.push(...found)
      else layer.querySelectorAll('mark').forEach(mark => mark.replaceWith(...mark.childNodes))
    }
    // Prefer exact occurrences anywhere in the constrained document. Only if
    // none exist, locate substantial ordered parts of the quote on each page.
    let partial = false
    let lexical = false
    if (!matches.length && !manual && scoped) {
      for (const [number, page] of [...renderedPagesMap.current].sort(([a], [b]) => a - b)) {
        if (effectivePageHint != null && number !== effectivePageHint) continue
        const layer = page.querySelector<HTMLElement>('.textLayer')
        if (!layer) continue
        const found = highlightPdfQuote(layer, quote, true)
        if (layer.dataset.matchKind === 'partial') { matches.push(...found); partial = true }
        else if (layer.dataset.matchKind === 'lexical') { matches.push(...found); lexical = true }
      }
    }
    setIsPartialMatch(partial)
    setIsLexicalMatch(lexical)
    matchesRef.current = matches
    setHighlightCount(matches.length)
    setIsHighlighting(Boolean(quote))
    const index = effectiveOccurrenceHint != null ? effectiveOccurrenceHint - 1 : 0
    if (matches[index]?.length && navigatedRequest.current !== requestKey) {
      navigatedRequest.current = requestKey
      scrollToOccurrence(index)
    } else if (!matches[index]?.length) {
      navigatedRequest.current = requestKey
    } else {
      // Restore focus styling after zoom without pulling the reader's scroll.
      const restoredIndex = Math.min(activeOccurrence, matches.length - 1)
      matches[restoredIndex]?.forEach(mark => mark.classList.add('pdf-cv-highlight--focused'))
    }
  }, [pdfDoc, isLoading, quote, requestKey, effectivePageHint, effectiveOccurrenceHint, sourceSection, manual, renderedCount, numPages, scale, activeOccurrence, scrollToOccurrence])

  // Retain legacy skill props without expanding a quote into aliases/common words.
  void searchTerms


  return (
    <div className={`pdf-cv-viewer ${className}`}>
      {/* Top Floating Toolbar */}
      <div className="pdf-cv-viewer__toolbar">
        <div className="pdf-cv-viewer__toolbar-left">
          <span className="pdf-cv-viewer__page-indicator" title={fileName}>
            {numPages > 0 ? `${numPages} trang` : 'Đang tải...'}
          </span>

          {quote && isHighlighting && (
            <div className="pdf-cv-viewer__search-indicator">
              <Search size={12} className="pdf-cv-viewer__search-indicator-icon" />
              <span>
                {manual ? 'Tìm thủ công (không xác nhận bằng chứng)' : isLexicalMatch ? 'Vùng có từ/cụm trùng' : isPartialMatch ? 'Khớp một phần đoạn trích' : 'Tìm nguyên văn'}: <strong title={quote}>"{quote.length > 65 ? `${quote.slice(0, 65)}…` : quote}"</strong> ({highlightCount} {isLexicalMatch ? 'vùng gợi ý đối chiếu' : isPartialMatch ? 'vị trí khớp một phần' : 'đoạn trùng nguyên văn'})
              </span>
              <button
                type="button"
                className="pdf-cv-viewer__clear-search-btn"
                onClick={() => {
                  onClearSearch?.()
                  setManualSearch(null)
                  viewerContainerRef.current?.querySelectorAll('.pdf-cv-context-region').forEach(region => region.remove())
                  matchesRef.current.flat().forEach(mark => mark.replaceWith(...mark.childNodes))
                  setIsHighlighting(false)
                }}
                title="Bỏ bôi vàng"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="pdf-cv-viewer__toolbar-right">
          <div className="pdf-cv-viewer__zoom-controls">
            <button
              type="button"
              className="pdf-cv-viewer__tool-btn"
              onClick={() => {
                setZoomMode('custom')
                setScale((s) => Math.max(0.45, Number((s - 0.1).toFixed(2))))
              }}
              title="Thu nhỏ"
            >
              <ZoomOut size={13} />
            </button>
            <span className="pdf-cv-viewer__zoom-label">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              className="pdf-cv-viewer__tool-btn"
              onClick={() => {
                setZoomMode('custom')
                setScale((s) => Math.min(2.0, Number((s + 0.1).toFixed(2))))
              }}
              title="Phóng to"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          <div className="pdf-cv-viewer__segmented">
            <button
              type="button"
              className={`pdf-cv-viewer__segmented-btn ${zoomMode === 'fit-width' ? 'is-active' : ''}`}
              onClick={() => {
                setZoomMode('fit-width')
                const fitW = calculateFitWidthScale(pageBaseWidth)
                setScale(fitW)
              }}
              title="Vừa chiều ngang màn hình — Chữ to rõ, dễ đọc nhất"
            >
              <Maximize2 size={12} />
              <span>Vừa chiều ngang (Đọc rõ)</span>
            </button>
            <button
              type="button"
              className={`pdf-cv-viewer__segmented-btn ${zoomMode === 'fit-page' ? 'is-active' : ''}`}
              onClick={() => {
                setZoomMode('fit-page')
                const fit = calculateFitPageScale(pageBaseWidth, pageBaseHeight)
                setScale(fit)
              }}
              title="Hiển thị bao quát trọn vẹn 1 trang trong khung nhìn"
            >
              <span>Toàn trang</span>
            </button>
          </div>
        </div>
      </div>

      {isHighlighting && (
        <div className="pdf-cv-viewer__search-results" role="status">
          {isLexicalMatch && <span>Từ trùng tô đậm; nền nhạt là ngữ cảnh trong PDF khi xác định được khối. Chỉ hỗ trợ định vị, không xác nhận nội dung tương đương hay đáp ứng.</span>}
          {isPartialMatch && !isLexicalMatch && <span>Chỉ tô các cụm có trong PDF; nội dung khác đoạn trích. HR cần đọc đối chiếu, chưa xác minh đáp ứng.</span>}
          {highlightCount === 0 || (effectiveOccurrenceHint != null && effectiveOccurrenceHint > highlightCount) ? (
            <span>{!sourceScopeFound ? 'Chưa nhận diện được mục nguồn trên PDF. Không tô sang mục khác; hãy đối chiếu nguồn hoặc tìm thủ công trên toàn CV.' : sourceSection && !manual ? 'Chưa tìm thấy đoạn trong mục nguồn đã chọn. Không mở rộng sang mục khác; có thể tìm thủ công trên toàn CV.' : 'Không tìm thấy nguyên văn. Chưa định vị được đoạn trích trên PDF; hãy đối chiếu nguồn hoặc tìm thủ công.'}</span>
          ) : <>
            <button type="button" onClick={() => scrollToOccurrence(Math.min(activeOccurrence, highlightCount - 1))}>Quay lại bằng chứng</button>
            {highlightCount > 1 && <>
              <button type="button" onClick={() => scrollToOccurrence((activeOccurrence + highlightCount - 1) % highlightCount)}>Vị trí trước</button>
              <span>{activeOccurrence + 1} / {highlightCount} vị trí — chọn để đối chiếu</span>
              <button type="button" onClick={() => scrollToOccurrence((activeOccurrence + 1) % highlightCount)}>Vị trí sau</button>
            </>}
          </>}
          <details className="pdf-cv-viewer__manual-search">
            <summary>Tìm thủ công trong PDF</summary>
          <form onSubmit={event => {
            event.preventDefault()
            const input = event.currentTarget.elements.namedItem('query') as HTMLInputElement
            const manual = input.value.trim()
            if (!manual) return
            setManualSearch(previous => ({ evidenceKey, query: manual, id: (previous?.id ?? 0) + 1 }))
          }}>
            <input name="query" aria-label="Tìm thủ công trong PDF" placeholder="Nhập nguyên văn để tìm thủ công" />
            <button type="submit">Tìm thủ công</button>
          </form>
          </details>
        </div>
      )}
      {/* Viewport & Pages Container */}
      <div
        className={`pdf-cv-viewer__viewport ${zoomMode === 'fit-page' ? 'is-fit-page' : ''} ${zoomMode === 'custom' ? 'has-manual-zoom' : ''}`}
        ref={viewerContainerRef}
      >
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
