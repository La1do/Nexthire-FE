import type { CandidateProfile, ProfileCompletion } from '../types'

function hasText(value: string) {
  return value.trim().length > 0
}

export function getProfileCompletion(profile: CandidateProfile): ProfileCompletion {
  const items = [
    {
      key: 'basic',
      completed: [profile.name, profile.headline, profile.location, profile.summary].every(hasText),
    },
    {
      key: 'contact',
      completed: [profile.email, profile.phone].every(hasText),
    },
    {
      key: 'skills',
      completed: profile.skills.length >= 3,
    },
    {
      key: 'experience',
      completed: profile.experiences.some((item) => hasText(item.position) && hasText(item.company)),
    },
    {
      key: 'resume',
      completed: [profile.resumeFile, profile.portfolio, profile.linkedin].some(hasText),
    },
  ] as const
  const completedCount = items.filter((item) => item.completed).length

  return {
    items: [...items],
    percent: Math.round((completedCount / items.length) * 100),
  }
}
