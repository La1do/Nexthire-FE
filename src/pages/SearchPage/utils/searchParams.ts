export type SearchQueryParams = {
  field: string
  keyword: string
  location: string
  salary: string
  sort: string
  workMode: string
}

export const emptySearchParams: SearchQueryParams = {
  field: '',
  keyword: '',
  location: '',
  salary: '',
  sort: '',
  workMode: '',
}

export function getSearchParams(search: string): SearchQueryParams {
  const params = new URLSearchParams(search)

  return {
    field: params.get('field') ?? '',
    keyword: params.get('keyword') ?? '',
    location: params.get('location') ?? '',
    salary: params.get('salary') ?? '',
    sort: params.get('sort') ?? '',
    workMode: params.get('workMode') ?? '',
  }
}

export function getActiveSearchValues(params: SearchQueryParams) {
  return [params.keyword, params.location, params.field, params.workMode, params.salary].filter(Boolean)
}
