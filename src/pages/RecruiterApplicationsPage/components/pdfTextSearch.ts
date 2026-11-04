// Map normalized characters back to original UTF-16 offsets so a quote can span
// PDF.js text items without altering the text layer's layout or trusting HTML.
export function normalizePdfText(text: string, compact = false) {
  let value = ''
  const offsets: number[] = []
  const ends: number[] = []
  for (let i = 0; i < text.length;) {
    const start = i
    let point = String.fromCodePoint(text.codePointAt(i)!)
    i += point.length
    while (i < text.length && /\p{M}/u.test(text[i])) point += text[i++]
    if (point === '­') continue
    // A hyphen at a line break is a layout artifact, not a word boundary.
    if (/[-‐‑]/u.test(point) && /^\s*\n\s*/u.test(text.slice(i))) {
      i += text.slice(i).match(/^\s*\n\s*/u)![0].length
      continue
    }
    const normalized = point.normalize('NFKC').toLowerCase()
      .replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[‐‑–—]/g, '-')
    for (const char of normalized) {
      if (compact && /[\s\p{Pd}]/u.test(char)) continue
      if (/\s/u.test(char)) {
        if (!value || value.endsWith(' ')) continue
        value += ' '
      } else {
        value += char
      }
      for (let unit = 0; unit < char.length; unit++) {
        offsets.push(start)
        ends.push(i)
      }
    }
  }
  return { value, offsets, ends }
}

export type PdfTextMatch = { start: number; end: number }
export function findPdfTextMatches(text: string, quote: string, compact = false): PdfTextMatch[] {
  const haystack = normalizePdfText(text, compact)
  const needle = normalizePdfText(quote, compact).value.trim()
  if (!needle) return []
  const matches: PdfTextMatch[] = []
  let position = 0
  while ((position = haystack.value.indexOf(needle, position)) !== -1) {
    const before = haystack.value[position - 1] ?? ''
    const after = haystack.value[position + needle.length] ?? ''
    if (!( /[\p{L}\p{N}]/u.test(needle[0]) && /[\p{L}\p{N}]/u.test(before)) &&
        !( /[\p{L}\p{N}]/u.test(needle.at(-1)!) && /[\p{L}\p{N}]/u.test(after))) {
      matches.push({ start: haystack.offsets[position], end: haystack.ends[position + needle.length - 1] })
    }
    position += needle.length
  }
  // PDF producers may omit spaces, insert them inside words, or keep a
  // line-wrap hyphen. Only retry a substantial COMPLETE quote, never keywords.
  // All letters, numbers and other punctuation must still match in order.
  if (!matches.length && !compact && needle.replace(/\s/g, '').length >= 40) {
    return findPdfTextMatches(text, quote, true)
  }
  return matches
}

// Partial location is a reading aid, not semantic support verification. Require
// ordered multi-word runs covering most of the quote in one bounded PDF region.
export function findPartialPdfQuote(text: string, quote: string): PdfTextMatch[] {
  const tokenize = (value: string) => [...normalizePdfText(value).value.matchAll(/[\p{L}\p{N}]+/gu)]
  const normalized = normalizePdfText(text)
  const words = tokenize(text)
  const query = tokenize(quote)
  if (query.length < 10 || words.length > 20000 || query.length > 1000) return []
  let best: PdfTextMatch[] = []
  let bestCoverage = 0
  for (let anchor = 0; anchor < words.length; anchor++) {
    if (words[anchor][0] !== query[0][0]) continue
    const runs: Array<{ start: number; end: number; count: number }> = []
    let cursor = anchor
    let matched = 0
    for (let q = 0; q < query.length;) {
      let found = -1
      let length = 0
      const limit = Math.min(words.length, anchor + query.length * 2 + 12, cursor + 25)
      for (let w = cursor; w < limit; w++) {
        let count = 0
        while (q + count < query.length && w + count < limit && words[w + count][0] === query[q + count][0]) count++
        if (count > length) { found = w; length = count }
      }
      if (length >= 4 && found >= 0) {
        runs.push({ start: found, end: found + length - 1, count: length })
        matched += length
        cursor = found + length
        q += length
      } else q++
    }
    const coverage = matched / query.length
    if (coverage < 0.7 || matched < 10 || coverage <= bestCoverage) continue
    bestCoverage = coverage
    best = runs.map(run => ({
      start: normalized.offsets[words[run.start].index!],
      end: normalized.ends[words[run.end].index! + words[run.end][0].length - 1],
    }))
  }
  return best
}

const locationStopwords = new Set(('a an the and or of to in on at for from with by as is are was were be been this that these those it its i we my our you your their have has had can will using used work working experience knowledge skills skill system systems design development developed built làm và của với các những một trong cho từ có được đã là về tại kinh nghiệm kỹ năng sử dụng phát triển thiết kế').split(/\s+/))

