import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import {
  User, LogOut, ChevronRight, Lock, Edit3, Trash2, Star, Wallet, BarChart2, BookOpen, Bookmark, Car, Users, FileText, Droplets, ThumbsUp, Package,
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import BottomSheet from '@/components/BottomSheet'
import { MY_MSGS } from '@/constants/messages'
import { updateNickname, updatePassword, deleteAccount } from '@/api/authApi'
import { getDashboard, getSessions } from '@/api/washApi'
import { getMyRecipes, getSavedRecipes } from '@/api/recipeApi'
import { getMyCar, saveMyCar, getMyGatheringHistory } from '@/api/gatheringApi'
import { getMyPosts } from '@/api/boardApi'
import { getMyProductReviews } from '@/api/calculatorApi'
import type { WashDashboard, WashSession } from '@/types/wash'
import type { Recipe } from '@/types/recipe'
import type { UserCar, GatheringSummary } from '@/types/gathering'
import type { PostSummary } from '@/types/board'
import type { MyProductReview } from '@/types/calculator'
import { STEP_TYPE_COLORS } from '@/types/recipe'
import { formatCost, formatRating } from '@/utils/format'

// ==================== 활동 시트 타입 ====================
type ActivitySheetType = 'posts' | 'wash' | 'gathering' | 'reviews' | null

// ==================== 레시피 목록 시트 ====================
type RecipeSheetType = 'my' | 'saved' | null

const RecipeListSheet = ({
  open,
  type,
  onClose,
  onNavigate,
}: {
  open: boolean
  type: RecipeSheetType
  onClose: () => void
  onNavigate: (id: number) => void
}) => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!open || !type) { return }
    setIsLoading(true)
    setIsError(false)
    const fetch = type === 'my' ? getMyRecipes : getSavedRecipes
    fetch()
      .then(setRecipes)
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false))
  }, [open, type])

  return (
    <BottomSheet open={open} onClose={onClose} title={type === 'my' ? '내 레시피' : '즐겨찾기 레시피'}>
      <div className="pb-4">
        {isLoading ? (
          <div className="py-10 flex justify-center">
            <div className="w-5 h-5 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="py-10 text-center">
            <p className="text-[14px] text-[#ADB5C0]">불러오는 중 오류가 발생했어요</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[14px] text-[#ADB5C0]">
              {type === 'my' ? '작성한 레시피가 없어요' : '즐겨찾기한 레시피가 없어요'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => { onClose(); onNavigate(recipe.id) }}
                className="w-full bg-[#F8F9FA] rounded-2xl p-4 text-left active:brightness-95"
              >
                <p className="text-[15px] font-bold text-[#191F28] mb-1.5">{recipe.title}</p>
                <div className="flex flex-wrap gap-1">
                  {recipe.steps.slice(0, 4).map((step, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${STEP_TYPE_COLORS[step.stepType]}20`,
                        color: STEP_TYPE_COLORS[step.stepType],
                      }}
                    >
                      {step.displayLabel}
                    </span>
                  ))}
                </div>
                <p className="text-[12px] text-[#ADB5C0] mt-1.5">by {recipe.authorNickname}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  )
}

// ==================== 모달 타입 ====================
type ModalType = 'nickname' | 'password' | null

const MyPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const { nickname, email, setAuth, clearAuth } = useAuthStore()

  const [dashboard, setDashboard] = useState<WashDashboard | null>(null)
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [recipeSheet, setRecipeSheet] = useState<RecipeSheetType>(null)
  const [activitySheet, setActivitySheet] = useState<ActivitySheetType>(null)
  const [activityPosts, setActivityPosts] = useState<PostSummary[]>([])
  const [activityWash, setActivityWash] = useState<WashSession[]>([])
  const [activityGathering, setActivityGathering] = useState<GatheringSummary[]>([])
  const [activityReviews, setActivityReviews] = useState<MyProductReview[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [myCar, setMyCar] = useState<UserCar | null>(null)
  const [showCarSheet, setShowCarSheet] = useState(false)
  const [carModel, setCarModel] = useState('')
  const [carColor, setCarColor] = useState('')
  const [plateNumber, setPlateNumber] = useState('')
  const [carLoading, setCarLoading] = useState(false)

  // 닉네임 변경 폼
  const [newNickname, setNewNickname] = useState('')
  const [nicknameLoading, setNicknameLoading] = useState(false)

  // 비밀번호 변경 폼
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  // ==================== 초기화 함수 ====================
  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch(() => {})
    getMyCar()
      .then(setMyCar)
      .catch(() => {})
  }, [])

  const resetModal = () => {
    setActiveModal(null)
    setNewNickname('')
    setCurrentPw('')
    setNewPw('')
  }

  // ==================== 기능별 함수 ====================
  const handleLogout = () => {
    clearAuth()
    toast.success(MY_MSGS.LOGOUT_SUCCESS)
    navigate('/login')
  }

  const handleNicknameSubmit = async () => {
    if (newNickname.trim().length < 2) {
      toast.error('닉네임은 2자 이상이어야 해요.')
      return
    }
    setNicknameLoading(true)
    try {
      const res = await updateNickname(newNickname.trim())
      setAuth(res.userId, res.accessToken, res.nickname, res.email)
      toast.success(MY_MSGS.NICKNAME_UPDATED)
      resetModal()
    } catch {
      toast.error(MY_MSGS.NICKNAME_UPDATE_ERROR)
    } finally {
      setNicknameLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    if (newPw.length < 8) {
      toast.error('새 비밀번호는 8자 이상이어야 해요.')
      return
    }
    setPwLoading(true)
    try {
      await updatePassword(currentPw, newPw)
      toast.success(MY_MSGS.PASSWORD_UPDATED)
      resetModal()
    } catch {
      toast.error(MY_MSGS.PASSWORD_UPDATE_ERROR)
    } finally {
      setPwLoading(false)
    }
  }

  const handleCarSave = async () => {
    setCarLoading(true)
    try {
      const res = await saveMyCar({ carModel: carModel.trim() || null, carColor: carColor.trim() || null, plateNumber: plateNumber.trim() || null })
      setMyCar(res)
      setShowCarSheet(false)
      toast.success('차량 정보가 저장됐어요')
    } catch {
      toast.error('저장에 실패했어요')
    } finally {
      setCarLoading(false)
    }
  }

  const openActivitySheet = (type: ActivitySheetType) => {
    setActivitySheet(type)
    setActivityLoading(true)
    if (type === 'posts') {
      getMyPosts().then(setActivityPosts).catch(() => {}).finally(() => setActivityLoading(false))
    } else if (type === 'wash') {
      getSessions().then(sessions => setActivityWash(sessions.filter(s => s.status === 'DONE'))).catch(() => {}).finally(() => setActivityLoading(false))
    } else if (type === 'gathering') {
      getMyGatheringHistory().then(setActivityGathering).catch(() => {}).finally(() => setActivityLoading(false))
    } else if (type === 'reviews') {
      getMyProductReviews().then(setActivityReviews).catch(() => {}).finally(() => setActivityLoading(false))
    }
  }

  const openCarSheet = () => {
    setCarModel(myCar?.carModel ?? '')
    setCarColor(myCar?.carColor ?? '')
    setPlateNumber(myCar?.plateNumber ?? '')
    setShowCarSheet(true)
  }

  const handleDeleteAccount = async () => {
    if (!confirm(MY_MSGS.CONFIRM_DELETE_ACCOUNT)) {
      return
    }
    try {
      await deleteAccount()
      clearAuth()
      toast.success(MY_MSGS.ACCOUNT_DELETED)
      navigate('/login')
    } catch {
      toast.error(MY_MSGS.ACCOUNT_DELETE_ERROR)
    }
  }

  return (
    <PageLayout title="마이페이지" headerVariant="large">
      <div className="flex flex-col gap-3 pb-24">

        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-[#E8F0FE] rounded-full flex items-center justify-center flex-shrink-0">
            <User size={28} className="text-[#3182F6]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[17px] font-bold text-[#191F28] truncate">{nickname ?? '-'}</p>
            <p className="text-[13px] text-[#6B7684] mt-0.5 truncate">{email ?? '-'}</p>
          </div>
        </div>

        {/* 세차 통계 카드 */}
        <div className="bg-white rounded-2xl p-5">
          <p className="text-[13px] font-semibold text-[#6B7684] mb-3">세차 통계</p>
          <div className="grid grid-cols-3 divide-x divide-[#F2F4F6]">
            <div className="flex flex-col items-center gap-1 px-2">
              <span className="text-[22px] font-bold text-[#191F28]">
                {dashboard?.totalCount ?? '-'}
              </span>
              <span className="text-[12px] text-[#6B7684]">총 세차 횟수</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-2">
              <div className="flex items-center gap-0.5">
                <Star size={14} className="text-[#FFB800] fill-[#FFB800]" />
                <span className="text-[22px] font-bold text-[#191F28]">
                  {formatRating(dashboard?.avgRating)}
                </span>
              </div>
              <span className="text-[12px] text-[#6B7684]">평균 만족도</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-2">
              <div className="flex items-center gap-0.5">
                <Wallet size={14} className="text-[#3182F6]" />
                <span className="text-[22px] font-bold text-[#191F28]">
                  {formatCost(dashboard?.avgCost)}
                </span>
              </div>
              <span className="text-[12px] text-[#6B7684]">평균 비용</span>
            </div>
          </div>
        </div>

        {/* 차량 정보 카드 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-semibold text-[#6B7684]">내 차량</p>
            <button onClick={openCarSheet} className="text-[13px] text-[#3182F6] font-medium">
              {myCar ? '수정' : '등록'}
            </button>
          </div>
          {myCar ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <Car size={20} className="text-[#3182F6]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#191F28]">
                  {myCar.carModel ?? '차종 미등록'}
                  {myCar.carColor && <span className="text-[#6B7684] font-normal"> · {myCar.carColor}</span>}
                </p>
                <p className="text-[13px] text-[#ADB5C0]">{myCar.plateNumber ?? '번호판 미등록'}</p>
              </div>
            </div>
          ) : (
            <button onClick={openCarSheet} className="w-full py-3 border border-dashed border-[#E5E8EB] rounded-xl text-[13px] text-[#ADB5C0]">
              차량 정보를 등록하면 벙에서 공유할 수 있어요
            </button>
          )}
        </div>

        {/* 내 활동 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <p className="text-[12px] font-semibold text-[#6B7684] px-5 pt-4 pb-2">내 활동</p>
          <MenuItem
            icon={<FileText size={18} className="text-[#3182F6]" />}
            label="내가 쓴 게시글"
            onClick={() => openActivitySheet('posts')}
          />
          <div className="h-px bg-[#F2F4F6] mx-5" />
          <MenuItem
            icon={<Droplets size={18} className="text-[#3182F6]" />}
            label="내 세차 일지"
            onClick={() => openActivitySheet('wash')}
          />
          <div className="h-px bg-[#F2F4F6] mx-5" />
          <MenuItem
            icon={<Users size={18} className="text-[#3182F6]" />}
            label="참여한 벙"
            onClick={() => openActivitySheet('gathering')}
          />
          <div className="h-px bg-[#F2F4F6] mx-5" />
          <MenuItem
            icon={<Package size={18} className="text-[#3182F6]" />}
            label="내가 쓴 용품 리뷰"
            onClick={() => openActivitySheet('reviews')}
          />
          <div className="pb-2" />
        </div>

        {/* 세차 통계 링크 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <MenuItem
            icon={<BarChart2 size={18} className="text-[#3182F6]" />}
            label="세차 통계"
            onClick={() => navigate('/stats')}
          />
        </div>

        {/* 레시피 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <p className="text-[12px] font-semibold text-[#6B7684] px-5 pt-4 pb-2">레시피</p>
          <MenuItem
            icon={<BookOpen size={18} className="text-[#3182F6]" />}
            label="내 레시피"
            onClick={() => setRecipeSheet('my')}
          />
          <div className="h-px bg-[#F2F4F6] mx-5" />
          <MenuItem
            icon={<Bookmark size={18} className="text-[#3182F6]" />}
            label="즐겨찾기한 레시피"
            onClick={() => setRecipeSheet('saved')}
          />
          <div className="pb-2" />
        </div>

        {/* 계정 설정 메뉴 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <p className="text-[12px] font-semibold text-[#6B7684] px-5 pt-4 pb-2">계정</p>

          <MenuItem
            icon={<Edit3 size={18} className="text-[#3182F6]" />}
            label="닉네임 변경"
            onClick={() => {
              setNewNickname(nickname ?? '')
              setActiveModal('nickname')
            }}
          />
          <div className="h-px bg-[#F2F4F6] mx-5" />
          <MenuItem
            icon={<Lock size={18} className="text-[#3182F6]" />}
            label="비밀번호 변경"
            onClick={() => setActiveModal('password')}
          />
          <div className="h-px bg-[#F2F4F6] mx-5" />
          <MenuItem
            icon={<LogOut size={18} className="text-[#F04452]" />}
            label="로그아웃"
            labelClass="text-[#F04452]"
            onClick={handleLogout}
            hideChevron
          />
          <div className="pb-2" />
        </div>

        {/* 기타 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <p className="text-[12px] font-semibold text-[#6B7684] px-5 pt-4 pb-2">기타</p>
          <MenuItem
            icon={<Trash2 size={18} className="text-[#F04452]" />}
            label="회원 탈퇴"
            labelClass="text-[#F04452]"
            onClick={handleDeleteAccount}
            hideChevron
          />
          <div className="pb-2" />
        </div>

      </div>

      {/* 내 활동 시트 */}
      <BottomSheet
        open={activitySheet !== null}
        onClose={() => setActivitySheet(null)}
        title={
          activitySheet === 'posts' ? '내가 쓴 게시글'
          : activitySheet === 'wash' ? '내 세차 일지'
          : activitySheet === 'reviews' ? '내가 쓴 용품 리뷰'
          : '참여한 벙'
        }
      >
        <div className="pb-4">
          {activityLoading ? (
            <div className="py-10 flex justify-center">
              <div className="w-5 h-5 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activitySheet === 'posts' ? (
            activityPosts.length === 0 ? (
              <p className="py-10 text-center text-[14px] text-[#ADB5C0]">작성한 게시글이 없어요</p>
            ) : (
              <div className="flex flex-col gap-2">
                {activityPosts.map(post => (
                  <button
                    key={post.id}
                    onClick={() => { setActivitySheet(null); navigate(`/board/${post.id}`) }}
                    className="w-full bg-[#F8F9FA] rounded-2xl p-4 text-left active:brightness-95"
                  >
                    <p className="text-[14px] font-bold text-[#191F28] mb-1 line-clamp-1">{post.title}</p>
                    <div className="flex items-center gap-2 text-[12px] text-[#ADB5C0]">
                      <span>{post.postType}</span>
                      <span>·</span>
                      <ThumbsUp size={11} className="inline" />
                      <span>{post.likeCount}</span>
                    </div>
                  </button>
                ))}
              </div>
            )
          ) : activitySheet === 'wash' ? (
            activityWash.length === 0 ? (
              <p className="py-10 text-center text-[14px] text-[#ADB5C0]">완료된 세차 일지가 없어요</p>
            ) : (
              <div className="flex flex-col gap-2">
                {activityWash.map(session => {
                  const d = new Date(session.washedAt)
                  return (
                    <button
                      key={session.id}
                      onClick={() => { setActivitySheet(null); navigate(`/wash/${session.id}`) }}
                      className="w-full bg-[#F8F9FA] rounded-2xl p-4 text-left active:brightness-95"
                    >
                      <p className="text-[14px] font-bold text-[#191F28] mb-1">
                        {d.getFullYear()}.{String(d.getMonth()+1).padStart(2,'0')}.{String(d.getDate()).padStart(2,'0')}
                      </p>
                      <p className="text-[12px] text-[#ADB5C0]">
                        {session.location ?? '세차'}
                        {session.rating != null && ` · ★ ${session.rating}`}
                      </p>
                    </button>
                  )
                })}
              </div>
            )
          ) : activitySheet === 'gathering' ? (
            activityGathering.length === 0 ? (
              <p className="py-10 text-center text-[14px] text-[#ADB5C0]">참여한 벙이 없어요</p>
            ) : (
              <div className="flex flex-col gap-2">
                {activityGathering.map(g => {
                  const d = new Date(g.gatheringAt)
                  return (
                    <button
                      key={g.id}
                      onClick={() => { setActivitySheet(null); navigate(`/gathering/${g.id}`) }}
                      className="w-full bg-[#F8F9FA] rounded-2xl p-4 text-left active:brightness-95"
                    >
                      <p className="text-[14px] font-bold text-[#191F28] mb-1 line-clamp-1">{g.title}</p>
                      <p className="text-[12px] text-[#ADB5C0]">
                        {d.getMonth()+1}/{d.getDate()} · {g.location} · {g.joinCount}명
                      </p>
                    </button>
                  )
                })}
              </div>
            )
          ) : (
            activityReviews.length === 0 ? (
              <p className="py-10 text-center text-[14px] text-[#ADB5C0]">작성한 리뷰가 없어요</p>
            ) : (
              <div className="flex flex-col gap-2">
                {activityReviews.map(r => (
                  <div key={r.id} className="bg-[#F8F9FA] rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-[14px] font-bold text-[#191F28]">{r.productName}</p>
                      <span className="text-[13px] text-[#FFB800] shrink-0">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    {r.productBrand && (
                      <p className="text-[12px] text-[#ADB5C0] mb-1">{r.productBrand}</p>
                    )}
                    {r.content && (
                      <p className="text-[13px] text-[#6B7684]">{r.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </BottomSheet>

      {/* 레시피 목록 시트 */}
      <RecipeListSheet
        open={recipeSheet !== null}
        type={recipeSheet}
        onClose={() => setRecipeSheet(null)}
        onNavigate={id => navigate(`/recipe/${id}`)}
      />

      {/* 닉네임 변경 시트 */}
      <BottomSheet
        open={activeModal === 'nickname'}
        onClose={resetModal}
        title="닉네임 변경"
        footer={
          <button
            onClick={handleNicknameSubmit}
            disabled={nicknameLoading}
            className="w-full bg-[#3182F6] text-white rounded-xl py-3.5 text-[15px] font-semibold disabled:opacity-50"
          >
            {nicknameLoading ? '처리 중...' : '변경하기'}
          </button>
        }
      >
        <div className="py-2">
          <input
            type="text"
            value={newNickname}
            onChange={e => setNewNickname(e.target.value)}
            placeholder="새 닉네임 (2~50자)"
            maxLength={50}
            className="w-full bg-[#F2F4F6] rounded-xl px-4 py-3 text-[15px] text-[#191F28] outline-none focus:ring-2 focus:ring-[#3182F6]"
          />
        </div>
      </BottomSheet>

      {/* 차량 정보 시트 */}
      <BottomSheet
        open={showCarSheet}
        onClose={() => setShowCarSheet(false)}
        title="차량 정보 등록"
        footer={
          <button
            onClick={handleCarSave}
            disabled={carLoading}
            className="w-full bg-[#3182F6] text-white rounded-xl py-3.5 text-[15px] font-semibold disabled:opacity-50"
          >
            {carLoading ? '저장 중...' : '저장'}
          </button>
        }
      >
        <div className="flex flex-col gap-3 py-2">
          <input
            value={carModel}
            onChange={e => setCarModel(e.target.value)}
            placeholder="차종 (예: 아반떼, 소나타)"
            className="w-full bg-[#F2F4F6] rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#3182F6]"
          />
          <input
            value={carColor}
            onChange={e => setCarColor(e.target.value)}
            placeholder="색상 (예: 흰색, 검정)"
            className="w-full bg-[#F2F4F6] rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#3182F6]"
          />
          <input
            value={plateNumber}
            onChange={e => setPlateNumber(e.target.value)}
            placeholder="번호판 (예: 12가 3456)"
            className="w-full bg-[#F2F4F6] rounded-xl px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#3182F6]"
          />
          <p className="text-[12px] text-[#ADB5C0]">번호판은 벙에서 뒷 2자리 이상 공개 선택 가능해요</p>
        </div>
      </BottomSheet>

      {/* 비밀번호 변경 시트 */}
      <BottomSheet
        open={activeModal === 'password'}
        onClose={resetModal}
        title="비밀번호 변경"
        footer={
          <button
            onClick={handlePasswordSubmit}
            disabled={pwLoading}
            className="w-full bg-[#3182F6] text-white rounded-xl py-3.5 text-[15px] font-semibold disabled:opacity-50"
          >
            {pwLoading ? '처리 중...' : '변경하기'}
          </button>
        }
      >
        <div className="flex flex-col gap-3 py-2">
          <input
            type="password"
            value={currentPw}
            onChange={e => setCurrentPw(e.target.value)}
            placeholder="현재 비밀번호"
            className="w-full bg-[#F2F4F6] rounded-xl px-4 py-3 text-[15px] text-[#191F28] outline-none focus:ring-2 focus:ring-[#3182F6]"
          />
          <input
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            placeholder="새 비밀번호 (8자 이상)"
            className="w-full bg-[#F2F4F6] rounded-xl px-4 py-3 text-[15px] text-[#191F28] outline-none focus:ring-2 focus:ring-[#3182F6]"
          />
        </div>
      </BottomSheet>
    </PageLayout>
  )
}

// ==================== 서브 컴포넌트 ====================
interface MenuItemProps {
  icon: React.ReactNode
  label: string
  labelClass?: string
  onClick: () => void
  hideChevron?: boolean
}

const MenuItem = ({ icon, label, labelClass, onClick, hideChevron }: MenuItemProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-5 py-4 active:bg-[#F2F4F6] transition"
  >
    {icon}
    <span className={`flex-1 text-left text-[15px] font-medium text-[#191F28] ${labelClass ?? ''}`}>
      {label}
    </span>
    {!hideChevron && <ChevronRight size={16} className="text-[#B0B8C1]" />}
  </button>
)

export default MyPage
