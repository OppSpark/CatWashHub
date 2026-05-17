import apiClient from '@/api/axios'
import type { UserProfile } from '@/types/user'

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  const res = await apiClient.get(`/users/${userId}/profile`)
  return res.data.data
}
