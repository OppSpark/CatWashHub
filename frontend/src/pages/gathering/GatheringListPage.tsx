import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGatherings } from '@/api/gatheringApi'
import type { GatheringSummary } from '@/types/gathering'
import PageLayout from '@/layouts/PageLayout'
import { Plus, Bookmark, Users, MapPin, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const formatGatheringDate = (dateStr: string) => {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const min = String(d.getMinutes()).padStart(2, '0')
  const ampm = hour < 12 ? '오전' : '오후'
  const h = hour % 12 || 12
  return `${month}/${day} ${ampm} ${h}:${min}`
}

const GatheringCard = ({ g, onClick }: { g: GatheringSummary; onClick: () => void }) => {
  const isClosed = g.status === 'CLOSED'
  const isFull = g.maxParticipants != null && g.joinCount >= g.maxParticipants

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl px-5 py-4 text-left active:brightness-95 flex flex-col gap-2"
    >
      <div className="flex items-start justify-between gap-2">
        <p className={`text-[15px] font-bold flex-1 ${isClosed ? 'text-[#ADB5C0]' : 'text-[#191F28]'}`}>
          {g.title}
        </p>
        <div className="flex items-center gap-1.5 shrink-0">
          {g.isBookmarked && <Bookmark size={13} className="text-[#3182F6] fill-[#3182F6]" />}
          {isClosed ? (
            <span className="text-[11px] bg-[#F2F4F6] text-[#ADB5C0] px-2 py-0.5 rounded-full font-medium">마감</span>
          ) : isFull ? (
            <span className="text-[11px] bg-[#FFF0F0] text-[#FF4D4F] px-2 py-0.5 rounded-full font-medium">만원</span>
          ) : (
            <span className="text-[11px] bg-[#EFF6FF] text-[#3182F6] px-2 py-0.5 rounded-full font-medium">모집중</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-[#ADB5C0] shrink-0" />
          <span className="text-[12px] text-[#6B7684] truncate">{g.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-[#ADB5C0] shrink-0" />
          <span className="text-[12px] text-[#6B7684]">{formatGatheringDate(g.gatheringAt)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1">
        <span className="text-[12px] text-[#ADB5C0]">{g.hostNickname}</span>
        <div className="flex items-center gap-1">
          <Users size={12} className="text-[#6B7684]" />
          <span className="text-[12px] text-[#6B7684] font-medium">
            {g.joinCount}{g.maxParticipants != null ? `/${g.maxParticipants}` : ''}명
          </span>
        </div>
      </div>
    </button>
  )
}

const GatheringListPage = () => {
  const navigate = useNavigate()
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  const [gatherings, setGatherings] = useState<GatheringSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)

  const loadGatherings = useCallback(async (p: number) => {
    try {
      const res = await getGatherings(p)
      if (p === 0) {
        setGatherings(res.content)
      } else {
        setGatherings(prev => [...prev, ...res.content])
      }
      setHasMore(!res.last)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGatherings(0)
  }, [loadGatherings])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    loadGatherings(next)
  }

  return (
    <PageLayout
      title="세차 벙"
      headerVariant="large"
      headerSubtitle="같이 세차해요 🚗"
      headerRight={
        isLoggedIn ? (
          <button
            onClick={() => navigate('/gathering/new')}
            className="flex items-center gap-1 text-[14px] text-[#3182F6] font-semibold"
          >
            <Plus size={16} />
            벙 열기
          </button>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3 pb-24">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl px-5 py-4 h-28 animate-pulse" />
          ))
        ) : gatherings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-[48px]">🚗</span>
            <p className="text-[15px] font-semibold text-[#191F28]">아직 벙이 없어요</p>
            <p className="text-[13px] text-[#ADB5C0]">첫 번째 세차 벙을 열어보세요!</p>
            {isLoggedIn && (
              <button
                onClick={() => navigate('/gathering/new')}
                className="mt-2 px-5 py-2.5 bg-[#3182F6] text-white rounded-2xl text-[14px] font-semibold"
              >
                벙 열기
              </button>
            )}
          </div>
        ) : (
          <>
            {gatherings.map(g => (
              <GatheringCard key={g.id} g={g} onClick={() => navigate(`/gathering/${g.id}`)} />
            ))}
            {hasMore && (
              <button onClick={loadMore} className="text-[13px] text-[#3182F6] py-3 text-center">
                더 보기
              </button>
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}

export default GatheringListPage
