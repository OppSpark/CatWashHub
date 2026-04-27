import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { LogOut, User } from 'lucide-react'

const MyPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { nickname, email, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    toast.success('로그아웃 되었습니다.')
    navigate('/login')
  }

  return (
    <div className="min-h-dvh bg-[#F2F4F6] pb-20">

      {/* 헤더 */}
      <div className="bg-white px-6 pt-12 pb-4">
        <h1 className="text-[22px] font-bold text-[#191F28]">마이페이지</h1>
      </div>

      {/* 프로필 카드 */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-[#E8F0FE] rounded-full flex items-center justify-center">
          <User size={28} className="text-[#3182F6]" />
        </div>
        <div>
          <p className="text-[17px] font-bold text-[#191F28]">{nickname ?? '-'}</p>
          <p className="text-[13px] text-[#6B7684] mt-0.5">{email ?? '-'}</p>
        </div>
      </div>

      {/* 메뉴 */}
      <div className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 active:bg-[#F2F4F6] transition"
        >
          <LogOut size={18} className="text-[#F04452]" />
          <span className="text-[15px] font-medium text-[#F04452]">로그아웃</span>
        </button>
      </div>
    </div>
  )
}

export default MyPage
