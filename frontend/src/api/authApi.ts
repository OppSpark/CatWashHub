import apiClient from '@/api/axios'
import type { SignupRequest, AuthResponse } from '@/types/auth'

export const signup = async (data: SignupRequest): Promise<void> => {
  await apiClient.post('/auth/signup', data)
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await apiClient.post('/auth/login', { email, password })
  return res.data.data
}

export const updateNickname = async (nickname: string): Promise<AuthResponse> => {
  const res = await apiClient.patch('/auth/nickname', { nickname })
  return res.data.data
}

export const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await apiClient.patch('/auth/password', { currentPassword, newPassword })
}

export const deleteAccount = async (): Promise<void> => {
  await apiClient.delete('/auth/account')
}
