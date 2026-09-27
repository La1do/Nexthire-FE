import { getInitials } from '../utils/candidateFormat'

type CandidateAvatarProps = {
  avatarUrl?: string | null
  large?: boolean
  name: string
}

export function CandidateAvatar({ avatarUrl, large = false, name }: CandidateAvatarProps) {
  return (
    <span className={`recruiter-candidate-avatar${large ? ' recruiter-candidate-avatar--large' : ''}`}>
      {avatarUrl ? <img alt="" src={avatarUrl} /> : getInitials(name)}
    </span>
  )
}
