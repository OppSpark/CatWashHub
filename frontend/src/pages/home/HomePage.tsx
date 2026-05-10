import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { getDashboard, getSessions } from '@/api/washApi'
import type { WashDashboard, WashSession } from '@/types/wash'
import { HOME_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const getDaysAgo = (dateStr: string) => {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (diff === 0) { return '오늘' }
  if (diff === 1) { return '어제' }
  return `${diff}일 전`
}

const StarRating = ({ rating }: { rating: number | null }) => {
  if (!rating) { return null }
  return (
    <span className="text-[12px] text-[#FFB800]">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

// ==================== 세차 캘린더 ====================
const WashCalendar = ({ sessions }: { sessions: WashSession[] }) => {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear(y => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  const goNext = () => {
    if (isCurrentMonth) { return }
    if (viewMonth === 11) {
      setViewYear(y => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  const washedDays = new Set(
    sessions
      .filter(s => s.status === 'DONE')
      .map(s => {
        const d = new Date(s.washedAt)
        if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
          return d.getDate()
        }
        return null
      })
      .filter(Boolean)
  )

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }

  return (
    <div className="bg-white rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="p-1 text-[#ADB5C0] active:text-[#191F28]">
            <ChevronLeft size={18} />
          </button>
          <p className="text-[14px] font-semibold text-[#191F28]">
            {viewYear}년 {viewMonth + 1}월
          </p>
          <button
            onClick={goNext}
            disabled={isCurrentMonth}
            className="p-1 text-[#ADB5C0] disabled:opacity-30 active:text-[#191F28]"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <span className="text-[12px] text-[#3182F6] font-medium">{washedDays.size}회</span>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {['일', '월', '화', '수', '목', '금', '토'].map(d => (
          <div key={d} className="text-center text-[11px] text-[#ADB5C0] py-1">{d}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((day, di) => {
            const isToday = isCurrentMonth && day === today.getDate()
            const isWashed = washedDays.has(day)
            return (
              <div key={di} className="flex items-center justify-center py-1">
                {day != null && (
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-medium
                    ${isToday ? 'bg-[#3182F6] text-white' : ''}
                    ${isWashed && !isToday ? 'bg-[#EBF3FF] text-[#3182F6]' : ''}
                    ${!isWashed && !isToday ? 'text-[#191F28]' : ''}
                  `}>
                    {day}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

const HomePage = () => {
  const navigate = useNavigate()
  const nickname = useAuthStore(s => s.nickname)
  const [dashboard, setDashboard] = useState<WashDashboard | null>(null)
  const [sessions, setSessions] = useState<WashSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboard(), getSessions()])
      .then(([dash, sess]) => {
        setDashboard(dash)
        setSessions(sess)
      })
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <PageLayout
      title={`${nickname ?? '세차인'}님의 세차 허브`}
      headerVariant="large"
      headerSubtitle="안녕하세요 👋"
    >
      <div className="flex flex-col gap-3">

        {/* 요약 카드 */}
        <div className="bg-white rounded-2xl px-5 py-4 flex justify-between items-center">
          <div>
            <p className="text-[13px] text-[#6B7684]">총 세차 횟수</p>
            <p className="text-[28px] font-bold text-[#191F28] mt-0.5">
              {isLoading ? '-' : (dashboard?.totalCount ?? 0)}
              <span className="text-[16px] font-medium ml-1">회</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[13px] text-[#6B7684]">마지막 세차</p>
            <p className="text-[16px] font-semibold text-[#191F28] mt-0.5">
              {isLoading ? '-' : (
                dashboard?.lastWashedAt ? getDaysAgo(dashboard.lastWashedAt) : '기록 없음'
              )}
            </p>
          </div>
        </div>

        {/* 세차 시작 버튼 */}
        <button
          onClick={() => navigate('/wash/new')}
          className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold active:brightness-90 transition-all"
        >
          + 세차 준비하기
        </button>

        {/* 진행 중인 세차 */}
        {!isLoading && (dashboard?.preparingSessions.length ?? 0) > 0 && (
          <div className="bg-white rounded-2xl px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
              <p className="text-[15px] font-semibold text-[#191F28]">진행 중인 세차</p>
            </div>
            <div className="flex flex-col gap-2">
              {dashboard!.preparingSessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => navigate(`/wash/${session.id}`)}
                  className="flex items-center justify-between bg-[#FFF4EF] rounded-xl px-4 py-3 text-left active:brightness-95"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-[#191F28]">
                      {session.location ?? '장소 미정'}
                    </p>
                    <p className="text-[12px] text-[#ADB5C0] mt-0.5">
                      용품 {session.productCount}개 · {formatDate(session.washedAt)} 준비
                    </p>
                  </div>
                  <span className="text-[13px] text-[#FF6B35] font-medium">후기 작성 →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 세차 캘린더 */}
        {!isLoading && <WashCalendar sessions={sessions} />}

        {/* 즐겨찾기 용품 세트 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[15px] font-semibold text-[#191F28]">즐겨찾기 세트</p>
            <button onClick={() => navigate('/wash/sets')} className="text-[13px] text-[#3182F6]">
              전체보기
            </button>
          </div>

          {isLoading ? (
            <div className="h-8 bg-[#F2F4F6] rounded-lg animate-pulse" />
          ) : dashboard?.favoriteSets.length ? (
            <div className="flex gap-2 flex-wrap">
              {dashboard.favoriteSets.map(set => (
                <button
                  key={set.id}
                  onClick={() => navigate('/wash/new', { state: { setId: set.id } })}
                  className="flex items-center gap-1.5 bg-[#F2F4F6] rounded-full px-3 py-1.5"
                >
                  {set.isDefault && <span className="w-1.5 h-1.5 rounded-full bg-[#3182F6]" />}
                  <span className="text-[13px] font-medium text-[#191F28]">{set.name}</span>
                  <span className="text-[11px] text-[#ADB5C0]">{set.itemCount}개</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-[13px] text-[#ADB5C0]">{HOME_MSGS.EMPTY_SETS}</p>
              <button
                onClick={() => navigate('/wash/sets/new')}
                className="mt-2 text-[13px] text-[#3182F6] font-medium"
              >
                세트 만들기
              </button>
            </div>
          )}
        </div>

        {/* 최근 세차 기록 (DONE만) */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[15px] font-semibold text-[#191F28]">최근 세차 기록</p>
            <button onClick={() => navigate('/records')} className="text-[13px] text-[#3182F6]">
              전체보기
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-[#F2F4F6] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : dashboard?.recentSessions.length ? (
            <div className="flex flex-col divide-y divide-[#F2F4F6]">
              {dashboard.recentSessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => navigate(`/wash/${session.id}`)}
                  className="flex items-center justify-between py-3 text-left"
                >
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[14px] font-medium text-[#191F28]">
                      {session.location ?? '장소 미입력'}
                    </p>
                    <StarRating rating={session.rating} />
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <p className="text-[13px] text-[#6B7684]">{formatDate(session.washedAt)}</p>
                    {session.cost != null && (
                      <p className="text-[12px] text-[#ADB5C0]">{session.cost.toLocaleString()}원</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-[13px] text-[#ADB5C0]">{HOME_MSGS.EMPTY_RECORDS}</p>
            </div>
          )}
        </div>

      </div>
    </PageLayout>
  )
}

export default HomePage

