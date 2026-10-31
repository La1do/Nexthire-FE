export type JobContentBlock =
  | { type: 'lead'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'paragraph'; text: string }

/**
 * Splits a sentence containing a list separated by commas, semicolons,
 * or conjunctions (e.g. "A, B, and C.") into individual items.
 */
function splitCommaList(text: string): string[] {
  let str = text.trim()
  if (str.endsWith('.')) {
    str = str.slice(0, -1).trim()
  }

  // Check for conjunctions like ", and ", ", & ", ", và ", ", cùng " or at least 2 commas
  const hasConjunction = /,\s*(?:and|&|và|cùng)\s+/i.test(str)
  const commas = str.match(/,\s+/g) || []

  if (hasConjunction || commas.length >= 2) {
    // Replace conjunctions and commas with a delimiter
    const normalized = str
      .replace(/,\s*(?:and|&|và|cùng)\s+/gi, '|||')
      .replace(/,\s+/g, '|||')

    const parts = normalized
      .split('|||')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    if (parts.length > 1) {
      return parts.map((part) => {
        // Capitalize the first letter if not already
        return part.charAt(0).toUpperCase() + part.slice(1)
      })
    }
  }

  // Check for semicolons ";"
  if (str.includes(';')) {
    const parts = str
      .split(/;\s*/)
      .map((s) => s.trim())
      .filter(Boolean)

    if (parts.length > 1) {
      return parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    }
  }

  return [text]
}

/**
 * Parses free-form job description, requirements, or benefits text into structured blocks
 * supporting lead paragraphs, subheadings, and bullet point lists.
 * Ensures every duty, qualification, and perk renders with a bullet marker.
 * Automatically splits comma-separated item lists into individual bullet lines.
 */
export function parseJobContent(body: string | null | undefined): JobContentBlock[] {
  if (!body || !body.trim()) {
    return []
  }

  // 1. If HTML tags are present (from rich text editor e.g. <p>, <li>, <br>)
  let normalized = body
  if (/<[a-z][\s\S]*>/i.test(normalized)) {
    normalized = normalized
      .replace(/<li[^>]*>/gi, '\n• ')
      .replace(/<\/li>/gi, '')
      .replace(/<\/(p|div|h[1-6])>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  }

  // 2. Decode standard HTML entities if present (&nbsp;, &amp;, etc.)
  normalized = normalized
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')

  // 3. Split into lines
  const rawLines = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (rawLines.length === 0) {
    return []
  }

  const blocks: JobContentBlock[] = []
  let currentList: string[] = []

  function flushList() {
    if (currentList.length > 0) {
      blocks.push({ type: 'list', items: [...currentList] })
      currentList = []
    }
  }

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i]

    // Heading/lead check: short title ending with colon (e.g. "Trách nhiệm chính:", "Mô tả công việc:")
    if (line.endsWith(':') && line.length <= 120) {
      flushList()
      blocks.push({ type: 'lead', text: line })
      continue
    }

    // Strip leading bullet markers ("- ", "• ", "* ", "1. ", "+ ", etc.)
    const cleanItem = line
      .replace(/^[\s•*+⁃–—-]*(\d+[.)])?\s*/, '')
      .trim()

    if (cleanItem) {
      const splitItems = splitCommaList(cleanItem)
      currentList.push(...splitItems)
    }
  }

  flushList()

  // Fallback: If blocks is empty, ensure list block with original lines
  if (blocks.length === 0 && rawLines.length > 0) {
    return [{ type: 'list', items: rawLines }]
  }

  return blocks
}
