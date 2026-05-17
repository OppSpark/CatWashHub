import apiClient from '@/api/axios'
import type { UserProfile } from '@/types/user'
import type { PostSummary } from '@/types/board'

export const getUserProfile = async (userId: number): Promise<UserProfile> => {
  const res = await apiClient.get(`/users/${userId}/profile`)
  return res.data.data
}

export const getUserPosts = async (userId: number): Promise<PostSummary[]> => {
  const res = await apiClient.get(`/users/${userId}/posts`)
  return res.data.data
}
