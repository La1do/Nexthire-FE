import type { CanvasDocument } from '../pages/CvBuilderPage/canvas/canvas.types'

export type CvTemplateDesignStatus = 'QUEUED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED'

export type CvTemplateDesignDropReason =
  | 'UNKNOWN_KIND'
  | 'OFF_PAGE'
  | 'NON_POSITIVE_SIZE'
  | 'UNKNOWN_ICON'
  | 'PAGE_LIMIT'
  | 'ELEMENT_LIMIT'

export type CvTemplateDesignSanitizeReport = {
  elementsReturned: number
  elementsKept: number
  dropped: Array<{ reason: CvTemplateDesignDropReason; kind: string }>
  clamped: number
  bindingsResolved: number
  bindingsCleared: number
  piiScrubbed: number
}

/** Bản rút gọn của ParsedResume phía BE — chỉ những gì panel cần hiển thị. */
export type CvTemplateDesignParsedResume = {
  profile: {
    fullName?: string
    headline?: string
    contactEmail?: string
    phone?: string
    location?: string
    summary?: string
  }
  skills: Array<{ name: string }>
  experiences: Array<{ companyName: string; position: string }>
  educations: Array<{ schoolName: string }>
  certifications: Array<{ name: string }>
  projects: Array<{ name: string }>
}

export type CvTemplateDesignJob = {
  id: string
  status: CvTemplateDesignStatus
  provider: 'OPENAI' | 'GEMINI'
  providerVersion: string | null
  sourceFileName: string
  /** Bất biến từ BE: status SUCCEEDED <=> canvas và parsedResume đều khác null. */
  canvas: CanvasDocument | null
  parsedResume: CvTemplateDesignParsedResume | null
  sanitizeReport: CvTemplateDesignSanitizeReport | null
  errorCode: string | null
  errorMessage: string | null
  createdAt: string
  finishedAt: string | null
}

export const isTerminalDesignStatus = (status?: CvTemplateDesignStatus): boolean =>
  status === 'SUCCEEDED' || status === 'FAILED'
