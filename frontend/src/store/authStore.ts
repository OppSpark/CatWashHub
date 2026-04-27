import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  nickname: string | null
  email: string | null
  isLoggedIn: boolean
  setAuth: (accessToken: string, nickname: string, email: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      accessToken: null,
      nickname: null,
      email: null,
      isLoggedIn: false,
      setAuth: (accessToken, nickname, email) =>
        set({ accessToken, nickname, email, isLoggedIn: true }),
      clearAuth: () =>
        set({ accessToken: null, nickname: null, email: null, isLoggedIn: false }),
    }),
    { name: 'auth' }
  )
)
