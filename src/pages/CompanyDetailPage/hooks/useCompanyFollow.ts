import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useToast } from '../../../context'
import type { CompanyDetailTranslations } from '../../../i18n/types'
import { authTokenStorage } from '../../../lib/api'
import { getApiErrorCode, getApiErrorEnvelope } from '../../../lib/api/apiError'
import { followedCompanyService } from '../../../services/followedCompany.service'

export type CompanyFollowControl = {
  canRender: boolean
  isBusy: boolean
  isFollowed: boolean
  label: string
  onToggle: () => void
  title: string
}

const COMPANY_UNAVAILABLE_CODES = new Set(['JOB.COMPANY_NOT_APPROVED', 'COMMON.CONFLICT'])

function getCurrentRedirect(location: ReturnType<typeof useLocation>) {
  return `${location.pathname}${location.search}${location.hash}`
}

export function useCompanyFollow(
  companyId: string,
  content: CompanyDetailTranslations['follow'],
): CompanyFollowControl {
  const { isHydratingUser, user } = useAuth()
  const toast = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [isFollowed, setFollowed] = useState(false)
  const [isStatusLoading, setStatusLoading] = useState(false)
  const [isMutating, setMutating] = useState(false)
  const hasAccessToken = Boolean(authTokenStorage.getAccessToken())
  const isCandidate = user?.role === 'CANDIDATE'
  const canRender = !user || isCandidate
  const canFetchStatus = Boolean(companyId && hasAccessToken && isCandidate)

  const redirectToLogin = useCallback(() => {
    const redirect = encodeURIComponent(getCurrentRedirect(location))
    navigate(`/login?redirect=${redirect}`)
  }, [location, navigate])

  useEffect(() => {
    let isActive = true

    if (!canFetchStatus) {
      setStatusLoading(false)
      setFollowed(false)
      return () => {
        isActive = false
      }
    }

    setStatusLoading(true)

    followedCompanyService
      .getFollowStatus(companyId)
      .then((status) => {
        if (isActive) {
          setFollowed(status.followed)
        }
      })
      .catch(() => {
        if (isActive) {
          setFollowed(false)
        }
      })
      .finally(() => {
        if (isActive) {
          setStatusLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [canFetchStatus, companyId])

  const onToggle = useCallback(async () => {
    if (isMutating || isStatusLoading) {
      return
    }

    if (!companyId) {
      toast.error(content.error)
      return
    }

    if (!authTokenStorage.getAccessToken() || !user) {
      toast.info(content.loginRequired)
      redirectToLogin()
      return
    }

    if (user.role !== 'CANDIDATE') {
      toast.warning(content.candidateOnly)
      return
    }

    const previousFollowed = isFollowed
    const nextFollowed = !previousFollowed
    setMutating(true)
    setFollowed(nextFollowed)

    try {
      if (nextFollowed) {
        await followedCompanyService.followCompany(companyId)
        toast.success(content.followSuccess)
      } else {
        await followedCompanyService.unfollowCompany(companyId)
        toast.success(content.unfollowSuccess)
      }
    } catch (error) {
      setFollowed(previousFollowed)
      const errorCode = getApiErrorCode(error)

      if (errorCode && COMPANY_UNAVAILABLE_CODES.has(errorCode)) {
        toast.warning(content.unavailable)
      } else {
        toast.error(getApiErrorEnvelope(error)?.error.message ?? content.error)
      }
    } finally {
      setMutating(false)
    }
  }, [
    companyId,
    content.candidateOnly,
    content.error,
    content.followSuccess,
    content.loginRequired,
    content.unavailable,
    content.unfollowSuccess,
    isFollowed,
    isMutating,
    isStatusLoading,
    redirectToLogin,
    toast,
    user,
  ])

  const isBusy = isMutating || isStatusLoading || (hasAccessToken && !user && isHydratingUser)

  const label = useMemo(() => {
    if (isBusy) {
      return content.loading
    }

    return isFollowed ? content.following : content.follow
  }, [content.follow, content.following, content.loading, isBusy, isFollowed])

  const title = useMemo(() => {
    if (!hasAccessToken || !user) {
      return content.loginRequired
    }

    if (user.role !== 'CANDIDATE') {
      return content.candidateOnly
    }

    return label
  }, [content.candidateOnly, content.loginRequired, hasAccessToken, label, user])

  return {
    canRender,
    isBusy,
    isFollowed,
    label,
    onToggle,
    title,
  }
}
