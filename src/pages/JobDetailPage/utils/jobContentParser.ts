export type JobContentBlock =
  | { type: 'lead'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; text: string }

function decodeEntities(text: string): string {
  const named: Record<string, string> = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
  return text.replace(/&(#x[\da-f]+|#\d+|nbsp|amp|lt|gt|quot|apos);/gi, (entity, code: string) => {
    if (!code.startsWith('#')) return named[code.toLowerCase()] ?? entity
    const point = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10)
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : entity
  })
}

// Respect author-supplied paragraphs and list markers. Punctuation inside a
// sentence is content, never a signal to invent additional responsibilities.
export function parseJobContent(body: string | null | undefined): JobContentBlock[] {
  if (!body?.trim()) return []
  const blocks: JobContentBlock[] = []
  const append = (type: 'paragraph' | 'subheading' | 'lead' | 'list', value: string) => {
    const text = value.trim()
    if (!text) return
    const previous = blocks.at(-1)
    if (type === 'list') {
      if (previous?.type === 'list') previous.items.push(text)
      else blocks.push({ type: 'list', items: [text] })
    } else blocks.push({ type, text })
  }

  if (/<\/?(?:p|div|ul|ol|li|br|h[1-6])\b[^>]*>/i.test(body)) {
    let buffer = ''
    let inListItem = false
    let inHeading = false
    const flush = () => {
      append(inListItem ? 'list' : inHeading ? 'subheading' : 'paragraph', decodeEntities(buffer))
      buffer = ''
    }
    // Render only text through React, not HTML. Ignore non-content elements.
    const content = body.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    for (const token of content.split(/(<[^>]+>)/g)) {
      if (!token.startsWith('<')) { buffer += token; continue }
      const tag = token.match(/^<\s*(\/?)\s*([a-z][\w-]*)\b/i)
      if (!tag) { buffer += token; continue }
      const closing = Boolean(tag[1])
      const name = tag[2].toLowerCase()
      if (name === 'li') {
        flush()
        inListItem = !closing
      } else if (/^h[1-6]$/.test(name)) {
        flush()
        inHeading = !closing
      } else if (name === 'br') {
        if (inListItem) buffer += '\n'
        else flush()
      } else if (['p', 'div', 'ul', 'ol'].includes(name)) {
        if (inListItem) {
          if (closing && buffer && !buffer.endsWith('\n')) buffer += '\n'
        } else flush()
      }
    }
    flush()
    return blocks
  }

  for (const line of body.split(/\r?\n/)) {
    const text = line.trim()
    if (!text) continue
    const bullet = text.match(/^(?:[•*+⁃–—-]\s+|\d+[.)]\s+)(.+)$/u)
    if (bullet) append('list', bullet[1])
    else {
      const isHeading = text.length <= 100 && !/[,;.!?]/u.test(text) && /\p{L}/u.test(text) && text === text.toLocaleUpperCase() && text !== text.toLocaleLowerCase()
      append(isHeading ? 'subheading' : text.endsWith(':') && text.length <= 120 ? 'lead' : 'paragraph', text)
    }
  }
  return blocks
}
