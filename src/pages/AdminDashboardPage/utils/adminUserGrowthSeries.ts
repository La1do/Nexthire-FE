import type {
  AdminUserGrowthPoint,
  AdminUserGrowthSeriesPoint,
} from '../../../types/admin.types'

export function toAdminUserGrowthChartData(
  points: ReadonlyArray<AdminUserGrowthSeriesPoint>,
  currentTotalUsers: number,
): AdminUserGrowthPoint[] {
  const registrationsInRange = points.reduce(
    (total, point) => total + point.registeredUsers,
    0,
  )
  let runningTotal = Math.max(0, currentTotalUsers - registrationsInRange)

  return points.map((point) => {
    runningTotal += point.registeredUsers
    return {
      date: point.bucket,
      totalUsers: runningTotal,
      newUsers: point.registeredUsers,
    }
  })
}
