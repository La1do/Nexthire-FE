import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../../context'
import { authService } from '../../../services/auth.service'

const adminSettingsKey = ['auth', 'me'] as const

export function useAdminSettings() {
  const queryClient = useQueryClient()
  const { refreshUser } = useAuth()
  const profileQuery = useQuery({ queryKey: adminSettingsKey, queryFn: authService.getMe })
  const updateProfile = useMutation({
    mutationFn: authService.updateMe,
    onSuccess: (profile) => {
      queryClient.setQueryData(adminSettingsKey, profile)
      refreshUser()
    },
  })
  const changePassword = useMutation({ mutationFn: authService.changePassword })
  const syncProfile = (profile: Awaited<ReturnType<typeof authService.getMe>>) => { queryClient.setQueryData(adminSettingsKey, profile); refreshUser() }
  const updateAvatar = useMutation({ mutationFn: authService.updateAdminAvatar, onSuccess: syncProfile })
  const deleteAvatar = useMutation({ mutationFn: authService.deleteAdminAvatar, onSuccess: syncProfile })

  return { changePassword, deleteAvatar, profileQuery, updateAvatar, updateProfile }
}
