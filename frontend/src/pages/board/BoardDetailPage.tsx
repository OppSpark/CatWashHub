import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPost, getComments, deletePost, toggleLike, createComment, updateComment, deleteComment } from '@/api/boardApi'
import type { Post, Comment, WashSessionEmbed } from '@/types/board'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { BOARD_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'
import LoginPromptSheet from '@/components/LoginPromptSheet'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Heart, MessageSquare, Eye, Send, ChevronRight, CornerDownRight, ClipboardList, MapPin, Clock, Star, Droplets, BookOpen } from 'lucide-react'

const WEATHER_LABEL: Record<string, string> = {
  SUNNY: '☀️ 맑음',
  CLOUDY: '☁️ 흐림',
  RAINY: '🌧️ 비',
  SNOWY: '❄️ 눈',
}

// ==================== 세차일지 임베드 카드 ====================
const WashLogCard = ({ session }: { session: WashSessionEmbed }) => {
  const navigate = useNavigate()
  const date = new Date(session.washedAt)
  const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`

  return (
    <div className="bg-[#F0F6FF] border border-[#BFDBFE] rounded-2xl px-4 py-4 mb-4">
      <div className="flex items-center gap-1.5 mb-3">
        <ClipboardList size={14} className="text-[#3182F6]" />
        <span className="text-[12px] font-semibold text-[#3182F6]">첨부된 세차일지</span>
        <span className="text-[12px] text-[#6B7684] ml-auto">{dateStr}</span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
        {session.location && (
          <span className="flex items-center gap-1 text-[13px] text-[#191F28]">
            <MapPin size={12} className="text-[#6B7684]" />
            {session.location}
          </span>
        )}
        {session.durationMinutes && (
          <span className="flex items-center gap-1 text-[13px] text-[#191F28]">
            <Clock size={12} className="text-[#6B7684]" />
            {session.durationMinutes}분
          </span>
        )}
        {session.cost && (
          <span className="flex items-center gap-1 text-[13px] text-[#191F28]">
            <Droplets size={12} className="text-[#6B7684]" />
            {session.cost.toLocaleString()}원
          </span>
        )}
        {session.rating && (
          <span className="flex items-center gap-1 text-[13px] text-[#F59E0B]">
            <Star size={12} fill="#F59E0B" />
            {session.rating} / 5
          </span>
        )}
        {session.weather && (
          <span className="text-[13px] text-[#191F28]">{WEATHER_LABEL[session.weather] ?? session.weather}</span>
        )}
      </div>

      {session.productNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {session.productNames.map((name, i) => (
            <span key={i} className="text-[11px] bg-white border border-[#BFDBFE] text-[#3182F6] px-2.5 py-1 rounded-full">
              {name}
            </span>
          ))}
        </div>
      )}

      {session.recipeId && session.recipeTitle && (
        <button
          onClick={() => navigate(`/recipe/${session.recipeId}`)}
          className="w-full flex items-center gap-1.5 mt-2.5 border-t border-[#BFDBFE] pt-2.5 text-left active:opacity-70"
        >
          <BookOpen size={12} className="text-[#3182F6] shrink-0" />
          <span className="text-[12px] text-[#3182F6] font-medium truncate">{session.recipeTitle}</span>
          <ChevronRight size={11} className="text-[#3182F6] shrink-0 ml-auto" />
        </button>
      )}

      {session.memo && (
        <p className="mt-2.5 text-[12px] text-[#6B7684] leading-relaxed border-t border-[#BFDBFE] pt-2.5">
          {session.memo}
        </p>
      )}
    </div>
  )
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

const formatRelative = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) { return '방금 전' }
  if (diff < 3600) { return `${Math.floor(diff / 60)}분 전` }
  if (diff < 86400) { return `${Math.floor(diff / 3600)}시간 전` }
  return formatDate(dateStr)
}

// ==================== 댓글 액션 메뉴 ====================
interface CommentActions {
  onEdit: (commentId: number, content: string) => void
  onDelete: (commentId: number) => void
  onReply: (commentId: number, nickname: string) => void
}

// ==================== 단일 댓글 아이템 ====================
const CommentRow = ({
  comment,
  currentUserId,
  isReply,
  actions,
  editingId,
  editText,
  onEditTextChange,
  onEditSubmit,
  onEditCancel,
}: {
  comment: Comment
  currentUserId: number | null
  isReply: boolean
  actions: CommentActions
  editingId: number | null
  editText: string
  onEditTextChange: (v: string) => void
  onEditSubmit: () => void
  onEditCancel: () => void
}) => {
  const isOwner = currentUserId === comment.authorId
  const isEditing = editingId === comment.id

  return (
    <div className={`py-3 ${isReply ? 'pl-4' : ''}`}>
      {isReply && (
        <CornerDownRight size={12} className="text-[#ADB5C0] mb-1.5" />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {isReply && (
              <span className="text-[11px] text-[#ADB5C0] font-medium">@{comment.authorNickname}</span>
            )}
            {!isReply && (
              <span className="text-[13px] font-semibold text-[#191F28]">{comment.authorNickname}</span>
            )}
            <span className="text-[11px] text-[#ADB5C0]">{formatRelative(comment.createdAt)}</span>
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-2 mt-1">
              <textarea
                value={editText}
                onChange={e => onEditTextChange(e.target.value)}
                rows={3}
                autoFocus
                className="w-full bg-[#F2F4F6] rounded-xl px-3 py-2 text-[13px] text-[#191F28] outline-none resize-none"
              />
              <div className="flex items-center gap-2 justify-end">
                <button onClick={onEditCancel} className="text-[12px] text-[#ADB5C0] px-3 py-1.5">
                  취소
                </button>
                <button
                  onClick={onEditSubmit}
                  disabled={!editText.trim()}
                  className="text-[12px] font-medium text-white bg-[#3182F6] px-3 py-1.5 rounded-lg disabled:opacity-40"
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[14px] text-[#191F28] whitespace-pre-wrap leading-relaxed">{comment.content}</p>
          )}

          {!isEditing && (
            <div className="flex items-center gap-3 mt-1.5">
              {!isReply && (
                <button
                  onClick={() => actions.onReply(comment.id, comment.authorNickname)}
                  className="text-[12px] text-[#3182F6] font-medium"
                >
                  답글
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    onClick={() => actions.onEdit(comment.id, comment.content)}
                    className="text-[12px] text-[#6B7684]"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => actions.onDelete(comment.id)}
                    className="text-[12px] text-[#ADB5C0]"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== 댓글 + 대댓글 그룹 ====================
const CommentGroup = ({
  comment,
  currentUserId,
  actions,
  editingId,
  editText,
  onEditTextChange,
  onEditSubmit,
  onEditCancel,
}: {
  comment: Comment
  currentUserId: number | null
  actions: CommentActions
  editingId: number | null
  editText: string
  onEditTextChange: (v: string) => void
  onEditSubmit: () => void
  onEditCancel: () => void
}) => {
  const [showReplies, setShowReplies] = useState(true)

  return (
    <div className="border-b border-[#F2F4F6] last:border-b-0">
      <CommentRow
        comment={comment}
        currentUserId={currentUserId}
        isReply={false}
        actions={actions}
        editingId={editingId}
        editText={editText}
        onEditTextChange={onEditTextChange}
        onEditSubmit={onEditSubmit}
        onEditCancel={onEditCancel}
      />

      {comment.replies.length > 0 && (
        <div className="pl-4 pb-1">
          <button
            onClick={() => setShowReplies(v => !v)}
            className="flex items-center gap-1 text-[12px] text-[#ADB5C0] mb-1"
          >
            <ChevronRight size={12} className={`transition-transform ${showReplies ? 'rotate-90' : ''}`} />
            답글 {comment.replies.length}개
          </button>

          {showReplies && (
            <div className="border-l-2 border-[#F2F4F6] pl-3">
              {comment.replies.map(reply => (
                <CommentRow
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  isReply={true}
                  actions={actions}
                  editingId={editingId}
                  editText={editText}
                  onEditTextChange={onEditTextChange}
                  onEditSubmit={onEditSubmit}
                  onEditCancel={onEditCancel}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ==================== 메인 페이지 ====================
const BoardDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const toast = useToast()
  const userId = useAuthStore(s => s.userId)
  const { showLoginSheet, setShowLoginSheet } = useRequireAuth()

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  // 댓글 입력
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: number; nickname: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null)

  // 인라인 수정
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    if (!id) { return }
    Promise.all([getPost(Number(id)), getComments(Number(id))])
      .then(([p, c]) => {
        setPost(p)
        setComments(c)
      })
      .finally(() => setIsLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!id || !window.confirm(BOARD_MSGS.CONFIRM_DELETE_POST)) { return }
    setIsDeleting(true)
    try {
      await deletePost(Number(id))
      toast.success(BOARD_MSGS.POST_DELETED)
      navigate('/board', { replace: true })
    } catch {
      toast.error(BOARD_MSGS.POST_DELETE_ERROR)
      setIsDeleting(false)
    }
  }

  const handleLike = async () => {
    if (!id || !post) { return }
    try {
      const liked = await toggleLike(Number(id))
      setPost(prev => prev ? {
        ...prev,
        likedByMe: liked,
        likeCount: liked ? prev.likeCount + 1 : prev.likeCount - 1,
      } : prev)
    } catch {
      toast.error('오류가 발생했어요.')
    }
  }

  const handleReply = (commentId: number, nickname: string) => {
    setReplyTo({ id: commentId, nickname })
    setCommentText('')
    setTimeout(() => commentInputRef.current?.focus(), 50)
  }

  const cancelReply = () => {
    setReplyTo(null)
    setCommentText('')
  }

  const handleSubmitComment = async () => {
    if (!id || !commentText.trim() || isSubmitting) { return }
    setIsSubmitting(true)
    try {
      const newComment = await createComment(Number(id), {
        parentId: replyTo?.id ?? null,
        content: commentText.trim(),
      })
      if (replyTo) {
        setComments(prev => prev.map(c =>
          c.id === replyTo.id
            ? { ...c, replies: [...c.replies, newComment] }
            : c
        ))
      } else {
        setComments(prev => [...prev, { ...newComment, replies: [] }])
      }
      setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev)
      setCommentText('')
      setReplyTo(null)
      toast.success(BOARD_MSGS.COMMENT_CREATED)
    } catch {
      toast.error(BOARD_MSGS.COMMENT_SAVE_ERROR)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditStart = (commentId: number, content: string) => {
    setEditingId(commentId)
    setEditText(content)
  }

  const handleEditSubmit = async () => {
    if (!editingId || !editText.trim()) { return }
    try {
      const updated = await updateComment(editingId, editText.trim())
      setComments(prev => prev.map(c => {
        if (c.id === editingId) { return { ...c, content: updated.content } }
        return {
          ...c,
          replies: c.replies.map(r => r.id === editingId ? { ...r, content: updated.content } : r)
        }
      }))
      setEditingId(null)
      setEditText('')
    } catch {
      toast.error('수정 중 오류가 발생했어요.')
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm(BOARD_MSGS.CONFIRM_DELETE_COMMENT)) { return }
    try {
      await deleteComment(commentId)
      setComments(prev =>
        prev
          .filter(c => c.id !== commentId)
          .map(c => ({ ...c, replies: c.replies.filter(r => r.id !== commentId) }))
      )
      setPost(prev => prev ? { ...prev, commentCount: prev.commentCount - 1 } : prev)
      toast.success(BOARD_MSGS.COMMENT_DELETED)
    } catch {
      toast.error('삭제 중 오류가 발생했어요.')
    }
  }

  const commentActions: CommentActions = {
    onEdit: handleEditStart,
    onDelete: handleDeleteComment,
    onReply: handleReply,
  }

  const isOwner = post && userId === post.authorId

  if (isLoading) {
    return <PageLayout isLoading />
  }

  if (!post) {
    return (
      <PageLayout onBack={true}>
        <div className="flex items-center justify-center py-32">
          <p className="text-[14px] text-[#ADB5C0]">게시글을 찾을 수 없어요</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="자유게시판"
      onBack={true}
      hasFixedButton
      headerRight={
        isOwner ? (
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/board/${id}/edit`)} className="text-[14px] text-[#3182F6]">수정</button>
            <button onClick={handleDelete} disabled={isDeleting} className="text-[14px] text-[#FF4D4F] disabled:opacity-50">삭제</button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3 pb-40">

        {/* 게시글 본문 */}
        <div className="bg-white rounded-2xl px-5 py-5">
          <h1 className="text-[18px] font-bold text-[#191F28] mb-2 leading-snug">{post.title}</h1>

          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-[#F2F4F6]">
            <div className="w-7 h-7 bg-[#3182F6] rounded-full flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white">{post.authorNickname.charAt(0)}</span>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#191F28]">{post.authorNickname}</p>
              <p className="text-[11px] text-[#ADB5C0]">{formatDate(post.createdAt)}</p>
            </div>
            {post.postType === 'WASH_LOG' && (
              <span className="ml-auto flex items-center gap-0.5 text-[10px] font-semibold text-[#3182F6] bg-[#EFF6FF] px-1.5 py-0.5 rounded-md">
                <ClipboardList size={9} />
                세차일지
              </span>
            )}
          </div>

          {/* 세차일지 첨부 카드 */}
          {post.postType === 'WASH_LOG' && post.washSession && (
            <WashLogCard session={post.washSession} />
          )}

          <p className="text-[15px] text-[#191F28] whitespace-pre-wrap leading-[1.7]">{post.content}</p>

          {/* 반응 */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[#F2F4F6]">
            <span className="flex items-center gap-1.5 text-[13px] text-[#ADB5C0]">
              <Eye size={14} />{post.viewCount}
            </span>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-[13px] font-semibold transition-colors px-3 py-1.5 rounded-full border ${
                post.likedByMe
                  ? 'text-[#FF4D4F] border-[#FF4D4F] bg-[#FFF0F0]'
                  : 'text-[#6B7684] border-[#E5E8EB] bg-white'
              }`}
            >
              <Heart size={14} fill={post.likedByMe ? '#FF4D4F' : 'none'} />
              {post.likeCount > 0 ? post.likeCount : '좋아요'}
            </button>
            <span className="flex items-center gap-1.5 text-[13px] text-[#ADB5C0]">
              <MessageSquare size={14} />{post.commentCount}
            </span>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <p className="text-[14px] font-bold text-[#191F28] mb-3">
            댓글 {post.commentCount}개
          </p>

          {comments.length === 0 ? (
            <p className="text-[13px] text-[#ADB5C0] py-6 text-center">첫 댓글을 작성해보세요</p>
          ) : (
            <div>
              {comments.map(comment => (
                <CommentGroup
                  key={comment.id}
                  comment={comment}
                  currentUserId={userId}
                  actions={commentActions}
                  editingId={editingId}
                  editText={editText}
                  onEditTextChange={setEditText}
                  onEditSubmit={handleEditSubmit}
                  onEditCancel={handleEditCancel}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 댓글 입력 바 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#F2F4F6] px-4 pb-safe z-20">
        {userId === null ? (
          <button
            onClick={() => setShowLoginSheet(true)}
            className="w-full py-3 text-[14px] text-[#ADB5C0] text-left"
          >
            로그인하고 댓글을 남겨보세요
          </button>
        ) : (
          <>
            {replyTo && (
              <div className="flex items-center justify-between pt-2 pb-1">
                <span className="text-[12px] text-[#3182F6] font-medium">
                  @{replyTo.nickname} 에게 답글
                </span>
                <button onClick={cancelReply} className="text-[12px] text-[#ADB5C0]">취소</button>
              </div>
            )}
            <div className="flex items-end gap-2 py-3">
              <textarea
                ref={commentInputRef}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitComment()
                  }
                }}
                placeholder={replyTo ? `${replyTo.nickname}에게 답글...` : BOARD_MSGS.PLACEHOLDER_COMMENT}
                rows={1}
                className="flex-1 bg-[#F2F4F6] rounded-2xl px-4 py-2.5 text-[14px] outline-none resize-none max-h-24 overflow-y-auto"
                style={{ minHeight: '42px' }}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || isSubmitting}
                className="w-10 h-10 bg-[#3182F6] text-white rounded-full flex items-center justify-center disabled:opacity-40 shrink-0 mb-0.5"
              >
                <Send size={15} />
              </button>
            </div>
          </>
        )}
      </div>

      <LoginPromptSheet open={showLoginSheet} onClose={() => setShowLoginSheet(false)} />
    </PageLayout>
  )
}

export default BoardDetailPage
