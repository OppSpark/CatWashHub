import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessions } from '@/api/washApi'
import type { WashSession } from '@/types/wash'
import { WASH_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'

const WEATHER_EMOJI: Record<string, string> = {
  SUNNY: '☀️',
  CLOUDY: '☁️',
  RAINY: '🌧️',
  SNOWY: '❄️',
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

const StarRating = ({ rating }: { rating: number | null }) => {
  if (!rating) { return null }
  return (
    <span className="text-[12px] text-[#FFB800]">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

const RecordsPage = () => {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<WashSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PageLayout
      title="세차 기록"
      headerRight={
        <button onClick={() => navigate('/wash/new')} className="text-[14px] text-[#3182F6] font-medium">
          + 새 기록
        </button>
      }
    >
      <div className="pb-24">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <span className="text-[48px]">🚗</span>
            <p className="text-[15px] font-semibold text-[#191F28]">세차 기록이 없어요</p>
            <p className="text-[13px] text-[#ADB5C0]">{WASH_MSGS.EMPTY_RECORDS}</p>
            <button
              onClick={() => navigate('/wash/new')}
              className="mt-2 bg-[#3182F6] text-white rounded-2xl px-6 py-3 text-[14px] font-medium"
            >
              첫 세차 기록 남기기
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => navigate(`/wash/${session.id}`)}
                className="bg-white rounded-2xl px-5 py-4 text-left w-full active:brightness-95 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[15px] font-semibold text-[#191F28]">
                        {session.location ?? '장소 미입력'}
                      </p>
                      {session.weather && (
                        <span className="text-[14px]">{WEATHER_EMOJI[session.weather]}</span>
                      )}
                    </div>
                    <StarRating rating={session.rating} />
                    {session.products.length > 0 && (
                      <p className="text-[12px] text-[#ADB5C0]">
                        용품 {session.products.length}개 사용
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="text-[13px] text-[#6B7684]">{formatDate(session.washedAt)}</p>
                    {session.cost != null && (
                      <p className="text-[12px] text-[#ADB5C0]">
                        {session.cost.toLocaleString()}원
                      </p>
                    )}
                    {session.durationMinutes != null && (
                      <p className="text-[12px] text-[#ADB5C0]">
                        {session.durationMinutes}분
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

export default RecordsPage
