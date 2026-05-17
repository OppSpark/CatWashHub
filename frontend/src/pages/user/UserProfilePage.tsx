import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getUserProfile } from '@/api/userApi'
import type { UserProfile } from '@/types/user'
import PageLayout from '@/layouts/PageLayout'
import { Car, ThumbsUp, Droplets, User } from 'lucide-react'

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) { return }
    getUserProfile(Number(userId))
      .then(setProfile)
      .finally(() => setIsLoading(false))
  }, [userId])

  if (isLoading) { return <PageLayout isLoading /> }
  if (!profile) {
    return (
      <PageLayout onBack>
        <p className="text-center py-20 text-[#ADB5C0]">유저를 찾을 수 없어요</p>
      </PageLayout>
    )
  }

  const joinYear = new Date(profile.joinedAt).getFullYear()
  const joinMonth = new Date(profile.joinedAt).getMonth() + 1

  return (
    <PageLayout title="프로필" onBack>
      <div className="flex flex-col gap-3 pb-10">

        {/* 프로필 헤더 */}
        <div className="bg-white rounded-2xl px-5 py-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center shrink-0">
            <User size={30} className="text-[#3182F6]" />
          </div>
          <div>
            <p className="text-[20px] font-bold text-[#191F28]">{profile.nickname}</p>
            <p className="text-[13px] text-[#ADB5C0] mt-0.5">{joinYear}년 {joinMonth}월 가입</p>
          </div>
        </div>

        {/* 활동 통계 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <p className="text-[13px] font-semibold text-[#6B7684] mb-3">활동 현황</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8FAFF] rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
                <Droplets size={18} className="text-[#3182F6]" />
              </div>
              <div>
                <p className="text-[18px] font-bold text-[#191F28]">{profile.washCount}</p>
                <p className="text-[11px] text-[#ADB5C0]">세차 횟수</p>
              </div>
            </div>
            <div className="bg-[#F8FAFF] rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
                <ThumbsUp size={18} className="text-[#3182F6]" />
              </div>
              <div>
                <p className="text-[18px] font-bold text-[#191F28]">{profile.totalPostLikes}</p>
                <p className="text-[11px] text-[#ADB5C0]">받은 좋아요</p>
              </div>
            </div>
          </div>
        </div>

        {/* 차량 정보 */}
        {(profile.carModel || profile.carColor) && (
          <div className="bg-white rounded-2xl px-5 py-4">
            <p className="text-[13px] font-semibold text-[#6B7684] mb-3">차량 정보</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
                <Car size={20} className="text-[#3182F6]" />
              </div>
              <p className="text-[14px] font-medium text-[#191F28]">
                {[profile.carModel, profile.carColor].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        )}

      </div>
    </PageLayout>
  )
}

export default UserProfilePage
