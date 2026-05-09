import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { LogOut, User } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'

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
    <PageLayout title="마이페이지">
      <div className="flex flex-col gap-3 pb-24">

        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-[#E8F0FE] rounded-full flex items-center justify-center">
            <User size={28} className="text-[#3182F6]" />
          </div>
          <div>
            <p className="text-[17px] font-bold text-[#191F28]">{nickname ?? '-'}</p>
            <p className="text-[13px] text-[#6B7684] mt-0.5">{email ?? '-'}</p>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-5 py-4 active:bg-[#F2F4F6] transition"
          >
            <LogOut size={18} className="text-[#F04452]" />
            <span className="text-[15px] font-medium text-[#F04452]">로그아웃</span>
          </button>
        </div>

      </div>
    </PageLayout>
  )
}

export default MyPage
