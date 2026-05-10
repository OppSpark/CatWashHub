import { useNavigate } from 'react-router-dom'
import BottomSheet from '@/components/BottomSheet'

interface LoginPromptSheetProps {
  open: boolean
  onClose: () => void
  bottomOffset?: number
}

const LoginPromptSheet = ({ open, onClose, bottomOffset }: LoginPromptSheetProps) => {
  const navigate = useNavigate()

  return (
    <BottomSheet open={open} onClose={onClose} bottomOffset={bottomOffset}>
      <div className="flex flex-col items-center text-center py-6 gap-2">
        <div className="w-14 h-14 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-2">
          <span className="text-3xl">🔐</span>
        </div>
        <p className="text-[18px] font-bold text-[#191F28]">로그인이 필요해요</p>
        <p className="text-[14px] text-[#6B7684] leading-relaxed">
          세차 기록, 글쓰기 등<br />더 많은 기능을 이용하려면<br />로그인해주세요.
        </p>
      </div>
      <div className="flex flex-col gap-2 pb-4">
        <button
          onClick={() => { onClose(); navigate('/login') }}
          className="w-full h-12 bg-[#3182F6] text-white rounded-xl font-semibold text-[15px] active:brightness-90"
        >
          로그인
        </button>
        <button
          onClick={() => { onClose(); navigate('/signup') }}
          className="w-full h-12 bg-[#F2F4F6] text-[#191F28] rounded-xl font-semibold text-[15px] active:brightness-90"
        >
          회원가입
        </button>
      </div>
    </BottomSheet>
  )
}

export default LoginPromptSheet
