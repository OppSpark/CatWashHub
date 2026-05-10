import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRecipe, toggleSaveRecipe, deleteRecipe } from '@/api/recipeApi'
import type { Recipe } from '@/types/recipe'
import { STEP_TYPE_COLORS } from '@/types/recipe'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import PageLayout from '@/layouts/PageLayout'
import { Bookmark, Clock, Car, Download, Trash2, Pencil } from 'lucide-react'
import html2canvas from 'html2canvas'

// ==================== 공유용 카드 (이미지 변환 대상) ====================
const ShareCard = ({ recipe }: { recipe: Recipe }) => (
  <div className="bg-white rounded-2xl p-5 w-[320px]">
    {/* 워터마크 */}
    <div className="flex items-center justify-between mb-3">
      <span className="text-[11px] font-bold text-[#3182F6]">CatWashHub</span>
      <span className="text-[11px] text-[#ADB5C0]">세차 레시피</span>
    </div>

    {/* 제목 */}
    <p className="text-[18px] font-bold text-[#191F28] mb-1">{recipe.title}</p>

    {/* 차종 + 시간 */}
    <div className="flex items-center gap-3 mb-3">
      {recipe.carModel && (
        <span className="text-[12px] text-[#6B7684] flex items-center gap-1 leading-none">
          <Car size={11} className="shrink-0" />{recipe.carModel}
        </span>
      )}
      {recipe.estimatedMinutes && (
        <span className="text-[12px] text-[#6B7684] flex items-center gap-1 leading-none">
          <Clock size={11} className="shrink-0" />{recipe.estimatedMinutes}분
        </span>
      )}
    </div>

    {/* 구분선 */}
    <div className="h-px bg-[#F2F4F6] mb-3" />

    {/* 단계 목록 */}
    <div className="flex flex-col gap-2">
      {recipe.steps.map((step, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <span
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white mt-0.5"
            style={{ backgroundColor: STEP_TYPE_COLORS[step.stepType] }}
          >
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#191F28]">{step.displayLabel}</p>
            {step.productName && (
              <p className="text-[11px] text-[#6B7684]">
                {step.productName}{step.ratio ? `  1:${step.ratio}` : ''}
              </p>
            )}
            {step.memo && <p className="text-[11px] text-[#ADB5C0]">{step.memo}</p>}
          </div>
        </div>
      ))}
    </div>

    {/* 하단 */}
    <div className="h-px bg-[#F2F4F6] mt-3 mb-2" />
    <p className="text-[11px] text-[#ADB5C0]">by {recipe.authorNickname} · catwashhub.com</p>
  </div>
)

// ==================== 메인 ====================
const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const cardRef = useRef<HTMLDivElement>(null)
  const { isLoggedIn, nickname } = useAuthStore()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (!id) { return }
    getRecipe(Number(id))
      .then(setRecipe)
      .finally(() => setIsLoading(false))
  }, [id])

  const handleToggleSave = async () => {
    if (!recipe || isSaving) { return }
    setIsSaving(true)
    try {
      const saved = await toggleSaveRecipe(recipe.id)
      setRecipe(prev => prev ? {
        ...prev,
        isSaved: saved,
        saveCount: saved ? prev.saveCount + 1 : prev.saveCount - 1,
      } : null)
      toast.success(saved ? '레시피를 저장했어요' : '저장을 취소했어요')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) { return }
    setIsDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, backgroundColor: null })
      const link = document.createElement('a')
      link.download = `${recipe?.title ?? '레시피'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('이미지로 저장했어요')
    } catch {
      toast.error('저장에 실패했어요')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDelete = async () => {
    if (!recipe || !window.confirm('레시피를 삭제할까요?')) { return }
    try {
      await deleteRecipe(recipe.id)
      toast.success('레시피를 삭제했어요')
      navigate(-1)
    } catch {
      toast.error('삭제에 실패했어요')
    }
  }

  const isOwner = recipe?.authorNickname === nickname

  return (
    <PageLayout
      title="레시피 상세"
      onBack
      isLoading={isLoading}
      headerRight={
        recipe && (
          <div className="flex items-center gap-1">
            {isOwner && (
              <>
                <button
                  onClick={() => navigate(`/recipe/${recipe.id}/edit`)}
                  className="p-2 text-[#6B7684]"
                >
                  <Pencil size={18} />
                </button>
                <button onClick={handleDelete} className="p-2 text-[#F04452]">
                  <Trash2 size={18} />
                </button>
              </>
            )}
            {isLoggedIn && (
              <button onClick={handleToggleSave} className="p-2" disabled={isSaving}>
                <Bookmark
                  size={20}
                  className={recipe.isSaved ? 'text-[#3182F6] fill-[#3182F6]' : 'text-[#ADB5C0]'}
                />
              </button>
            )}
          </div>
        )
      }
    >
      {recipe && (
        <div className="flex flex-col gap-4">

          {/* 기본 정보 카드 */}
          <div className="bg-white rounded-2xl p-5">
            <p className="text-[20px] font-bold text-[#191F28] mb-2">{recipe.title}</p>
            {recipe.description && (
              <p className="text-[14px] text-[#6B7684] mb-3 leading-relaxed">{recipe.description}</p>
            )}
            <div className="flex items-center gap-4">
              {recipe.carModel && (
                <span className="flex items-center gap-1 text-[13px] text-[#6B7684]">
                  <Car size={14} className="text-[#3182F6]" />
                  {recipe.carModel}
                </span>
              )}
              {recipe.estimatedMinutes && (
                <span className="flex items-center gap-1 text-[13px] text-[#6B7684]">
                  <Clock size={14} className="text-[#3182F6]" />
                  약 {recipe.estimatedMinutes}분
                </span>
              )}
              <span className="flex items-center gap-1 text-[13px] text-[#ADB5C0]">
                <Bookmark size={14} />
                {recipe.saveCount}명 저장
              </span>
            </div>
          </div>

          {/* 단계 목록 */}
          <div className="bg-white rounded-2xl p-5">
            <p className="text-[15px] font-bold text-[#191F28] mb-4">공정 단계</p>
            <div className="flex flex-col gap-4">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span
                    className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white mt-0.5"
                    style={{ backgroundColor: STEP_TYPE_COLORS[step.stepType] }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[15px] font-semibold text-[#191F28]">{step.displayLabel}</p>
                    </div>
                    {step.productName && (
                      <p className="text-[13px] text-[#6B7684]">
                        {step.productName}
                        {step.ratio ? (
                          <span className="ml-2 text-[12px] font-medium text-[#3182F6] bg-[#EFF6FF] px-1.5 py-0.5 rounded-md">
                            1:{step.ratio}
                          </span>
                        ) : null}
                      </p>
                    )}
                    {step.memo && (
                      <p className="text-[12px] text-[#ADB5C0] mt-0.5">{step.memo}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 이미지 저장 버튼 */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-4 bg-white rounded-2xl flex items-center justify-center gap-2 text-[15px] font-semibold text-[#3182F6] active:brightness-95 disabled:opacity-50"
          >
            <Download size={18} />
            {isDownloading ? '저장 중...' : '이미지로 저장하기'}
          </button>

          {/* 이미지 변환용 숨김 카드 */}
          <div className="fixed -left-[9999px] -top-[9999px]">
            <div ref={cardRef}>
              <ShareCard recipe={recipe} />
            </div>
          </div>

        </div>
      )}
    </PageLayout>
  )
}

export default RecipeDetailPage
