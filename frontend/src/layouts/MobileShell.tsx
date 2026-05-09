import type { ReactNode } from 'react'

interface MobileShellProps {
  children: ReactNode
}

const MobileShell = ({ children }: MobileShellProps) => {
  return (
    <div className="min-h-dvh bg-[#D1D5DB] flex justify-center">
      <div className="relative w-full max-w-[480px] min-h-dvh bg-[#F2F4F6] shadow-xl">
        {children}
        {/* 모달/바텀시트 Portal 마운트 포인트 */}
        <div id="modal-root" />
      </div>
    </div>
  )
}

export default MobileShell
