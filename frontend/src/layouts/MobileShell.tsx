import type { ReactNode } from 'react'

interface MobileShellProps {
  children: ReactNode
}

const MobileShell = ({ children }: MobileShellProps) => {
  return (
    <div className="min-h-dvh bg-[#D1D5DB] flex justify-center">
      <div
        className="relative w-full max-w-[480px] min-h-dvh bg-[#F2F4F6] shadow-xl overflow-hidden flex flex-col"
        style={{ overscrollBehavior: 'none' }}
      >
        {/* 상단 safe-area를 흰색으로 채움 — 헤더 색상과 일치 */}
        <div className="bg-white shrink-0" style={{ height: 'env(safe-area-inset-top)' }} />

        <div className="flex-1 relative overflow-hidden">
          {children}
          {/* 모달/바텀시트 Portal 마운트 포인트 */}
          <div id="modal-root" />
        </div>

        {/* 하단 safe-area 채움 */}
        <div className="bg-white shrink-0" style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>
    </div>
  )
}

export default MobileShell
