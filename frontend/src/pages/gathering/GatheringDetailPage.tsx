import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getGathering, participate, toggleBookmark,
  addComment, deleteComment, closeGathering, deleteGathering, rateUser,
} from '@/api/gatheringApi'
import type { Gathering, ParticipantStatus } from '@/types/gathering'
import PageLayout from '@/layouts/PageLayout'
import { useToast } from '@/hooks/useToast'
import { useAuthStore } from '@/store/authStore'
import { Bookmark, BookmarkCheck, Share2, Users, MapPin, Clock, Send, X, ThumbsUp, ThumbsDown } from 'lucide-react'

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours() < 12 ? '오전' : '오후'} ${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}`
}

const formatCommentTime = (dateStr: string) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) { return '방금' }
  if (diff < 3600) { return `${Math.floor(diff / 60)}분 전` }
  if (diff < 86400) { return `${Math.floor(diff / 3600)}시간 전` }
  return `${d.getMonth() + 1}/${d.getDate()}`
}

const STATUS_LABELS: Record<ParticipantStatus, string> = {
  JOIN: '참여',
  MAYBE: '미정',
  CANCEL: '미참여',
}

const GatheringDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const userId = useAuthStore(s => s.userId)
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)

  const [gathering, setGathering] = useState<Gathering | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [isSendingComment, setIsSendingComment] = useState(false)
  const [showParticipateSheet, setShowParticipateSheet] = useState(false)
  const commentEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) { return }
    getGathering(Number(id))
      .then(setGathering)
      .finally(() => setIsLoading(false))
  }, [id])

  const refresh = async () => {
    if (!id) { return }
    const res = await getGathering(Number(id))
    setGathering(res)
  }

  const handleBookmark = async () => {
    if (!id || !isLoggedIn) { return }
    await toggleBookmark(Number(id))
    await refresh()
  }

  const handleShare = () => {
    const url = `${window.location.origin}/gathering/${id}`
    navigator.clipboard.writeText(url).then(() => toast.success('링크가 복사됐어요'))
  }

  const handleComment = async () => {
    if (!commentText.trim() || !id || isSendingComment) { return }
    setIsSendingComment(true)
    try {
      await addComment(Number(id), commentText.trim())
      setCommentText('')
      await refresh()
      setTimeout(() => commentEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {
      toast.error('댓글 전송에 실패했어요')
    } finally {
      setIsSendingComment(false)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('댓글을 삭제할까요?')) { return }
    await deleteComment(commentId)
    await refresh()
  }

  const handleParticipate = async (status: ParticipantStatus) => {
    if (!id) { return }
    setShowParticipateSheet(false)
    try {
      await participate(Number(id), { status, showPlate: false, showCarInfo: false })
      await refresh()
      toast.success(STATUS_LABELS[status] + '로 변경됐어요')
    } catch {
      toast.error('참여 변경에 실패했어요')
    }
  }

  const handleClose = async () => {
    if (!id || !window.confirm('벙을 마감할까요?')) { return }
    await closeGathering(Number(id))
    await refresh()
    toast.success('벙이 마감됐어요')
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('벙을 삭제할까요?')) { return }
    await deleteGathering(Number(id))
    navigate('/gathering', { replace: true })
    toast.success('벙이 삭제됐어요')
  }

  const handleRate = async (ratedUserId: number, score: 1 | -1) => {
    if (!id) { return }
    try {
      await rateUser(Number(id), ratedUserId, score)
      toast.success('매너 평가 완료')
    } catch {
      toast.error('이미 평가했거나 평가할 수 없어요')
    }
  }

  if (isLoading) { return <PageLayout isLoading /> }
  if (!gathering) { return <PageLayout onBack><p className="text-center py-20 text-[#ADB5C0]">벙을 찾을 수 없어요</p></PageLayout> }

  const isHost = userId != null && gathering.hostId === userId
  const isClosed = gathering.status === 'CLOSED'
  const joinParticipants = gathering.participants.filter(p => p.status === 'JOIN')

  return (
    <PageLayout
      title="세차 벙"
      onBack
      headerRight={
        <div className="flex items-center gap-3">
          <button onClick={handleShare}>
            <Share2 size={18} className="text-[#6B7684]" />
          </button>
          {isLoggedIn && (
            <button onClick={handleBookmark}>
              {gathering.isBookmarked
                ? <BookmarkCheck size={18} className="text-[#3182F6] fill-[#3182F6]" />
                : <Bookmark size={18} className="text-[#6B7684]" />
              }
            </button>
          )}
        </div>
      }
      hasFixedButton={isLoggedIn && !isClosed}
    >
      <div className="flex flex-col gap-3 pb-40">

        {/* 헤더 카드 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h1 className="text-[18px] font-bold text-[#191F28] flex-1">{gathering.title}</h1>
            {isClosed
              ? <span className="text-[11px] bg-[#F2F4F6] text-[#ADB5C0] px-2 py-1 rounded-full font-medium shrink-0">마감</span>
              : <span className="text-[11px] bg-[#EFF6FF] text-[#3182F6] px-2 py-1 rounded-full font-medium shrink-0">모집중</span>
            }
          </div>

          <div className="flex flex-col gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#ADB5C0] shrink-0" />
              <span className="text-[13px] text-[#6B7684]">{formatDate(gathering.gatheringAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#ADB5C0] shrink-0" />
              <div>
                <span className="text-[13px] text-[#6B7684]">{gathering.location}</span>
                {gathering.locationDetail && (
                  <p className="text-[11px] text-[#ADB5C0]">{gathering.locationDetail}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[#ADB5C0] shrink-0" />
              <span className="text-[13px] text-[#6B7684]">
                {gathering.joinCount}명 참여{gathering.maxParticipants != null ? ` / 최대 ${gathering.maxParticipants}명` : ''}
              </span>
            </div>
          </div>

          {gathering.description && (
            <p className="text-[13px] text-[#6B7684] whitespace-pre-wrap">{gathering.description}</p>
          )}
        </div>

        {/* 개설자 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <p className="text-[13px] font-semibold text-[#6B7684] mb-2">벙장</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <span className="text-[14px] font-bold text-[#3182F6]">{gathering.hostNickname[0]}</span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#191F28]">{gathering.hostNickname}</p>
              {gathering.hostMaskedPlate && (
                <p className="text-[12px] text-[#ADB5C0]">{gathering.hostMaskedPlate}</p>
              )}
              {(gathering.hostCarModel || gathering.hostCarColor) && (
                <p className="text-[12px] text-[#ADB5C0]">
                  {[gathering.hostCarModel, gathering.hostCarColor].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>

          {isHost && (
            <div className="flex gap-2 mt-3">
              {!isClosed && (
                <button onClick={handleClose} className="flex-1 py-2 rounded-xl border border-[#E5E8EB] text-[13px] text-[#6B7684]">
                  마감하기
                </button>
              )}
              <button onClick={handleDelete} className="flex-1 py-2 rounded-xl border border-[#FF4D4F] text-[13px] text-[#FF4D4F]">
                삭제하기
              </button>
            </div>
          )}
        </div>

        {/* 참여자 목록 */}
        {joinParticipants.length > 0 && (
          <div className="bg-white rounded-2xl px-5 py-4">
            <p className="text-[13px] font-semibold text-[#6B7684] mb-3">참여자 {joinParticipants.length}명</p>
            <div className="flex flex-col gap-3">
              {joinParticipants.map(p => (
                <div key={p.userId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#F2F4F6] flex items-center justify-center shrink-0">
                      <span className="text-[12px] font-bold text-[#6B7684]">{p.nickname[0]}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#191F28]">{p.nickname}</p>
                      {p.maskedPlate && <p className="text-[11px] text-[#ADB5C0]">{p.maskedPlate}</p>}
                      {(p.carModel || p.carColor) && (
                        <p className="text-[11px] text-[#ADB5C0]">
                          {[p.carModel, p.carColor].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* 매너 평가 (마감된 벙, 본인이 아닌 참여자) */}
                  {isClosed && isLoggedIn && p.userId !== userId && (
                    <div className="flex gap-1.5">
                      <button onClick={() => handleRate(p.userId, 1)} className="p-1.5 rounded-lg bg-[#EFF6FF]">
                        <ThumbsUp size={13} className="text-[#3182F6]" />
                      </button>
                      <button onClick={() => handleRate(p.userId, -1)} className="p-1.5 rounded-lg bg-[#FFF0F0]">
                        <ThumbsDown size={13} className="text-[#FF4D4F]" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 댓글 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <p className="text-[13px] font-semibold text-[#6B7684] mb-3">
            댓글 {gathering.comments.length}개
          </p>
          {gathering.comments.length === 0 ? (
            <p className="text-[13px] text-[#ADB5C0] py-2">첫 댓글을 달아보세요!</p>
          ) : (
            <div className="flex flex-col gap-4">
              {gathering.comments.map(comment => (
                <div key={comment.id} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#F2F4F6] flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-[#6B7684]">{comment.nickname[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[12px] font-semibold text-[#191F28]">{comment.nickname}</span>
                      <span className="text-[11px] text-[#ADB5C0]">{formatCommentTime(comment.createdAt)}</span>
                    </div>
                    <p className="text-[13px] text-[#191F28] whitespace-pre-wrap">{comment.content}</p>
                  </div>
                  {userId === comment.userId && (
                    <button onClick={() => handleDeleteComment(comment.id)} className="shrink-0 p-1">
                      <X size={13} className="text-[#ADB5C0]" />
                    </button>
                  )}
                </div>
              ))}
              <div ref={commentEndRef} />
            </div>
          )}
        </div>

      </div>

      {/* 하단: 참여 버튼 + 댓글 입력 */}
      {isLoggedIn && !isClosed && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#F2F4F6] px-4 py-3 pb-safe flex flex-col gap-2">
          {/* 댓글 입력 */}
          <div className="flex items-center gap-2">
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment() } }}
              placeholder="댓글을 입력하세요..."
              className="flex-1 bg-[#F2F4F6] rounded-xl px-4 py-2.5 text-[14px] outline-none"
            />
            <button
              onClick={handleComment}
              disabled={!commentText.trim() || isSendingComment}
              className="w-10 h-10 bg-[#3182F6] rounded-xl flex items-center justify-center disabled:opacity-40 shrink-0"
            >
              <Send size={15} className="text-white" />
            </button>
          </div>

          {/* 참여 버튼 */}
          {!isHost && (
            <button
              onClick={() => setShowParticipateSheet(true)}
              className={`w-full py-3 rounded-2xl text-[15px] font-semibold ${
                gathering.myStatus === 'JOIN'
                  ? 'bg-[#EFF6FF] text-[#3182F6]'
                  : 'bg-[#3182F6] text-white'
              }`}
            >
              {gathering.myStatus ? `현재: ${STATUS_LABELS[gathering.myStatus]} · 변경하기` : '참여하기'}
            </button>
          )}
        </div>
      )}

      {/* 참여 선택 시트 */}
      {showParticipateSheet && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowParticipateSheet(false)} />
          <div className="relative w-full max-w-[480px] mx-auto bg-white rounded-t-3xl px-5 py-6 flex flex-col gap-3 pb-safe">
            <p className="text-[16px] font-bold text-[#191F28] mb-1">참여 여부 선택</p>
            {(['JOIN', 'MAYBE', 'CANCEL'] as ParticipantStatus[]).map(status => (
              <button
                key={status}
                onClick={() => handleParticipate(status)}
                className={`w-full py-3.5 rounded-2xl text-[15px] font-semibold border transition-colors
                  ${gathering.myStatus === status
                    ? 'bg-[#3182F6] text-white border-[#3182F6]'
                    : 'bg-white text-[#191F28] border-[#E5E8EB]'
                  }`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  )
}

export default GatheringDetailPage
