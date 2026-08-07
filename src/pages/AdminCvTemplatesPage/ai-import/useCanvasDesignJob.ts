import { useMutation, useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

import { adminQueryKeys } from '../../../hooks/adminQueryKeys'
import { adminCvTemplateDesignsService } from '../../../services/admin/adminCvTemplateDesigns.service'
import {
  isTerminalDesignStatus,
  type CvTemplateDesignJob,
} from '../../../types/cvTemplateDesign.types'

const POLL_INTERVAL_MS = 2000

export type CanvasDesignJobState = {
  job: CvTemplateDesignJob | undefined
  isUploading: boolean
  isRunning: boolean
  uploadError: unknown
  start: (file: File) => void
  reset: () => void
}

/**
 * Upload PDF rồi poll job cho tới khi kết thúc.
 *
 * Không đặt trần thời gian ở FE: reaper của BE lật job PROCESSING quá hạn thành
 * FAILED, nên timeout chỉ có một nguồn sự thật. FE chỉ hiển thị thứ BE trả về.
 */
export function useCanvasDesignJob(): CanvasDesignJobState {
  const [jobId, setJobId] = useState<string | null>(null)

  const upload = useMutation({
    mutationFn: (file: File) => adminCvTemplateDesignsService.create(file),
    onSuccess: (job) => setJobId(job.id),
  })

  const jobQuery = useQuery({
    queryKey: adminQueryKeys.cvTemplateDesign(jobId ?? 'none'),
    queryFn: () => adminCvTemplateDesignsService.get(jobId as string),
    enabled: Boolean(jobId),
    // Trả false khi tới trạng thái kết thúc — react-query tự dừng, không cần dọn thủ công.
    refetchInterval: (query) =>
      isTerminalDesignStatus(query.state.data?.status) ? false : POLL_INTERVAL_MS,
    gcTime: 0,
  })

  const reset = useCallback(() => {
    setJobId(null)
    upload.reset()
  }, [upload])

  const start = useCallback(
    (file: File) => {
      setJobId(null)
      upload.mutate(file)
    },
    [upload],
  )

  const job = jobQuery.data

  return {
    job,
    isUploading: upload.isPending,
    isRunning:
      upload.isPending ||
      (Boolean(jobId) && !isTerminalDesignStatus(job?.status)),
    uploadError: upload.error,
    start,
    reset,
  }
}
