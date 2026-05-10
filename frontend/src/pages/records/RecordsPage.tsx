import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessions } from '@/api/washApi'
import type { WashSession } from '@/types/wash'
import { WASH_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'
import BottomSheet from '@/components/BottomSheet'
import { SlidersHorizontal, Search, X } from 'lucide-react'

const WEATHER_EMOJI: Record<string, string> = {
  SUNNY: '☀️',
  CLOUDY: '☁️',
  RAINY: '🌧️',
  SNOWY: '❄️',
}

type SortType = 'latest' | 'rating' | 'cost'
type CostRange = 'all' | 'under1' | 'under3' | 'over3'

interface FilterState {
  weather: string[]
  rating: number | null
  costRange: CostRange
  sort: SortType
}

const DEFAULT_FILTER: FilterState = {
  weather: [],
  rating: null,
  costRange: 'all',
  sort: 'latest',
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}


const RecordsPage = () => {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<WashSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER)
  const [pendingFilter, setPendingFilter] = useState<FilterState>(DEFAULT_FILTER)

  useEffect(() => {
    getSessions()
      .then(setSessions)
      .finally(() => setIsLoading(false))
  }, [])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filter.weather.length > 0) { count++ }
    if (filter.rating !== null) { count++ }
    if (filter.costRange !== 'all') { count++ }
    if (filter.sort !== 'latest') { count++ }
    return count
  }, [filter])

  const filteredSessions = useMemo(() => {
    let result = sessions.filter(s => s.status === 'DONE')

    // 키워드 검색 (장소 OR 용품명)
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase()
      result = result.filter(s =>
        s.location?.toLowerCase().includes(kw) ||
        s.products.some(p => p.productName.toLowerCase().includes(kw))
      )
    }

    // 날씨 필터
    if (filter.weather.length > 0) {
      result = result.filter(s => s.weather && filter.weather.includes(s.weather))
    }

    // 별점 필터
    if (filter.rating !== null) {
      result = result.filter(s => s.rating !== null && s.rating >= filter.rating!)
    }

    // 비용 필터
    if (filter.costRange !== 'all') {
      result = result.filter(s => {
        if (s.cost == null) { return false }
        if (filter.costRange === 'under1') { return s.cost < 10000 }
        if (filter.costRange === 'under3') { return s.cost < 30000 }
        if (filter.costRange === 'over3') { return s.cost >= 30000 }
        return true
      })
    }

    // 정렬
    if (filter.sort === 'rating') {
      result = [...result].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    } else if (filter.sort === 'cost') {
      result = [...result].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0))
    }

    return result
  }, [sessions, keyword, filter])

  const openFilter = () => {
    setPendingFilter(filter)
    setShowFilter(true)
  }

  const applyFilter = () => {
    setFilter(pendingFilter)
    setShowFilter(false)
  }

  const resetFilter = () => {
    setPendingFilter(DEFAULT_FILTER)
  }

  const toggleWeather = (w: string) => {
    setPendingFilter(prev => ({
      ...prev,
      weather: prev.weather.includes(w)
        ? prev.weather.filter(x => x !== w)
        : [...prev.weather, w],
    }))
  }

  return (
    <PageLayout
      title="세차 기록"
      headerRight={
        <button onClick={() => navigate('/wash/new')} className="text-[14px] text-[#3182F6] font-medium">
          + 새 기록
        </button>
      }
      noPadding
    >
      <div className="pb-24">

        {/* 검색 + 필터 바 */}
        <div className="px-4 pt-4 flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2.5">
            <Search size={16} className="text-[#ADB5C0] shrink-0" />
            <input
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="장소 또는 용품 검색"
              className="flex-1 text-[14px] text-[#191F28] outline-none placeholder:text-[#C8D0DA]"
            />
            {keyword && (
              <button onClick={() => setKeyword('')}>
                <X size={14} className="text-[#ADB5C0]" />
              </button>
            )}
          </div>
          <button
            onClick={openFilter}
            className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors
              ${activeFilterCount > 0 ? 'bg-[#3182F6] text-white' : 'bg-white text-[#6B7684]'}`}
          >
            <SlidersHorizontal size={15} />
            필터
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF4D4F] rounded-full text-white text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* 결과 카운트 */}
        {!isLoading && (keyword || activeFilterCount > 0) && (
          <p className="px-4 pt-2 text-[12px] text-[#ADB5C0]">
            {filteredSessions.length}개의 기록
          </p>
        )}

        {/* 목록 */}
        <div className="px-4 pt-3">
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <span className="text-[48px]">🚗</span>
              <p className="text-[15px] font-semibold text-[#191F28]">
                {sessions.filter(s => s.status === 'DONE').length === 0 ? '세차 기록이 없어요' : '검색 결과가 없어요'}
              </p>
              <p className="text-[13px] text-[#ADB5C0]">{WASH_MSGS.EMPTY_RECORDS}</p>
              {sessions.filter(s => s.status === 'DONE').length === 0 && (
                <button
                  onClick={() => navigate('/wash/new')}
                  className="mt-2 bg-[#3182F6] text-white rounded-2xl px-6 py-3 text-[14px] font-medium"
                >
                  첫 세차 기록 남기기
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredSessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => navigate(`/wash/${session.id}`)}
                  className="bg-white rounded-2xl px-5 py-4 text-left w-full active:brightness-95 transition-all"
                >
                  {/* 날짜 + 날씨 */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] text-[#ADB5C0]">{formatDate(session.washedAt)}</span>
                    {session.weather && (
                      <span className="text-[18px]">{WEATHER_EMOJI[session.weather]}</span>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[16px] font-bold text-[#191F28]">
                        {session.location ?? '장소 미입력'}
                      </p>
                      {session.rating != null && (
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-[14px] ${s <= session.rating! ? 'text-[#FFB800]' : 'text-[#E5E8EB]'}`}>★</span>
                          ))}
                        </div>
                      )}
                      {session.products.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {session.products.slice(0, 3).map(p => (
                            <span key={p.id} className="bg-[#F2F4F6] text-[#6B7684] text-[11px] rounded-full px-2 py-0.5">{p.productName}</span>
                          ))}
                          {session.products.length > 3 && (
                            <span className="text-[11px] text-[#ADB5C0]">+{session.products.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {session.cost != null && (
                        <p className="text-[13px] font-medium text-[#191F28]">{session.cost.toLocaleString()}원</p>
                      )}
                      {session.durationMinutes != null && (
                        <p className="text-[12px] text-[#ADB5C0]">{session.durationMinutes}분</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomSheet
        open={showFilter}
        onClose={() => setShowFilter(false)}
        title="필터"
        footer={
          <button
            onClick={applyFilter}
            className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold"
          >
            필터 적용
          </button>
        }
      >
        <div className="flex flex-col gap-5 pb-2">

          {/* 초기화 버튼 */}
          <div className="flex justify-end -mt-1">
            <button onClick={resetFilter} className="text-[13px] text-[#ADB5C0]">초기화</button>
          </div>

          {/* 날씨 */}
          <div>
            <p className="text-[13px] font-semibold text-[#6B7684] mb-2.5">날씨</p>
            <div className="flex gap-2">
              {Object.entries(WEATHER_EMOJI).map(([key, emoji]) => (
                <button
                  key={key}
                  onClick={() => toggleWeather(key)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-colors
                    ${pendingFilter.weather.includes(key) ? 'border-[#3182F6] bg-[#EBF3FF]' : 'border-[#E5E8EB]'}`}
                >
                  <span className="text-[20px]">{emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 별점 */}
          <div>
            <p className="text-[13px] font-semibold text-[#6B7684] mb-2.5">최소 별점</p>
            <div className="flex gap-2">
              {[null, 1, 2, 3, 4, 5].map(star => (
                <button
                  key={star ?? 'all'}
                  onClick={() => setPendingFilter(prev => ({ ...prev, rating: star }))}
                  className={`flex-1 py-2 rounded-xl border text-[13px] font-medium transition-colors
                    ${pendingFilter.rating === star ? 'border-[#3182F6] bg-[#EBF3FF] text-[#3182F6]' : 'border-[#E5E8EB] text-[#6B7684]'}`}
                >
                  {star === null ? '전체' : `${star}★`}
                </button>
              ))}
            </div>
          </div>

          {/* 비용 */}
          <div>
            <p className="text-[13px] font-semibold text-[#6B7684] mb-2.5">비용</p>
            <div className="grid grid-cols-4 gap-2">
              {([
                { value: 'all', label: '전체' },
                { value: 'under1', label: '1만원↓' },
                { value: 'under3', label: '3만원↓' },
                { value: 'over3', label: '3만원↑' },
              ] as { value: CostRange; label: string }[]).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPendingFilter(prev => ({ ...prev, costRange: value }))}
                  className={`py-2 rounded-xl border text-[13px] font-medium transition-colors
                    ${pendingFilter.costRange === value ? 'border-[#3182F6] bg-[#EBF3FF] text-[#3182F6]' : 'border-[#E5E8EB] text-[#6B7684]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 정렬 */}
          <div>
            <p className="text-[13px] font-semibold text-[#6B7684] mb-2.5">정렬</p>
            <div className="flex gap-2">
              {([
                { value: 'latest', label: '최신순' },
                { value: 'rating', label: '별점순' },
                { value: 'cost', label: '비용순' },
              ] as { value: SortType; label: string }[]).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setPendingFilter(prev => ({ ...prev, sort: value }))}
                  className={`flex-1 py-2.5 rounded-xl border text-[13px] font-medium transition-colors
                    ${pendingFilter.sort === value ? 'border-[#3182F6] bg-[#EBF3FF] text-[#3182F6]' : 'border-[#E5E8EB] text-[#6B7684]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </BottomSheet>
    </PageLayout>
  )
}

export default RecordsPage
