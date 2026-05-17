import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyGatheringHistory, getMyBookmarks } from '@/api/gatheringApi'
import type { GatheringSummary } from '@/types/gathering'
import PageLayout from '@/layouts/PageLayout'
import { Users, MapPin, Clock } from 'lucide-react'

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours() < 12 ? '오전' : '오후'} ${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`
}

const GatheringHistoryPage = () => {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'history' | 'bookmarks'>('history')
  const [history, setHistory] = useState<GatheringSummary[]>([])
  const [bookmarks, setBookmarks] = useState<GatheringSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMyGatheringHistory(), getMyBookmarks()])
      .then(([h, b]) => {
        setHistory(h)
        setBookmarks(b)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const list = tab === 'history' ? history : bookmarks
  const emptyMsg = tab === 'history' ? '참여한 벙이 없어요' : '찜한 벙이 없어요'

  return (
    <PageLayout title="벙 히스토리" onBack>
      {/* 탭 */}
      <div className="flex gap-1 mb-3 bg-[#F2F4F6] rounded-xl p-1">
        {(['history', 'bookmarks'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
              tab === t ? 'bg-white text-[#191F28] shadow-sm' : 'text-[#ADB5C0]'
            }`}
          >
            {t === 'history' ? '참여한 벙' : '찜한 벙'}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 pb-24">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />
          ))
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <span className="text-[40px]">🚗</span>
            <p className="text-[14px] text-[#ADB5C0]">{emptyMsg}</p>
          </div>
        ) : (
          list.map(g => (
            <button
              key={g.id}
              onClick={() => navigate(`/gathering/${g.id}`)}
              className="bg-white rounded-2xl px-5 py-4 text-left active:brightness-95 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-bold text-[#191F28] flex-1 truncate">{g.title}</p>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
                  g.status === 'CLOSED' ? 'bg-[#F2F4F6] text-[#ADB5C0]' : 'bg-[#EFF6FF] text-[#3182F6]'
                }`}>
                  {g.status === 'CLOSED' ? '마감' : '모집중'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <MapPin size={11} className="text-[#ADB5C0]" />
                  <span className="text-[11px] text-[#6B7684]">{g.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={11} className="text-[#ADB5C0]" />
                  <span className="text-[11px] text-[#6B7684]">{formatDate(g.gatheringAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={11} className="text-[#ADB5C0]" />
                  <span className="text-[11px] text-[#6B7684]">{g.joinCount}명</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </PageLayout>
  )
}

export default GatheringHistoryPage
