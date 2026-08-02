import type { PropsWithChildren } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useRecruiterCompanyGate } from '../../hooks/useRecruiterCompanyGate'
import type { BusinessGate } from './businessGates'

type BusinessGateGuardProps = PropsWithChildren<{
  gate?: BusinessGate
}>

function isRecruiterGate(gate: BusinessGate) {
  return gate.kind.startsWith('recruiter-')
}

function getCurrentRedirect(location: ReturnType<typeof useLocation>) {
  return `${location.pathname}${location.search}${location.hash}`
}

function BusinessGateLoading() {
  return (
    <div className="route-guard-state" aria-live="polite">
      Đang kiểm tra trạng thái công ty…
    </div>
  )
}

function RecruiterBusinessGateInner({
  gate,
  children,
}: PropsWithChildren<{ gate: BusinessGate }>) {
  const location = useLocation()
  const redirect = encodeURIComponent(getCurrentRedirect(location))
  const {
    canPostJobs,
    hasCompany,
    isApproved,
    isLoading,
  } = useRecruiterCompanyGate()

  if (isLoading) {
    return <BusinessGateLoading />
  }

  if (gate.kind === 'recruiter-company-required' && !hasCompany) {
    return <Navigate replace to={`/recruiter/company?next=${redirect}`} />
  }

  if (gate.kind === 'recruiter-company-approved' && !isApproved) {
    return <Navigate replace to={`/recruiter/verification?next=${redirect}`} />
  }

  if (gate.kind === 'recruiter-can-post-jobs' && !canPostJobs) {
    return <Navigate replace to={`/recruiter/verification?next=${redirect}`} />
  }

  return <>{children}</>
}

export function BusinessGateGuard({ gate, children }: BusinessGateGuardProps) {
  if (!gate) {
    return <>{children}</>
  }

  if (isRecruiterGate(gate)) {
    return (
      <RecruiterBusinessGateInner gate={gate}>{children}</RecruiterBusinessGateInner>
    )
  }

  return <>{children}</>
}
