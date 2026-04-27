import { useToastStore } from '@/store/toastStore'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

const Toast = () => {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) { return null }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100%-32px)] max-w-[448px]">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg animate-slide-up ${
            toast.type === 'success' ? 'bg-[#191F28] text-white' :
            toast.type === 'error'   ? 'bg-[#F04452] text-white' :
                                       'bg-[#FF9500] text-white'
          }`}
        >
          {toast.type === 'success' && <CheckCircle size={18} className="flex-shrink-0" />}
          {toast.type === 'error'   && <XCircle size={18} className="flex-shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle size={18} className="flex-shrink-0" />}
          <p className="text-[14px] font-medium flex-1">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)}>
            <X size={16} className="opacity-70" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default Toast
