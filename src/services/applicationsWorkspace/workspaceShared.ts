import type { ListEnvelope } from '../../types/job.types'

export const BULK_PAGE_LIMIT = 100

export async function fetchAllPages<TItem>(
  loadPage: (page: number) => Promise<{ data: TItem[]; meta: { totalPages: number } }>,
): Promise<TItem[]> {
  const firstPage = await loadPage(1)
  const items = [...firstPage.data]

  for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
    const response = await loadPage(page)
    items.push(...response.data)
  }

  return items
}

export function paginateLocally<TItem>(items: TItem[], page = 1, limit = 20): ListEnvelope<TItem> {
  const safeLimit = Math.max(1, limit)
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * safeLimit

  return {
    data: items.slice(start, start + safeLimit),
    meta: { limit: safeLimit, page: safePage, total: items.length, totalPages: Math.max(1, Math.ceil(items.length / safeLimit)) },
    success: true,
  }
}
