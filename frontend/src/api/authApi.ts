import axios from 'axios'
import type { SignupRequest, AuthResponse } from '@/types/auth'

const api = axios.create({
  baseURL: '/api',
})

export const signup = async (data: SignupRequest): Promise<void> => {
  await api.post('/auth/signup', data)
}

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', { email, password })
  return res.data.data
}
