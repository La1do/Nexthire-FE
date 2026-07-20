// API types for public company endpoints. See BE api-docs/company-service.md.

// GET /api/v1/companies/public/:id — only approved companies are public.
export type PublicCompanyProfile = {
  id: string
  name: string
  logo: string | null
  logoDocumentId: string | null
  description: string | null
  website: string | null
  address: string | null
}
