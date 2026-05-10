import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import {
  User, LogOut, ChevronRight, Lock, Edit3, Trash2, Star, Wallet, BarChart2,
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import BottomSheet from '@/components/BottomSheet'
import { MY_MSGS } from '@/constants/messages'
import { updateNickname, updatePassword, deleteAccount } from '@/api/authApi'
import { getDashboard } from '@/api/washApi'
import type { WashDashboard } from '@/types/wash'
import { formatCost, formatRating } from '@/utils/format'

// ==================== 모달 타입 ====================
type ModalType = 'nickname' | 'password' | null

const MyPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { nickname, email, setAuth, clearAuth } = useAuthStore()

  const [dashboard, setDashboard] = useState<WashDashboard | null>(null)
  const [activeModal, setActiveModal] = useState<ModalType>(null)

  // 닉네임 변경 폼
  const [newNickname, setNewNickname] = useState('')
  const [nicknameLoading, setNicknameLoading] = useState(false)

  // 비밀번호 변경 폼
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  // ==================== 초기화 함수 ====================
  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch(() => {})
  }, [])

  const resetModal = () => {
    setActiveModal(null)
    setNewNickname('')
    setCurrentPw('')
    setNewPw('')
  }

  // ==================== 기능별 함수 ====================
  const handleLogout = () => {
    clearAuth()
    toast.success(MY_MSGS.LOGOUT_SUCCESS)
    navigate('/login')
  }

  const handleNicknameSubmit = async () => {
    if (newNickname.trim().length < 2) {
      toast.error('닉네임은 2자 이상이어야 해요.')
      return
    }
    setNicknameLoading(true)
    try {
      const res = await updateNickname(newNickname.trim())
      setAuth(res.userId, res.accessToken, res.nickname, res.email)
      toast.success(MY_MSGS.NICKNAME_UPDATED)
      resetModal()
    } catch {
      toast.error(MY_MSGS.NICKNAME_UPDATE_ERROR)
    } finally {
      setNicknameLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    if (newPw.length < 8) {
      toast.error('새 비밀번호는 8자 이상이어야 해요.')
      return
    }
    setPwLoading(true)
    try {
      await updatePassword(currentPw, newPw)
      toast.success(MY_MSGS.PASSWORD_UPDATED)
      resetModal()
    } catch {
      toast.error(MY_MSGS.PASSWORD_UPDATE_ERROR)
    } finally {
      setPwLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm(MY_MSGS.CONFIRM_DELETE_ACCOUNT)) {
      return
    }
    try {
      await deleteAccount()
      clearAuth()
      toast.success(MY_MSGS.ACCOUNT_DELETED)
      navigate('/login')
    } catch {
      toast.error(MY_MSGS.ACCOUNT_DELETE_ERROR)
    }
  }

  return (
    <PageLayout title="마이페이지" headerVariant="large">
      <div className="flex flex-col gap-3 pb-24">

        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-[#E8F0FE] rounded-full flex items-center justify-center flex-shrink-0">
            <User size={28} className="text-[#3182F6]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-bold text-[#191F28] truncate">{nickname ?? '-'}</p>
            <p className="text-[13px] text-[#6B7684] mt-0.5 truncate">{email ?? '-'}</p>
          </div>
        </div>

        {/* 세차 통계 카드 */}
        <div className="bg-white rounded-2xl p-5">
          <p className="text-[13px] font-semibold text-[#6B7684] mb-3">세차 통계</p>
          <div className="grid grid-cols-3 divide-x divide-[#F2F4F6]">
            <div className="flex flex-col items-center gap-1 px-2">
              <span className="text-[22px] font-bold text-[#191F28]">
                {dashboard?.totalCount ?? '-'}
              </span>
              <span className="text-[12px] text-[#6B7684]">총 세차 횟수</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-2">
              <div className="flex items-center gap-0.5">
                <Star size={14} className="text-[#FFB800] fill-[#FFB800]" />
                <span className="text-[22px] font-bold text-[#191F28]">
                  {formatRating(dashboard?.avgRating)}
                </span>
              </div>
              <span className="text-[12px] text-[#6B7684]">평균 만족도</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-2">
              <div className="flex items-center gap-0.5">
                <Wallet size={14} className="text-[#3182F6]" />
                <span className="text-[22px] font-bold text-[#191F28]">
                  {formatCost(dashboard?.avgCost)}
                </span>
              </div>
              <span className="text-[12px] text-[#6B7684]">평균 비용</span>
            </div>
          </div>
        </div>

        {/* 세차 통계 링크 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <MenuItem
            icon={<BarChart2 size={18} className="text-[#3182F6]" />}
            label="세차 통계"
            onClick={() => navigate('/stats')}
          />
        </div>

        {/* 계정 설정 메뉴 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <p className="text-[12px] font-semibold text-[#6B7684] px-5 pt-4 pb-2">계정</p>

          <MenuItem
            icon={<Edit3 size={18} className="text-[#3182F6]" />}
            label="닉네임 변경"
            onClick={() => {
              setNewNickname(nickname ?? '')
              setActiveModal('nickname')
            }}
          />
          <div className="h-px bg-[#F2F4F6] mx-5" />
          <MenuItem
            icon={<Lock size={18} className="text-[#3182F6]" />}
            label="비밀번호 변경"
            onClick={() => setActiveModal('password')}
          />
          <div className="h-px bg-[#F2F4F6] mx-5" />
          <MenuItem
            icon={<LogOut size={18} className="text-[#F04452]" />}
            label="로그아웃"
            labelClass="text-[#F04452]"
            onClick={handleLogout}
            hideChevron
          />
          <div className="pb-2" />
        </div>

        {/* 기타 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <p className="text-[12px] font-semibold text-[#6B7684] px-5 pt-4 pb-2">기타</p>
          <MenuItem
            icon={<Trash2 size={18} className="text-[#F04452]" />}
            label="회원 탈퇴"
            labelClass="text-[#F04452]"
            onClick={handleDeleteAccount}
            hideChevron
          />
          <div className="pb-2" />
        </div>

      </div>

      {/* 닉네임 변경 시트 */}
      <BottomSheet
        open={activeModal === 'nickname'}
        onClose={resetModal}
        title="닉네임 변경"
        footer={
          <button
            onClick={handleNicknameSubmit}
            disabled={nicknameLoading}
            className="w-full bg-[#3182F6] text-white rounded-xl py-3.5 text-[15px] font-semibold disabled:opacity-50"
          >
            {nicknameLoading ? '처리 중...' : '변경하기'}
          </button>
        }
      >
        <div className="py-2">
          <input
            type="text"
            value={newNickname}
            onChange={e => setNewNickname(e.target.value)}
            placeholder="새 닉네임 (2~50자)"
            maxLength={50}
            className="w-full bg-[#F2F4F6] rounded-xl px-4 py-3 text-[15px] text-[#191F28] outline-none focus:ring-2 focus:ring-[#3182F6]"
          />
        </div>
      </BottomSheet>

      {/* 비밀번호 변경 시트 */}
      <BottomSheet
        open={activeModal === 'password'}
        onClose={resetModal}
        title="비밀번호 변경"
        footer={
          <button
            onClick={handlePasswordSubmit}
            disabled={pwLoading}
            className="w-full bg-[#3182F6] text-white rounded-xl py-3.5 text-[15px] font-semibold disabled:opacity-50"
          >
            {pwLoading ? '처리 중...' : '변경하기'}
          </button>
        }
      >
        <div className="flex flex-col gap-3 py-2">
          <input
            type="password"
            value={currentPw}
            onChange={e => setCurrentPw(e.target.value)}
            placeholder="현재 비밀번호"
            className="w-full bg-[#F2F4F6] rounded-xl px-4 py-3 text-[15px] text-[#191F28] outline-none focus:ring-2 focus:ring-[#3182F6]"
          />
          <input
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            placeholder="새 비밀번호 (8자 이상)"
            className="w-full bg-[#F2F4F6] rounded-xl px-4 py-3 text-[15px] text-[#191F28] outline-none focus:ring-2 focus:ring-[#3182F6]"
          />
        </div>
      </BottomSheet>
    </PageLayout>
  )
}

// ==================== 서브 컴포넌트 ====================
interface MenuItemProps {
  icon: React.ReactNode
  label: string
  labelClass?: string
  onClick: () => void
  hideChevron?: boolean
}

const MenuItem = ({ icon, label, labelClass, onClick, hideChevron }: MenuItemProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-5 py-4 active:bg-[#F2F4F6] transition"
  >
    {icon}
    <span className={`flex-1 text-left text-[15px] font-medium text-[#191F28] ${labelClass ?? ''}`}>
      {label}
    </span>
    {!hideChevron && <ChevronRight size={16} className="text-[#B0B8C1]" />}
  </button>
)

export default MyPage
