import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserProfile, getUserPosts } from '@/api/userApi'
import type { UserProfile } from '@/types/user'
import type { PostSummary } from '@/types/board'
import PageLayout from '@/layouts/PageLayout'
import { Car, ThumbsUp, Droplets, User, MessageSquare, Heart, Eye, ClipboardList } from 'lucide-react'

type TabType = 'FREE' | 'WASH_LOG'

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [tab, setTab] = useState<TabType>('FREE')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userId) { return }
    Promise.all([getUserProfile(Number(userId)), getUserPosts(Number(userId))])
      .then(([p, ps]) => { setProfile(p); setPosts(ps) })
      .finally(() => setIsLoading(false))
  }, [userId])

  if (isLoading) { return <PageLayout isLoading /> }
  if (!profile) {
    return (
      <PageLayout onBack>
        <p className="text-center py-20 text-[#ADB5C0]">유저를 찾을 수 없어요</p>
      </PageLayout>
    )
  }

  const joinYear = new Date(profile.joinedAt).getFullYear()
  const joinMonth = new Date(profile.joinedAt).getMonth() + 1
  const filteredPosts = posts.filter(p => p.postType === tab)

  const tabBar = (
    <div className="flex border-b border-[#F2F4F6]">
      {([['FREE', '자유글'], ['WASH_LOG', '세차일지']] as [TabType, string][]).map(([key, label]) => (
        <button
          key={key}
          onClick={() => setTab(key)}
          className={`flex-1 py-3 text-[14px] font-semibold transition-colors ${
            tab === key ? 'text-[#191F28] border-b-2 border-[#191F28]' : 'text-[#ADB5C0]'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )

  return (
    <PageLayout title="프로필" onBack stickyTab={tabBar}>
      <div className="flex flex-col gap-3 pb-10">

        {/* 프로필 헤더 */}
        <div className="bg-white rounded-2xl px-5 py-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-[#EFF6FF] rounded-full flex items-center justify-center shrink-0">
            <User size={30} className="text-[#3182F6]" />
          </div>
          <div>
            <p className="text-[20px] font-bold text-[#191F28]">{profile.nickname}</p>
            <p className="text-[13px] text-[#ADB5C0] mt-0.5">{joinYear}년 {joinMonth}월 가입</p>
          </div>
        </div>

        {/* 활동 통계 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <p className="text-[13px] font-semibold text-[#6B7684] mb-3">활동 현황</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8FAFF] rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
                <Droplets size={18} className="text-[#3182F6]" />
              </div>
              <div>
                <p className="text-[18px] font-bold text-[#191F28]">{profile.washCount}</p>
                <p className="text-[11px] text-[#ADB5C0]">세차 횟수</p>
              </div>
            </div>
            <div className="bg-[#F8FAFF] rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
                <ThumbsUp size={18} className="text-[#3182F6]" />
              </div>
              <div>
                <p className="text-[18px] font-bold text-[#191F28]">{profile.totalPostLikes}</p>
                <p className="text-[11px] text-[#ADB5C0]">받은 좋아요</p>
              </div>
            </div>
          </div>
        </div>

        {/* 차량 정보 */}
        {(profile.carModel || profile.carColor) && (
          <div className="bg-white rounded-2xl px-5 py-4">
            <p className="text-[13px] font-semibold text-[#6B7684] mb-3">차량 정보</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EFF6FF] rounded-xl flex items-center justify-center shrink-0">
                <Car size={20} className="text-[#3182F6]" />
              </div>
              <p className="text-[14px] font-medium text-[#191F28]">
                {[profile.carModel, profile.carColor].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>
        )}

        {/* 게시글 목록 */}
        <div className="flex flex-col gap-2">
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-2xl px-5 py-10 text-center">
              <p className="text-[14px] text-[#ADB5C0]">
                {tab === 'FREE' ? '작성한 자유글이 없어요' : '작성한 세차일지가 없어요'}
              </p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <button
                key={post.id}
                onClick={() => navigate(`/board/${post.id}`)}
                className="bg-white rounded-2xl px-5 py-4 text-left active:brightness-95"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-[14px] font-semibold text-[#191F28] line-clamp-1 flex-1">{post.title}</p>
                  {post.postType === 'WASH_LOG' && (
                    <ClipboardList size={14} className="text-[#3182F6] shrink-0 mt-0.5" />
                  )}
                </div>
                {post.contentPreview && (
                  <p className="text-[13px] text-[#6B7684] line-clamp-2 mb-2">{post.contentPreview}</p>
                )}
                <div className="flex items-center gap-3 text-[#ADB5C0]">
                  <span className="flex items-center gap-1 text-[12px]">
                    <Heart size={11} /> {post.likeCount}
                  </span>
                  <span className="flex items-center gap-1 text-[12px]">
                    <MessageSquare size={11} /> {post.commentCount}
                  </span>
                  <span className="flex items-center gap-1 text-[12px]">
                    <Eye size={11} /> {post.viewCount}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

      </div>
    </PageLayout>
  )
}

export default UserProfilePage
