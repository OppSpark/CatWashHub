import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  userId: number | null
  accessToken: string | null
  nickname: string | null
  email: string | null
  isLoggedIn: boolean
  setAuth: (userId: number, accessToken: string, nickname: string, email: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      userId: null,
      accessToken: null,
      nickname: null,
      email: null,
      isLoggedIn: false,
      setAuth: (userId, accessToken, nickname, email) =>
        set({ userId, accessToken, nickname, email, isLoggedIn: true }),
      clearAuth: () =>
        set({ userId: null, accessToken: null, nickname: null, email: null, isLoggedIn: false }),
    }),
    { name: 'auth' }
  )
)
