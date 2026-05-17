import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecipes, getTopRecipes } from '@/api/recipeApi'
import type { Recipe } from '@/types/recipe'
import { STEP_TYPE_COLORS } from '@/types/recipe'
import PageLayout from '@/layouts/PageLayout'
import LoginPromptSheet from '@/components/LoginPromptSheet'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Plus, Search, X, Bookmark, Clock, Car } from 'lucide-react'

// ==================== 레시피 카드 ====================
const RecipeCard = ({ recipe, onClick }: { recipe: Recipe; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full bg-white rounded-2xl p-4 text-left active:brightness-95 transition"
  >
    {/* 제목 + 저장수 */}
    <div className="flex items-start justify-between gap-2 mb-2">
      <p className="text-[16px] font-bold text-[#191F28] line-clamp-1 flex-1">{recipe.title}</p>
      <span className="flex items-center gap-1 text-[12px] text-[#ADB5C0] shrink-0">
        <Bookmark size={12} />
        {recipe.saveCount}
      </span>
    </div>

    {/* 차종 + 시간 */}
    {(recipe.carModel || recipe.estimatedMinutes) && (
      <div className="flex items-center gap-3 mb-3">
        {recipe.carModel && (
          <span className="flex items-center gap-1 text-[12px] text-[#6B7684]">
            <Car size={12} />
            {recipe.carModel}
          </span>
        )}
        {recipe.estimatedMinutes && (
          <span className="flex items-center gap-1 text-[12px] text-[#6B7684]">
            <Clock size={12} />
            약 {recipe.estimatedMinutes}분
          </span>
        )}
      </div>
    )}

    {/* 단계 칩 */}
    <div className="flex flex-wrap gap-1.5">
      {recipe.steps.slice(0, 5).map((step, i) => (
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
      {recipe.steps.length > 5 && (
        <span className="text-[11px] text-[#ADB5C0] px-2 py-0.5">
          +{recipe.steps.length - 5}
        </span>
      )}
    </div>

    {/* 작성자 */}
    <p className="text-[12px] text-[#ADB5C0] mt-2">by {recipe.authorNickname}</p>
  </button>
)

const RecipeSkeleton = () => (
  <div className="bg-white rounded-2xl p-4">
    <div className="h-5 bg-[#F2F4F6] rounded w-3/4 mb-3 animate-pulse" />
    <div className="flex gap-2 mb-3">
      <div className="h-3 bg-[#F2F4F6] rounded w-16 animate-pulse" />
      <div className="h-3 bg-[#F2F4F6] rounded w-12 animate-pulse" />
    </div>
    <div className="flex gap-1.5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-5 bg-[#F2F4F6] rounded-full w-14 animate-pulse" />
      ))}
    </div>
  </div>
)

// ==================== 메인 ====================
const RecipeListPage = () => {
  const navigate = useNavigate()
  const { showLoginSheet, setShowLoginSheet, requireAuth } = useRequireAuth()

  const [topRecipes, setTopRecipes] = useState<Recipe[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [isLast, setIsLast] = useState(false)
  const [page, setPage] = useState(0)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  const fetchRecipes = useCallback(async (_page: number, reset: boolean, _keyword?: string) => {
    try {
      const res = await getRecipes(_page, 20, _keyword || undefined)
      setRecipes(prev => reset ? res.content : [...prev, ...res.content])
      setIsLast(res.last)
      setPage(_page)
    } finally {
      setIsLoading(false)
      setIsFetchingMore(false)
    }
  }, [])

  useEffect(() => {
    getTopRecipes().then(setTopRecipes)
    fetchRecipes(0, true)
  }, [])

  useEffect(() => {
    if (isLoading) { return }
    setIsLoading(true)
    fetchRecipes(0, true, keyword)
  }, [keyword])

  const handleSearch = () => {
    setKeyword(searchInput.trim())
  }

  const clearSearch = () => {
    setSearchInput('')
    setKeyword('')
  }

  return (
    <PageLayout
      title="세차 레시피"
      headerVariant="large"
      headerSubtitle="고수들의 세차 루틴"
    >
      <div className="flex flex-col gap-4">

        {/* 검색바 */}
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-2">
          <Search size={16} className="text-[#ADB5C0] shrink-0" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="레시피 검색"
            className="flex-1 text-[14px] text-[#191F28] outline-none placeholder:text-[#ADB5C0]"
          />
          {searchInput && (
            <button onClick={clearSearch} className="text-[#ADB5C0]">
              <X size={16} />
            </button>
          )}
        </div>

        {/* 인기 레시피 — 검색 중이 아닐 때만 */}
        {!keyword && topRecipes.length > 0 && (
          <div>
            <p className="text-[14px] font-bold text-[#191F28] mb-2 px-1">🔥 인기 레시피</p>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              {topRecipes.slice(0, 5).map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                  className="shrink-0 w-[200px] bg-white rounded-2xl p-3 text-left active:brightness-95"
                >
                  <p className="text-[14px] font-bold text-[#191F28] line-clamp-1 mb-1">{recipe.title}</p>
                  <p className="text-[11px] text-[#ADB5C0] mb-2">by {recipe.authorNickname}</p>
                  <div className="flex flex-wrap gap-1">
                    {recipe.steps.slice(0, 3).map((step, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${STEP_TYPE_COLORS[step.stepType]}20`,
                          color: STEP_TYPE_COLORS[step.stepType],
                        }}
                      >
                        {step.displayLabel}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 전체 레시피 목록 */}
        <div>
          {keyword && (
            <p className="text-[13px] text-[#6B7684] mb-2 px-1">
              <span className="font-semibold text-[#191F28]">'{keyword}'</span> 검색 결과
            </p>
          )}
          {!keyword && <p className="text-[14px] font-bold text-[#191F28] mb-2 px-1">전체 레시피</p>}

          <div className="flex flex-col gap-3">
            {isLoading ? (
              [...Array(4)].map((_, i) => <RecipeSkeleton key={i} />)
            ) : recipes.length === 0 ? (
              <div className="bg-white rounded-2xl py-16 text-center">
                <p className="text-[14px] text-[#ADB5C0]">
                  {keyword ? `'${keyword}'에 대한 레시피가 없어요` : '아직 레시피가 없어요'}
                </p>
              </div>
            ) : (
              <>
                {recipes.map(recipe => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                  />
                ))}
                {!isLast && (
                  <button
                    onClick={() => {
                      setIsFetchingMore(true)
                      fetchRecipes(page + 1, false, keyword)
                    }}
                    disabled={isFetchingMore}
                    className="py-3 text-[14px] text-[#3182F6] font-medium text-center"
                  >
                    {isFetchingMore ? '불러오는 중...' : '더 보기'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 레시피 작성 버튼 */}
      <button
        onClick={() => requireAuth(() => navigate('/recipe/new'))}
        className="fixed bottom-[84px] right-4 w-14 h-14 bg-[#3182F6] text-white rounded-full shadow-lg flex items-center justify-center active:brightness-90 z-10"
      >
        <Plus size={24} />
      </button>

      <LoginPromptSheet open={showLoginSheet} onClose={() => setShowLoginSheet(false)} />
    </PageLayout>
  )
}

export default RecipeListPage
