import type { Envelope, ListEnvelope } from './job.types'

export type NotificationReadStatus = 'ALL' | 'READ' | 'UNREAD'
export type NotificationRecipientType = 'USER' | 'COMPANY'
export type NotificationSenderType = 'SYSTEM' | 'CANDIDATE' | 'COMPANY'
export type NotificationType =
  | 'APPLICATION_SUBMITTED'
  | 'APPLICATION_STAGE_CHANGED'
  | 'COMPANY_VERIFICATION_CHANGED'
  | 'COMPANY_FOLLOWED_JOB_PUBLISHED'

export type NotificationApplicationData = {
  applicationId: string
  jobId: string
  jobTitle: string | null
  companyId: string
  companyName: string | null
  companyLogoUrl: string | null
  candidateId: string
  candidateUserId: string
  candidateFullName: string | null
  candidateAvatarDocumentId: string | null
  previousStatus?: string
  status?: string
  note?: string | null
}

export type NotificationCompanyVerificationData = {
  companyId: string
  companyName: string | null
  companyLogoUrl: string | null
  companyStatus: string
}

export type NotificationFollowedJobData = {
  jobId: string
  jobTitle: string
  companyId: string
  companyName: string | null
  companyLogoUrl: string | null
  companyLogoDocumentId: string | null
  experienceLevel: string | null
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string | null
  isSalaryVisible: boolean | null
  publishedAt: string | null
}

export type NotificationData =
  | NotificationApplicationData
  | NotificationCompanyVerificationData
  | NotificationFollowedJobData
  | Record<string, unknown>

export type NotificationItem = {
  id: string
  recipientType: NotificationRecipientType
  recipientUserId: string | null
  recipientCompanyId: string | null
  senderType: NotificationSenderType
  senderEntityId: string | null
  senderName: string | null
  senderAvatarDocumentId: string | null
  senderLogoUrl: string | null
  type: NotificationType
  title: string
  body: string
  data: NotificationData
  readAt: string | null
  createdAt: string
  updatedAt: string
}

export type NotificationListQuery = {
  page?: number
  limit?: number
  readStatus?: NotificationReadStatus
}

export type NotificationCountResult = {
  count: number
}

export type NotificationListResponse = ListEnvelope<NotificationItem>
export type NotificationEnvelope = Envelope<NotificationItem>
export type NotificationCountEnvelope = Envelope<NotificationCountResult>
