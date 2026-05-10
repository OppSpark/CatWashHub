import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
})

apiClient.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 응답 시 — 로그인 상태였을 때만 로그아웃 및 redirect (비로그인은 그냥 에러 throw)
apiClient.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const isLoggedIn = useAuthStore.getState().isLoggedIn
      if (isLoggedIn) {
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default apiClient
