import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  // 하단 고정 액션 버튼 (선택)
  footer?: ReactNode
}

const BottomSheet = ({ open, onClose, title, children, footer }: BottomSheetProps) => {
  // 열려있는 동안 배경 스크롤 방지
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) {
    return null
  }

  const portal = document.getElementById('modal-root') ?? document.body

  return createPortal(
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* 딤드 배경 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      {/* 시트 본체 */}
      <div className="relative bg-white rounded-t-3xl flex flex-col max-h-[90%]">
        {/* 핸들 바 */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-[#E5E8EB] rounded-full" />
        </div>

        {/* 헤더 */}
        {title !== undefined && (
          <div className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0">
            <p className="text-[17px] font-bold text-[#191F28]">{title}</p>
            <button onClick={onClose} className="text-[13px] text-[#ADB5C0]">닫기</button>
          </div>
        )}

        {/* 콘텐츠 (스크롤 가능) */}
        <div className="flex-1 overflow-y-auto px-5 pb-2">
          {children}
        </div>

        {/* 하단 액션 버튼 */}
        {footer !== undefined && (
          <div className="px-5 pt-3 pb-8 shrink-0 border-t border-[#F2F4F6]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    portal,
  )
}

export default BottomSheet
