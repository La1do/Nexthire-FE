import type { RecruiterApplicationQuery } from '../../types/application.types'
import type { CompanyJobListQuery } from '../../types/job.types'

/** CV group of a JD, see `getApplicationStage`. */
export type ApplicationStage = 'new' | 'inProgress' | 'decided'

export type ApplicationStageCounts = Record<ApplicationStage, number>

export type WorkspaceJobListQuery = CompanyJobListQuery & {
  /** Auth user id of the assignee (Staff filter). TODO(BE): server-side param. */
  assigneeId?: string
}

export type WorkspaceApplicationQuery = RecruiterApplicationQuery
