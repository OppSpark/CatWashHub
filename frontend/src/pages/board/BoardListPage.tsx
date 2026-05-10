import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPosts } from '@/api/boardApi'
import type { PostSummary } from '@/types/board'
import { BOARD_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'
import { MessageSquare, Heart, Eye, Plus } from 'lucide-react'

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) { return '방금 전' }
  if (diff < 3600) { return `${Math.floor(diff / 60)}분 전` }
  if (diff < 86400) { return `${Math.floor(diff / 3600)}시간 전` }
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const BoardListPage = () => {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [isLast, setIsLast] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const fetchPosts = useCallback(async (_page: number, reset: boolean) => {
    try {
      const res = await getPosts(_page)
      setPosts(prev => reset ? res.content : [...prev, ...res.content])
      setIsLast(res.last)
    } finally {
      setIsLoading(false)
      setIsFetchingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(0, true)
  }, [])

  const loadMore = () => {
    if (isFetchingMore || isLast) { return }
    setIsFetchingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage, false)
  }

  return (
    <PageLayout title="자유게시판" headerVariant="large">
      <div className="flex flex-col gap-2">

        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl px-5 py-4">
              <div className="h-4 bg-[#F2F4F6] rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-3 bg-[#F2F4F6] rounded w-1/2 animate-pulse" />
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[14px] text-[#ADB5C0]">{BOARD_MSGS.EMPTY_POSTS}</p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <button
                key={post.id}
                onClick={() => navigate(`/board/${post.id}`)}
                className="bg-white rounded-2xl px-5 py-4 text-left active:brightness-95 transition-all"
              >
                <p className="text-[15px] font-semibold text-[#191F28] line-clamp-2 mb-2">
                  {post.title}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] text-[#ADB5C0]">{post.authorNickname}</span>
                    <span className="text-[12px] text-[#E5E8EB]">·</span>
                    <span className="text-[12px] text-[#ADB5C0]">{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-0.5 text-[12px] text-[#ADB5C0]">
                      <Eye size={12} />
                      {post.viewCount}
                    </span>
                    <span className="flex items-center gap-0.5 text-[12px] text-[#ADB5C0]">
                      <Heart size={12} />
                      {post.likeCount}
                    </span>
                    <span className="flex items-center gap-0.5 text-[12px] text-[#ADB5C0]">
                      <MessageSquare size={12} />
                      {post.commentCount}
                    </span>
                  </div>
                </div>
              </button>
            ))}

            {!isLast && (
              <button
                onClick={loadMore}
                disabled={isFetchingMore}
                className="w-full py-3 text-[14px] text-[#3182F6] font-medium disabled:opacity-50"
              >
                {isFetchingMore ? '불러오는 중...' : '더보기'}
              </button>
            )}
          </>
        )}
      </div>

      {/* 글쓰기 버튼 */}
      <button
        onClick={() => navigate('/board/new')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-[#3182F6] text-white rounded-full shadow-lg flex items-center justify-center active:brightness-90"
      >
        <Plus size={24} />
      </button>
    </PageLayout>
  )
}

export default BoardListPage
