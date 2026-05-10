import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPost, getMyWashSessions } from '@/api/boardApi'
import type { WashSessionEmbed } from '@/types/board'
import { useToast } from '@/hooks/useToast'
import { BOARD_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'
import { MessageSquare, ClipboardList, Star, MapPin, Clock, ChevronDown, ChevronUp, Check, BookOpen } from 'lucide-react'

type PostType = 'FREE' | 'WASH_LOG'

const WEATHER_LABEL: Record<string, string> = {
  SUNNY: '☀️ 맑음',
  CLOUDY: '☁️ 흐림',
  RAINY: '🌧️ 비',
  SNOWY: '❄️ 눈',
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

// ==================== 세차기록 선택 카드 ====================
const WashSessionCard = ({
  session,
  selected,
  onSelect,
}: {
  session: WashSessionEmbed
  selected: boolean
  onSelect: () => void
}) => (
  <button
    onClick={onSelect}
    className={`w-full text-left rounded-2xl border-2 px-4 py-3 transition-all ${
      selected ? 'border-[#3182F6] bg-[#EFF6FF]' : 'border-[#F2F4F6] bg-white'
    }`}
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-[14px] font-semibold text-[#191F28]">{formatDate(session.washedAt)}</span>
      <div className="flex items-center gap-1">
        {session.rating && (
          <span className="flex items-center gap-0.5 text-[12px] text-[#F59E0B]">
            <Star size={11} fill="#F59E0B" />
            {session.rating}
          </span>
        )}
        {selected && <Check size={14} className="text-[#3182F6] ml-1" />}
      </div>
    </div>
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {session.location && (
        <span className="flex items-center gap-1 text-[12px] text-[#6B7684]">
          <MapPin size={11} />
          {session.location}
        </span>
      )}
      {session.durationMinutes && (
        <span className="flex items-center gap-1 text-[12px] text-[#6B7684]">
          <Clock size={11} />
          {session.durationMinutes}분
        </span>
      )}
      {session.weather && (
        <span className="text-[12px] text-[#6B7684]">{WEATHER_LABEL[session.weather] ?? session.weather}</span>
      )}
    </div>
    {session.productNames.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-2">
        {session.productNames.slice(0, 4).map((name, i) => (
          <span key={i} className="text-[11px] bg-[#F2F4F6] text-[#6B7684] px-2 py-0.5 rounded-full">
            {name}
          </span>
        ))}
        {session.productNames.length > 4 && (
          <span className="text-[11px] text-[#ADB5C0]">+{session.productNames.length - 4}</span>
        )}
      </div>
    )}
    {session.recipeTitle && (
      <div className="flex items-center gap-1.5 mt-2">
        <BookOpen size={11} className="text-[#3182F6]" />
        <span className="text-[11px] text-[#3182F6] font-medium truncate">{session.recipeTitle}</span>
      </div>
    )}
  </button>
)

// ==================== 메인 ====================
const BoardNewPage = () => {
  const navigate = useNavigate()
  const toast = useToast()

  const [postType, setPostType] = useState<PostType>('FREE')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // 세차일지 선택
  const [washSessions, setWashSessions] = useState<WashSessionEmbed[]>([])
  const [selectedSession, setSelectedSession] = useState<WashSessionEmbed | null>(null)
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)
  const [showSessionList, setShowSessionList] = useState(false)

  useEffect(() => {
    if (postType === 'WASH_LOG' && washSessions.length === 0) {
      setIsLoadingSessions(true)
      getMyWashSessions()
        .then(setWashSessions)
        .finally(() => setIsLoadingSessions(false))
    }
  }, [postType])

  const handleTypeSelect = (type: PostType) => {
    setPostType(type)
    setSelectedSession(null)
    setShowSessionList(false)
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || isSaving) { return }
    if (postType === 'WASH_LOG' && !selectedSession) {
      toast.error('세차 기록을 선택해주세요.')
      return
    }
    setIsSaving(true)
    try {
      const post = await createPost({
        postType,
        washSessionId: selectedSession?.id ?? null,
        title: title.trim(),
        content: content.trim(),
      })
      toast.success(BOARD_MSGS.POST_CREATED)
      navigate(`/board/${post.id}`, { replace: true })
    } catch {
      toast.error(BOARD_MSGS.POST_SAVE_ERROR)
      setIsSaving(false)
    }
  }

  const canSubmit = title.trim() && content.trim() && (postType === 'FREE' || selectedSession !== null)

  return (
    <PageLayout title="글쓰기" onBack={true} hasFixedButton>
      <div className="flex flex-col gap-3">

        {/* 글 유형 선택 */}
        <div className="bg-white rounded-2xl px-4 py-3">
          <p className="text-[12px] font-medium text-[#ADB5C0] mb-2">글 유형</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleTypeSelect('FREE')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-[14px] font-medium transition-all ${
                postType === 'FREE'
                  ? 'border-[#3182F6] text-[#3182F6] bg-[#EFF6FF]'
                  : 'border-[#F2F4F6] text-[#6B7684] bg-white'
              }`}
            >
              <MessageSquare size={15} />
              자유글
            </button>
            <button
              onClick={() => handleTypeSelect('WASH_LOG')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-[14px] font-medium transition-all ${
                postType === 'WASH_LOG'
                  ? 'border-[#3182F6] text-[#3182F6] bg-[#EFF6FF]'
                  : 'border-[#F2F4F6] text-[#6B7684] bg-white'
              }`}
            >
              <ClipboardList size={15} />
              세차일지
            </button>
          </div>
        </div>

        {/* 세차기록 선택 (WASH_LOG만) */}
        {postType === 'WASH_LOG' && (
          <div className="bg-white rounded-2xl px-4 py-3">
            <p className="text-[12px] font-medium text-[#ADB5C0] mb-2">세차 기록 첨부</p>
            {isLoadingSessions ? (
              <div className="py-6 text-center text-[13px] text-[#ADB5C0]">불러오는 중...</div>
            ) : washSessions.length === 0 ? (
              <div className="py-6 text-center text-[13px] text-[#ADB5C0]">완료된 세차 기록이 없어요</div>
            ) : (
              <>
                {/* 선택된 기록 표시 */}
                {selectedSession ? (
                  <div className="flex flex-col gap-2">
                    <WashSessionCard
                      session={selectedSession}
                      selected={true}
                      onSelect={() => setShowSessionList(v => !v)}
                    />
                    <button
                      onClick={() => setShowSessionList(v => !v)}
                      className="flex items-center justify-center gap-1 text-[13px] text-[#3182F6] py-1"
                    >
                      {showSessionList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {showSessionList ? '목록 닫기' : '다른 기록 선택'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSessionList(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-dashed border-[#D1D6DB] text-[13px] text-[#ADB5C0]"
                  >
                    <span>세차 기록을 선택해주세요</span>
                    {showSessionList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}

                {/* 기록 목록 */}
                {showSessionList && (
                  <div className="flex flex-col gap-2 mt-2 max-h-72 overflow-y-auto">
                    {washSessions.map(session => (
                      <WashSessionCard
                        key={session.id}
                        session={session}
                        selected={selectedSession?.id === session.id}
                        onSelect={() => {
                          setSelectedSession(session)
                          setShowSessionList(false)
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* 제목 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={BOARD_MSGS.PLACEHOLDER_TITLE}
            maxLength={200}
            className="w-full text-[16px] font-semibold text-[#191F28] outline-none placeholder:text-[#ADB5C0]"
          />
        </div>

        {/* 내용 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={BOARD_MSGS.PLACEHOLDER_CONTENT}
            rows={12}
            className="w-full text-[14px] text-[#191F28] outline-none resize-none placeholder:text-[#ADB5C0]"
          />
        </div>

      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#F2F4F6] px-4 py-4 pb-safe">
        <button
          onClick={handleSubmit}
          disabled={isSaving || !canSubmit}
          className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold disabled:opacity-40"
        >
          {isSaving ? '등록 중...' : '등록'}
        </button>
      </div>
    </PageLayout>
  )
}

export default BoardNewPage
