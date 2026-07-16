import type { AdminCompany, AdminCompanyCriteria } from '../types'

export function filterAdminCompanies(
  companies: ReadonlyArray<AdminCompany>,
  criteria: AdminCompanyCriteria,
) {
  const normalizedQuery = criteria.query.trim().toLowerCase()

  return companies.filter((company) => {
    const matchesStatus = criteria.status === 'all' || company.status === criteria.status
    const matchesQuery =
      normalizedQuery.length === 0 ||
      company.name.toLowerCase().includes(normalizedQuery) ||
      company.website.toLowerCase().includes(normalizedQuery) ||
      company.taxCode.toLowerCase().includes(normalizedQuery)

    return matchesStatus && matchesQuery
  })
}

export function isActiveCompanyFilters(criteria: AdminCompanyCriteria) {
  return criteria.query.trim().length > 0 || criteria.status !== 'all'
}
