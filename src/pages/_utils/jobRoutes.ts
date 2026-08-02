// Id-based hrefs for job/company detail pages wired to the live API.

export function createJobDetailHrefById(id: string) {
  return `/jobs/${id}`
}

export function createCompanyDetailHrefById(companyId: string) {
  return `/companies/${companyId}`
}
