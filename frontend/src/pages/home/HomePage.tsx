import { useAuthStore } from '@/store/authStore'

const HomePage = () => {
  const nickname = useAuthStore(s => s.nickname)

  return (
    <div className="min-h-dvh bg-[#F2F4F6] pb-20">

      {/* 헤더 */}
      <div className="bg-white px-6 pt-12 pb-4">
        <p className="text-[14px] text-[#6B7684]">안녕하세요 👋</p>
        <h1 className="text-[22px] font-bold text-[#191F28] mt-0.5">
          {nickname ?? '세차인'}님의 피드
        </h1>
      </div>

      {/* 준비 중 */}
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <span className="text-[48px]">🚗</span>
        <p className="text-[16px] font-semibold text-[#191F28]">커뮤니티 피드</p>
        <p className="text-[14px] text-[#ADB5C0]">곧 오픈 예정입니다</p>
      </div>
    </div>
  )
}

export default HomePage