// Query-derived lexical hints, not a technology dictionary or a support score.
// A bounded window must contain several distinct informative terms; isolated
// common words and matches scattered across sections cannot form a region.
export function findPdfLexicalRegions(text: string, quote: string): PdfTextMatch[][] {
  const normalized = normalizePdfText(text)
  const tokens = [...normalized.value.matchAll(/[\p{L}\p{N}]+(?:[.+#-][\p{L}\p{N}]+)*/gu)]
  const queryTokens = normalizePdfText(quote).value.match(/[\p{L}\p{N}]+(?:[.+#-][\p{L}\p{N}]+)*/gu) ?? []
  const terms = new Set(queryTokens.filter(token => token.length >= 3 && !locationStopwords.has(token)))
  if (terms.size < 3 || tokens.length > 20000) return []
  const hits = tokens.flatMap((token, index) => terms.has(token[0]) ? [{ token, index }] : [])
  const regions: PdfTextMatch[][] = []
  for (let i = 0; i < hits.length;) {
    let end = i + 1
    while (end < hits.length && hits[end].index - hits[i].index <= 45 && hits[end].index - hits[end - 1].index <= 14) end++
    const group = hits.slice(i, end)
    const unique = new Set(group.map(hit => hit.token[0]))
    const width = group.at(-1)!.index - group[0].index + 1
    if (unique.size >= 3 && [...unique].filter(term => term.length >= 5).length >= 2 && group.length / width >= 0.18) {
      const start = normalized.offsets[group[0].token.index!]
      const last = group.at(-1)!.token
      const finish = normalized.ends[last.index! + last[0].length - 1]
      if (!text.slice(start, finish).includes('¤')) regions.push(group.map(({ token }) => ({ start: normalized.offsets[token.index!], end: normalized.ends[token.index! + token[0].length - 1] })))
      i = end
    } else i++
  }
  return regions
}

const sectionHeadings: Record<string, RegExp> = {
  project: /^(?:(?:personal|selected|academic|key|professional|research|relevant)\s+)?projects?(?: experience| portfolio)?$|^(?:các )?dự án(?: cá nhân| tiêu biểu| thực tế| nổi bật)?$|^プロジェクト(?:経験|実績)?$/iu,
  experience: /^(?:(?:work|professional|employment|relevant)\s+)?experience$|^employment history$|^kinh nghiệm(?: làm việc)?$/iu,
  skill: /^(?:(?:technical|core|professional)\s+)?skills?$|^technologies$|^kỹ năng(?: chuyên môn)?$/iu,
  education: /^education(?: background)?$|^academic background$|^học vấn$/iu,
  certification: /^certifications?$|^certificates?$|^chứng chỉ$/iu,
  profile: /^objective$|^summary$|^profile$|^about me$|^professional summary$|^giới thiệu(?: bản thân)?$|^mục tiêu(?: nghề nghiệp)?$/iu,
  other: /^languages?$|^interests?$|^references?$|^awards?$|^publications?$|^activities$|^ngoại ngữ$|^sở thích$/iu,
}

export function canonicalPdfSection(source?: string): string | null {
  const value = source?.toLowerCase().trim().replace(/s$/, '')
  const aliases: Record<string, string> = { summary: 'profile', headline: 'profile', objective: 'profile', work: 'experience', employment: 'experience' }
  const canonical = value ? aliases[value] ?? value : null
  return canonical && Object.hasOwn(sectionHeadings, canonical) ? canonical : null
}

// Heading taxonomy identifies document structure, not evidence keywords. Track
// section continuation across pages; an unrecognized requested section is never
// silently treated as a successful source restriction.
export function scopePdfSections(layers: HTMLElement[], source?: string): boolean {
  const requested = canonicalPdfSection(source)
  let current: string | null = null
  let found = false
  for (const layer of layers) {
    const spans = [...layer.querySelectorAll<HTMLSpanElement>('span')].filter(span => !span.querySelector('span'))
    for (const span of spans) {
      const text = (span.getAttribute('data-raw-text') ?? span.textContent ?? '').trim().replace(/[:：]$/, '')
      const heading = Object.entries(sectionHeadings).find(([, pattern]) => pattern.test(text))?.[0]
      if (heading) current = heading
      span.dataset.pdfSourceAllowed = !requested || (!heading && current === requested) ? 'true' : 'false'
      if (requested && current === requested) found = true
    }
  }
  return !source || Boolean(requested && found)
}

export function highlightPdfQuote(layer: HTMLElement, quote: string, allowPartial = false): HTMLElement[][] {
  layer.parentElement?.querySelectorAll('.pdf-cv-context-region').forEach(region => region.remove())
  const spans = [...layer.querySelectorAll<HTMLSpanElement>('span')].filter(span => !span.querySelector('span'))
  let text = ''
  const items = spans.map(span => {
    const raw = span.getAttribute('data-raw-text') ?? span.textContent ?? ''
    span.textContent = raw
    span.removeAttribute('data-raw-text')
    const start = text.length
    // Preserve DOM text outside the source, but keep it out of every matching tier.
    text += span.dataset.pdfSourceAllowed === 'false' ? '¤'.repeat(raw.length) : raw
    const next = span.nextElementSibling
    // TextLayer places a BR after hasEOL items. Adjacent spans otherwise share
    // a word unless their PDF geometry indicates a real gap.
    const rect = span.getBoundingClientRect()
    const nextRect = next?.getBoundingClientRect()
    if (next?.tagName === 'BR' || (nextRect && Math.abs(nextRect.top - rect.top) > rect.height / 2)) text += '\n'
    else if (nextRect && nextRect.left - rect.right > Math.max(1, rect.height * 0.08)) text += ' '
    return { span, raw, start, end: start + raw.length }
  })
  const exact = findPdfTextMatches(text, quote)
  const partial = !exact.length && allowPartial ? findPartialPdfQuote(text, quote) : []
  const lexical = !exact.length && !partial.length && allowPartial ? findPdfLexicalRegions(text, quote) : []
  layer.dataset.matchKind = exact.length ? 'exact' : partial.length ? 'partial' : lexical.length ? 'lexical' : 'none'
  const matches = (exact.length ? exact : partial.length ? partial : lexical.flat())
    .filter(match => !text.slice(match.start, match.end).includes('¤'))
  const groups = matches.map(match => {
    const marks: HTMLElement[] = []
    for (const item of items) {
      const start = Math.max(match.start, item.start) - item.start
      const end = Math.min(match.end, item.end) - item.start
      if (start >= end) continue
      // Each item may contain multiple occurrences; split its current text nodes
      // using original offsets, never innerHTML (PDF text is untrusted).
      item.span.setAttribute('data-raw-text', item.raw)
      const walker = document.createTreeWalker(item.span, NodeFilter.SHOW_TEXT)
      let offset = 0
      while (walker.nextNode()) {
        const node = walker.currentNode as Text
        const length = node.length
        if (node.parentElement?.tagName !== 'MARK' && offset <= start && offset + length >= end) {
          const range = document.createRange()
          range.setStart(node, start - offset)
          range.setEnd(node, end - offset)
          const mark = document.createElement('mark')
          mark.className = 'pdf-cv-highlight'
          range.surroundContents(mark)
          marks.push(mark)
          break
        }
        offset += length
      }
    }
    return marks
  }).filter(marks => marks.length > 0)
  if (lexical.length) {
    let offset = 0
    return lexical.map(region => {
      const marks = groups.slice(offset, offset + region.length).flat()
      offset += region.length
      const matchedItems = items.filter(item => region.some(match => match.start < item.end && match.end > item.start))
      // Expand only within the same visual paragraph: nearby lines, overlapping
      // column and no new bullet. Never shade everything between distant hits.
      const blocks: typeof items[] = []
      for (const item of items) {
        if (!item.raw.trim()) continue
        if (item.span.dataset.pdfSourceAllowed === 'false') { blocks.push([]); continue }
        const previous = blocks.at(-1)?.at(-1)
        const rect = item.span.getBoundingClientRect()
        const prev = previous?.span.getBoundingClientRect()
        const startsBullet = /^\s*[•●▪◦‣]|^\s*[-–]\s/u.test(item.raw)
        if (!prev || startsBullet || rect.top - prev.bottom > Math.max(rect.height, prev.height) * 0.8 || rect.top < prev.top - prev.height || rect.left > prev.right + 40 || rect.right < prev.left - 40) blocks.push([item])
        else blocks.at(-1)!.push(item)
      }
      const parent = layer.parentElement
      if (parent) {
        const base = parent.getBoundingClientRect()
        for (const block of blocks) {
          const hits = block.filter(item => matchedItems.includes(item))
          const terms = new Set(hits.flatMap(item => region.filter(match => match.start < item.end && match.end > item.start).map(match => text.slice(match.start, match.end).toLowerCase())))
          if (terms.size < 3) continue
          for (const item of block) {
            const rect = item.span.getBoundingClientRect()
            const overlay = document.createElement('div')
            overlay.className = 'pdf-cv-context-region'
            overlay.setAttribute('aria-hidden', 'true')
            Object.assign(overlay.style, { left: `${rect.left - base.left}px`, top: `${rect.top - base.top}px`, width: `${rect.width}px`, height: `${rect.height}px` })
            parent.append(overlay)
          }
        }
      }
      return marks
    }).filter(group => group.length > 0)
  }
  return partial.length ? [groups.flat()].filter(group => group.length > 0) : groups
}
