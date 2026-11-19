import type { HrEvidence } from '../../../../types/hr-review.types'

const ignoredWords = new Set((
  'the a an and or in on at to for of with from by as is are be not ' +
  'experience knowledge skills years year at least must mandatory preferred required have timely ' +
  'có với các cho và hoặc trong tại đến từ sử dụng biết kinh nghiệm kỹ năng yêu cầu cần phải tối thiểu năm ưu tiên'
).normalize('NFKD').replace(/\p{M}/gu, '').split(' '))
const workActions = terms(
  'administer analyze assemble build coordinate create deploy design develop diagnose execute file handle implement ' +
  'investigate lead maintain manage migrate monitor operate participate perform prepare reconcile review restore ' +
  'run support test troubleshoot use validate verify write'
)

function normalized(value: string): string {
  return value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/đ/g, 'd')
}

function stem(word: string): string {
  if (!/^[a-z]{5,}$/.test(word)) return word
  return word.replace(/(?:ing|ed|s)$/, '').replace(/e$/, '')
}

function terms(value: string): Set<string> {
  return new Set((normalized(value).match(/[\p{L}\p{N}]+(?:[+#]+|[./-][\p{L}\p{N}]+)*/gu) ?? [])
    .filter(term => !ignoredWords.has(term) && /\p{L}/u.test(term))
    .map(stem))
}

const production = /\b(?:production|san xuat|van hanh thuc te)\b/
const limitation = /\b(?:never|did not|didn't|has not|have not|without|training only|sandbox only|lab only|chua tung|chua thuc hien|khong trien khai|chi thuc hanh)\b/
const vietnameseWork = /\b(?:trien khai|van hanh|thuc hien|quan ly|xu ly|phuc hoi|doi soat|bao tri|xay dung|phat trien|giam sat|phan tich|lap bao cao|nop ho so)\b/

function hasWorkContext(hit: HrEvidence): boolean {
  if (/\/technologies\/\d+$/.test(hit.evidenceId)) return false
  return /^(?:experiences?|projects?)$/i.test(hit.source) || /^(?:experiences?|projects?)\//i.test(hit.evidenceId)
}

/**
 * Pick a passage to open first. This affects presentation only. The retrieved
 * passages, model ranks and scores remain available for HR to inspect.
 */
export function selectEvidencePreview(items: readonly HrEvidence[], requirement: string) {
  if (/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(requirement)) {
    return { index: items.length ? 0 : null, needsContext: false }
  }
  const query = terms(requirement)
  const anchors = [...query].filter(term => !workActions.has(term) && !['production', 'using', 'knowledge'].includes(term))
  if (!anchors.length) return { index: items.length ? 0 : null, needsContext: true }
  if (!items.length) return { index: null, needsContext: true }
  // Keep an explicit limitation in the original leading passage visible.
  if ((items[0].reasonCodes ?? []).some(code =>
    code === 'EXPLICIT_NEGATION_CUE' || code === 'TOOL_MENTION_WITH_NEGATION_REQUIRES_REVIEW')) {
    return { index: 0, needsContext: true }
  }
  const needsProduction = production.test(normalized(requirement))
  const minAnchors = Math.max(1, Math.ceil(anchors.length / 2))
  let best: number | null = null
  let bestStrength = 0

  items.forEach((hit, index) => {
    if (!hasWorkContext(hit)) return
    for (const sentence of normalized(hit.text).split(/(?<=[.!?])\s+|\n+/)) {
      if (limitation.test(sentence) || (needsProduction && !production.test(sentence))) continue
      const words = terms(sentence)
      const matchingAnchors = anchors.filter(term => words.has(term)).length
      if (matchingAnchors < minAnchors) continue
      if (![...words].some(term => workActions.has(term)) && !vietnameseWork.test(sentence)) continue
      const matchingActions = [...query].filter(term => workActions.has(term) && words.has(term)).length
      const strength = matchingAnchors * 2 + Math.min(matchingActions, 1)
      if (strength > bestStrength) {
        best = index
        bestStrength = strength
      }
    }
  })
  if (best !== null) return { index: best, needsContext: false }

  const firstWords = terms(items[0].text)
  const overlaps = anchors.some(term => firstWords.has(term))
  const qualification = /\b(?:degree|diploma|certifications?|licen[cs]e|certified|bang cap|chung chi)\b/.test(normalized(requirement))
  const qualificationSource = /^(?:educations?|certifications?)$/i.test(items[0].source)
  if (qualification && qualificationSource && overlaps) return { index: 0, needsContext: false }

  return { index: overlaps ? 0 : null, needsContext: true }
}
