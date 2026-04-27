import apiClient from '@/api/axios'
import type { SignupRequest, AuthResponse } from '@/types/auth'

export const signup = async (data: SignupRequest): Promise<void> => {
  await apiClient.post('/auth/signup', data)
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await apiClient.post('/auth/login', { email, password })
  return res.data.data
}
