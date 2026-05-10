import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPosts } from '@/api/boardApi'
import type { PostSummary } from '@/types/board'
import { BOARD_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'
import { MessageSquare, Heart, Eye, Plus, Search, X, ClipboardList, Star, MapPin } from 'lucide-react'

type TabType = 'ALL' | 'FREE' | 'WASH_LOG'
const TABS: { key: TabType; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'FREE', label: '자유글' },
  { key: 'WASH_LOG', label: '세차일지' },
]

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) { return '방금 전' }
  if (diff < 3600) { return `${Math.floor(diff / 60)}분 전` }
  if (diff < 86400) { return `${Math.floor(diff / 3600)}시간 전` }
  if (diff < 86400 * 7) { return `${Math.floor(diff / 86400)}일 전` }
  return `${date.getMonth() + 1}/${date.getDate()}`
}

// ==================== 게시글 카드 ====================
const PostCard = ({ post, onClick }: { post: PostSummary; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full bg-white px-5 py-4 text-left active:bg-[#F8F9FA] transition-colors border-b border-[#F2F4F6] last:border-b-0"
  >
    {/* 타입 배지 + 제목 */}
    <div className="flex items-start gap-2 mb-1">
      {post.postType === 'WASH_LOG' && (
        <span className="shrink-0 flex items-center gap-0.5 text-[10px] font-semibold text-[#3182F6] bg-[#EFF6FF] px-1.5 py-0.5 rounded-md mt-0.5">
          <ClipboardList size={9} />
          세차일지
        </span>
      )}
      <p className="text-[15px] font-semibold text-[#191F28] line-clamp-1">{post.title}</p>
    </div>

    {/* 세차일지 미니 카드 */}
    {post.postType === 'WASH_LOG' && post.washSession && (
      <div className="flex items-center gap-3 bg-[#F8FAFF] rounded-xl px-3 py-2 mb-2">
        {post.washSession.location && (
          <span className="flex items-center gap-1 text-[11px] text-[#6B7684]">
            <MapPin size={10} />
            {post.washSession.location}
          </span>
        )}
        {post.washSession.rating && (
          <span className="flex items-center gap-0.5 text-[11px] text-[#F59E0B]">
            <Star size={10} fill="#F59E0B" />
            {post.washSession.rating}
          </span>
        )}
        {post.washSession.productNames.length > 0 && (
          <span className="text-[11px] text-[#ADB5C0]">용품 {post.washSession.productNames.length}개</span>
        )}
      </div>
    )}

    {/* 본문 미리보기 */}
    {post.contentPreview && (
      <p className="text-[13px] text-[#6B7684] line-clamp-2 mb-2.5 leading-relaxed">
        {post.contentPreview}
      </p>
    )}

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="text-[12px] font-medium text-[#6B7684]">{post.authorNickname}</span>
        <span className="text-[12px] text-[#D1D6DB]">·</span>
        <span className="text-[12px] text-[#ADB5C0]">{formatDate(post.createdAt)}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-0.5 text-[11px] text-[#ADB5C0]">
          <Eye size={11} className="shrink-0" />
          {post.viewCount}
        </span>
        <span className="flex items-center gap-0.5 text-[11px] text-[#ADB5C0]">
          <Heart size={11} className="shrink-0" />
          {post.likeCount}
        </span>
        <span className="flex items-center gap-0.5 text-[11px] text-[#ADB5C0]">
          <MessageSquare size={11} className="shrink-0" />
          {post.commentCount}
        </span>
      </div>
    </div>
  </button>
)

// ==================== 스켈레톤 ====================
const PostSkeleton = () => (
  <div className="bg-white px-5 py-4 border-b border-[#F2F4F6] last:border-b-0">
    <div className="h-4 bg-[#F2F4F6] rounded-md w-3/4 mb-2 animate-pulse" />
    <div className="h-3 bg-[#F2F4F6] rounded-md w-full mb-1 animate-pulse" />
    <div className="h-3 bg-[#F2F4F6] rounded-md w-2/3 mb-3 animate-pulse" />
    <div className="flex justify-between">
      <div className="h-3 bg-[#F2F4F6] rounded-md w-24 animate-pulse" />
      <div className="h-3 bg-[#F2F4F6] rounded-md w-20 animate-pulse" />
    </div>
  </div>
)

// ==================== 메인 ====================
const BoardListPage = () => {
  const navigate = useNavigate()
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [isLast, setIsLast] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('ALL')
  const observerRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const fetchPosts = useCallback(async (_page: number, reset: boolean, _keyword?: string, _tab?: TabType) => {
    try {
      const postType = (_tab ?? activeTab) === 'ALL' ? undefined : (_tab ?? activeTab)
      const res = await getPosts(_page, 20, _keyword || undefined, postType)
      setPosts(prev => reset ? res.content : [...prev, ...res.content])
      setIsLast(res.last)
      setPage(_page)
    } finally {
      setIsLoading(false)
      setIsFetchingMore(false)
    }
  }, [activeTab])

  useEffect(() => {
    setIsLoading(true)
    fetchPosts(0, true, keyword, activeTab)
  }, [keyword, activeTab])

  // 무한스크롤 감지
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isFetchingMore && !isLast && !isLoading) {
          setIsFetchingMore(true)
          fetchPosts(page + 1, false, keyword)
        }
      },
      { threshold: 0.1 }
    )
    if (observerRef.current) {
      observer.observe(observerRef.current)
    }
    return () => observer.disconnect()
  }, [isFetchingMore, isLast, isLoading, page, keyword])

  const handleSearch = () => {
    const trimmed = searchInput.trim()
    setKeyword(trimmed)
    setIsSearching(false)
  }

  const clearSearch = () => {
    setSearchInput('')
    setKeyword('')
    setIsSearching(false)
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setKeyword('')
    setSearchInput('')
  }

  const tabBar = (
    <div className="flex px-4 gap-1 border-b border-[#F2F4F6]">
      {TABS.map(tab => (
        <button
          key={tab.key}
          onClick={() => handleTabChange(tab.key)}
          className={`flex-1 py-3 text-[14px] font-semibold transition-all border-b-2 -mb-px ${
            activeTab === tab.key
              ? 'border-[#3182F6] text-[#3182F6]'
              : 'border-transparent text-[#ADB5C0]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )

  return (
    <PageLayout title="자유게시판" headerVariant="large" stickyTab={tabBar}>
      <div className="flex flex-col gap-3">

        {/* 검색바 */}
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-2">
          <Search size={16} className="text-[#ADB5C0] shrink-0" />
          <input
            ref={searchInputRef}
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onFocus={() => setIsSearching(true)}
            onKeyDown={e => {
              if (e.key === 'Enter') { handleSearch() }
              if (e.key === 'Escape') { clearSearch() }
            }}
            placeholder="게시글 검색"
            className="flex-1 text-[14px] text-[#191F28] outline-none placeholder:text-[#ADB5C0]"
          />
          {searchInput && (
            <button onClick={clearSearch} className="text-[#ADB5C0]">
              <X size={16} />
            </button>
          )}
          {isSearching && searchInput && (
            <button
              onClick={handleSearch}
              className="text-[13px] font-medium text-[#3182F6] shrink-0"
            >
              검색
            </button>
          )}
        </div>

        {/* 검색 결과 라벨 */}
        {keyword && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[13px] text-[#6B7684]">
              <span className="font-semibold text-[#191F28]">'{keyword}'</span> 검색 결과
            </span>
            <button onClick={clearSearch} className="text-[12px] text-[#ADB5C0]">초기화</button>
          </div>
        )}

        {/* 게시글 목록 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          {isLoading ? (
            [...Array(6)].map((_, i) => <PostSkeleton key={i} />)
          ) : posts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[14px] text-[#ADB5C0]">
                {keyword ? `'${keyword}'에 대한 결과가 없어요` : BOARD_MSGS.EMPTY_POSTS}
              </p>
            </div>
          ) : (
            <>
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => navigate(`/board/${post.id}`)}
                />
              ))}
              {/* 무한스크롤 감지 영역 */}
              {!isLast && (
                <div ref={observerRef} className="py-4 flex justify-center">
                  {isFetchingMore && (
                    <div className="w-5 h-5 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* 글쓰기 버튼 */}
      <button
        onClick={() => navigate('/board/new')}
        className="fixed bottom-[84px] right-4 w-14 h-14 bg-[#3182F6] text-white rounded-full shadow-lg flex items-center justify-center active:brightness-90 z-10"
      >
        <Plus size={24} />
      </button>
    </PageLayout>
  )
}

export default BoardListPage
