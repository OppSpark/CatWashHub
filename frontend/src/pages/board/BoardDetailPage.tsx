import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getPost, getComments, deletePost, toggleLike, createComment, deleteComment } from '@/api/boardApi'
import type { Post, Comment } from '@/types/board'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { BOARD_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'
import { Heart, MessageSquare, Eye, Send, ChevronDown } from 'lucide-react'

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// ==================== 댓글 컴포넌트 ====================
const CommentItem = ({
  comment,
  currentUserId,
  onReply,
  onDelete,
}: {
  comment: Comment
  currentUserId: number | null
  onReply: (commentId: number, nickname: string) => void
  onDelete: (commentId: number) => void
}) => {
  const [showReplies, setShowReplies] = useState(true)
  const isOwner = currentUserId === comment.authorId

  return (
    <div>
      <div className="flex items-start justify-between py-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-semibold text-[#191F28]">{comment.authorNickname}</span>
            <span className="text-[11px] text-[#ADB5C0]">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="text-[14px] text-[#191F28] whitespace-pre-wrap">{comment.content}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <button
              onClick={() => onReply(comment.id, comment.authorNickname)}
              className="text-[12px] text-[#3182F6]"
            >
              답글
            </button>
            {comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(v => !v)}
                className="flex items-center gap-0.5 text-[12px] text-[#ADB5C0]"
              >
                <ChevronDown size={12} className={showReplies ? 'rotate-180' : ''} />
                답글 {comment.replies.length}개
              </button>
            )}
          </div>
        </div>
        {isOwner && (
          <button onClick={() => onDelete(comment.id)} className="text-[12px] text-[#ADB5C0] ml-3 shrink-0">
            삭제
          </button>
        )}
      </div>

      {/* 대댓글 */}
      {showReplies && comment.replies.length > 0 && (
        <div className="ml-4 pl-3 border-l-2 border-[#F2F4F6]">
          {comment.replies.map(reply => (
            <div key={reply.id} className="flex items-start justify-between py-2.5">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-[#191F28]">{reply.authorNickname}</span>
                  <span className="text-[11px] text-[#ADB5C0]">{formatDate(reply.createdAt)}</span>
                </div>
                <p className="text-[14px] text-[#191F28] whitespace-pre-wrap">{reply.content}</p>
              </div>
              {currentUserId === reply.authorId && (
                <button onClick={() => onDelete(reply.id)} className="text-[12px] text-[#ADB5C0] ml-3 shrink-0">
                  삭제
                </button>
              )}
            </div>
          ))}
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

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState<{ id: number; nickname: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const commentInputRef = useRef<HTMLInputElement>(null)

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
    commentInputRef.current?.focus()
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
      headerRight={
        isOwner ? (
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/board/${id}/edit`)} className="text-[14px] text-[#3182F6]">수정</button>
            <button onClick={handleDelete} disabled={isDeleting} className="text-[14px] text-[#FF4D4F] disabled:opacity-50">삭제</button>
          </div>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-3 pb-24">

        {/* 게시글 본문 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <h1 className="text-[18px] font-bold text-[#191F28] mb-2">{post.title}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[13px] font-medium text-[#6B7684]">{post.authorNickname}</span>
            <span className="text-[12px] text-[#ADB5C0]">·</span>
            <span className="text-[12px] text-[#ADB5C0]">{formatDate(post.createdAt)}</span>
          </div>
          <p className="text-[14px] text-[#191F28] whitespace-pre-wrap leading-relaxed">{post.content}</p>

          {/* 통계 */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#F2F4F6]">
            <span className="flex items-center gap-1 text-[13px] text-[#ADB5C0]">
              <Eye size={14} />{post.viewCount}
            </span>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-[13px] font-medium transition-colors ${post.likedByMe ? 'text-[#FF4D4F]' : 'text-[#ADB5C0]'}`}
            >
              <Heart size={14} fill={post.likedByMe ? '#FF4D4F' : 'none'} />
              {post.likeCount}
            </button>
            <span className="flex items-center gap-1 text-[13px] text-[#ADB5C0]">
              <MessageSquare size={14} />{post.commentCount}
            </span>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <p className="text-[14px] font-semibold text-[#191F28] mb-1">
            댓글 {post.commentCount}개
          </p>
          {comments.length === 0 ? (
            <p className="text-[13px] text-[#ADB5C0] py-4 text-center">첫 댓글을 작성해보세요</p>
          ) : (
            <div className="divide-y divide-[#F2F4F6]">
              {comments.map(comment => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={userId}
                  onReply={handleReply}
                  onDelete={handleDeleteComment}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* 댓글 입력 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#F2F4F6] px-4 pb-safe">
        {replyTo && (
          <div className="flex items-center justify-between py-2">
            <span className="text-[12px] text-[#3182F6]">{replyTo.nickname}님에게 답글</span>
            <button onClick={cancelReply} className="text-[12px] text-[#ADB5C0]">취소</button>
          </div>
        )}
        <div className="flex items-center gap-2 py-3">
          <input
            ref={commentInputRef}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmitComment() } }}
            placeholder={BOARD_MSGS.PLACEHOLDER_COMMENT}
            className="flex-1 bg-[#F2F4F6] rounded-xl px-3 py-2.5 text-[14px] outline-none"
          />
          <button
            onClick={handleSubmitComment}
            disabled={!commentText.trim() || isSubmitting}
            className="w-10 h-10 bg-[#3182F6] text-white rounded-xl flex items-center justify-center disabled:opacity-40 shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </PageLayout>
  )
}

export default BoardDetailPage
