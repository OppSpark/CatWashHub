import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export const useRequireAuth = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  const [showLoginSheet, setShowLoginSheet] = useState(false)

  const requireAuth = (action?: () => void) => {
    if (!isLoggedIn) {
      setShowLoginSheet(true)
      return false
    }
    action?.()
    return true
  }

  return { isLoggedIn, showLoginSheet, setShowLoginSheet, requireAuth }
}
