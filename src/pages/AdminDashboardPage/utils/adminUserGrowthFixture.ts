import type {
  AdminUserGrowthPeriod,
  AdminUserGrowthPoint,
} from '../../../types/admin.types'

const sevenDayGrowth: AdminUserGrowthPoint[] = [
  { date: '24/07', totalUsers: 20, newUsers: 2 },
  { date: '25/07', totalUsers: 23, newUsers: 3 },
  { date: '26/07', totalUsers: 25, newUsers: 2 },
  { date: '27/07', totalUsers: 29, newUsers: 4 },
  { date: '28/07', totalUsers: 32, newUsers: 3 },
  { date: '29/07', totalUsers: 37, newUsers: 5 },
  { date: '30/07', totalUsers: 41, newUsers: 4 },
]

function buildGrowthFixture(
  points: number,
  startUsers: number,
  dateStep: number,
  labelPrefix = '',
): AdminUserGrowthPoint[] {
  let totalUsers = startUsers

  return Array.from({ length: points }, (_, index) => {
    const newUsers = 2 + ((index * 3 + dateStep) % 7)
    totalUsers += newUsers
    const day = String(1 + index * dateStep).padStart(2, '0')

    return {
      date: labelPrefix ? `${labelPrefix}${index + 1}` : `${day}/07`,
      newUsers,
      totalUsers,
    }
  })
}

export const adminUserGrowthFixture: Record<
  AdminUserGrowthPeriod,
  AdminUserGrowthPoint[]
> = {
  '7d': sevenDayGrowth,
  '30d': buildGrowthFixture(10, 42, 3),
  '90d': buildGrowthFixture(13, 68, 7, 'W'),
}
