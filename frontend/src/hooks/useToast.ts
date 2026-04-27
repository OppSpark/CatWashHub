import { useToastStore } from '@/store/toastStore'

export const useToast = () => {
  const addToast = useToastStore(s => s.addToast)

  return {
    success: (message: string) => addToast(message, 'success'),
    error: (message: string) => addToast(message, 'error'),
    warning: (message: string) => addToast(message, 'warning'),
  }
}
