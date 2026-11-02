import { ShieldCheck } from 'lucide-react'

export function JobDetailTrustBanner() {
  return (
    <div className="job-detail-trust-banner">
      <div className="job-detail-trust-banner__icon-wrap">
        <ShieldCheck size={20} className="job-detail-trust-banner__icon" />
      </div>
      <p className="job-detail-trust-banner__text">
        <strong>100% tin đăng tải trên NexHire</strong> được cung cấp chủ động bởi Nhà tuyển dụng.
      </p>
    </div>
  )
}
