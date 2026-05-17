import type { ReactNode } from 'react'

interface MobileShellProps {
  children: ReactNode
}

const MobileShell = ({ children }: MobileShellProps) => {
  return (
    <div className="min-h-dvh bg-[#D1D5DB] flex justify-center">
      <div className="relative w-full max-w-[480px] min-h-dvh" style={{ overscrollBehavior: 'none' }}>
        {/* 콘텐츠 영역 — overflow-hidden은 여기에만 */}
        <div className="absolute inset-0 overflow-hidden bg-[#F2F4F6] shadow-xl">
          {children}
        </div>
        {/* 모달/바텀시트 Portal — overflow-hidden 밖에 위치 */}
        <div id="modal-root" className="absolute inset-0 pointer-events-none z-50" />
      </div>
    </div>
  )
}

export default MobileShell
