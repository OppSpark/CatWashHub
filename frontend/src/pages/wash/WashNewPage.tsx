import { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getProductSets, createSession } from '@/api/washApi'
import { getMyRecipes, getSavedRecipes } from '@/api/recipeApi'
import type { ProductSet } from '@/types/wash'
import type { Product } from '@/types/calculator'
import type { Recipe } from '@/types/recipe'
import { useToast } from '@/hooks/useToast'
import { WASH_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'
import ProductPickerSheet from '@/components/ProductPickerSheet'
import BottomSheet from '@/components/BottomSheet'
import { Plus, X, CalendarDays, MapPin, BookOpen, ChevronRight } from 'lucide-react'

interface SelectedProduct {
  productId: number | null
  customName: string | null
  category: string | null
  memo: string | null
  sortOrder: number
  displayName: string
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

const WashNewPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const preselectedSetId: number | null = location.state?.setId ?? null
  const dateInputRef = useRef<HTMLInputElement>(null)

  const [sets, setSets] = useState<ProductSet[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [washDate, setWashDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [washLocation, setWashLocation] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showRecipePicker, setShowRecipePicker] = useState(false)
  const [recipeTab, setRecipeTab] = useState<'my' | 'saved'>('my')
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([])
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false)
  const [selectedRecipeId, setSelectedRecipeId] = useState<number | null>(null)
  const [selectedRecipeTitle, setSelectedRecipeTitle] = useState<string | null>(null)

  // ==================== 초기화 함수 ====================
  useEffect(() => {
    getProductSets()
      .then(setsData => {
        setSets(setsData)
        const targetSet = preselectedSetId
          ? setsData.find(s => s.id === preselectedSetId)
          : setsData.find(s => s.isDefault)
        if (targetSet) {
          applySet(targetSet)
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  // ==================== 기능별 함수 ====================
  const handleOpenRecipePicker = () => {
    setShowRecipePicker(true)
    if (myRecipes.length === 0 && savedRecipes.length === 0) {
      setIsLoadingRecipes(true)
      Promise.all([getMyRecipes(), getSavedRecipes()])
        .then(([my, saved]) => { setMyRecipes(my); setSavedRecipes(saved) })
        .finally(() => setIsLoadingRecipes(false))
    }
  }

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipeId(recipe.id)
    setSelectedRecipeTitle(recipe.title)
    const newProducts: SelectedProduct[] = recipe.steps
      .filter(s => s.productId !== null)
      .map((s, i) => ({
        productId: s.productId,
        customName: null,
        category: null,
        memo: s.memo ?? null,
        sortOrder: i,
        displayName: s.productName!,
      }))
    setSelectedProducts(newProducts)
    setShowRecipePicker(false)
    if (newProducts.length === 0) {
      toast.success(`'${recipe.title}' 레시피를 연결했어요. (등록된 제품 없음)`)
    } else {
      toast.success(`'${recipe.title}' 레시피에서 ${newProducts.length}개 제품을 불러왔어요.`)
    }
  }

  const clearRecipe = () => {
    setSelectedRecipeId(null)
    setSelectedRecipeTitle(null)
  }

  const applySet = (set: ProductSet) => {
    setSelectedProducts(
      set.items.map(item => ({
        productId: item.productId,
        customName: item.productId ? null : item.productName,
        category: item.category,
        memo: null,
        sortOrder: item.sortOrder,
        displayName: item.productName,
      }))
    )
  }

  const handlePickerConfirm = (products: Product[]) => {
    const newProducts = products
      .filter(p => !selectedProducts.some(sp => sp.productId === p.id))
      .map((p, i) => ({
        productId: p.id,
        customName: null,
        category: p.categoryName,
        memo: null,
        sortOrder: selectedProducts.length + i,
        displayName: p.name,
      }))
    setSelectedProducts(prev => [...prev, ...newProducts])
    setShowPicker(false)
  }

  const addCustomProduct = () => {
    if (!customName.trim()) { return }
    setSelectedProducts(prev => [
      ...prev,
      {
        productId: null,
        customName: customName.trim(),
        category: customCategory.trim() || null,
        memo: null,
        sortOrder: prev.length,
        displayName: customName.trim(),
      },
    ])
    setCustomName('')
    setCustomCategory('')
    setIsAddingCustom(false)
  }

  const removeProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (isSaving) { return }
    setIsSaving(true)
    try {
      const session = await createSession({
        washedAt: washDate,
        location: washLocation.trim() || null,
        recipeId: selectedRecipeId,
        products: selectedProducts.map(({ displayName: _, ...rest }) => rest),
      })
      toast.success(WASH_MSGS.PREPARING_SAVED)
      navigate(`/wash/${session.id}`, { replace: true })
    } catch {
      toast.error(WASH_MSGS.SESSION_CREATE_ERROR)
      setIsSaving(false)
    }
  }

  const selectedIds = selectedProducts
    .filter(p => p.productId !== null)
    .map(p => p.productId as number)

  return (
    <PageLayout title="세차 준비" onBack={true} hasFixedButton>
      <div className="flex flex-col gap-3">

        {/* 날짜 선택 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <p className="text-[13px] text-[#6B7684] mb-2">세차 날짜</p>
          <div className="relative">
            <div className="w-full flex items-center gap-3 border border-[#E5E8EB] rounded-xl px-3 py-2.5 pointer-events-none">
              <CalendarDays size={18} className="text-[#3182F6] shrink-0" />
              <span className="text-[14px] text-[#191F28]">{formatDate(washDate)}</span>
            </div>
            <input
              ref={dateInputRef}
              type="date"
              value={washDate}
              onChange={e => setWashDate(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* 세차 장소 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <p className="text-[13px] text-[#6B7684] mb-2">세차 장소</p>
          <div className="flex items-center gap-3 border border-[#E5E8EB] rounded-xl px-3 py-2.5 focus-within:border-[#3182F6]">
            <MapPin size={18} className="text-[#3182F6] shrink-0" />
            <input
              value={washLocation}
              onChange={e => setWashLocation(e.target.value)}
              placeholder="예) 셀프세차장, 집 앞 (선택)"
              className="flex-1 text-[14px] outline-none bg-transparent"
            />
          </div>
        </div>

        {/* 레시피 불러오기 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <p className="text-[13px] text-[#6B7684] mb-2">레시피로 불러오기</p>
          {selectedRecipeTitle ? (
            <div className="flex items-center gap-2 bg-[#EFF6FF] rounded-xl px-3 py-2.5">
              <BookOpen size={16} className="text-[#3182F6] shrink-0" />
              <p className="flex-1 text-[13px] font-medium text-[#3182F6]">{selectedRecipeTitle}</p>
              <button onClick={clearRecipe} className="text-[#ADB5C0]"><X size={14} /></button>
            </div>
          ) : (
            <button
              onClick={handleOpenRecipePicker}
              className="w-full flex items-center justify-between border border-dashed border-[#C8D0DA] rounded-xl px-3 py-2.5"
            >
              <span className="flex items-center gap-2 text-[13px] text-[#ADB5C0]">
                <BookOpen size={15} />
                내 레시피에서 불러오기
              </span>
              <ChevronRight size={15} className="text-[#ADB5C0]" />
            </button>
          )}
        </div>

        {/* 즐겨찾기 세트 */}
        {sets.length > 0 && (
          <div className="bg-white rounded-2xl px-5 py-4">
            <p className="text-[13px] text-[#6B7684] mb-2.5">즐겨찾기 세트 불러오기</p>
            <div className="flex gap-2 flex-wrap">
              {sets.map(set => (
                <button
                  key={set.id}
                  onClick={() => applySet(set)}
                  className="flex items-center gap-1.5 bg-[#F2F4F6] rounded-full px-3 py-1.5 active:brightness-95"
                >
                  {set.isDefault && <span className="w-1.5 h-1.5 rounded-full bg-[#3182F6]" />}
                  <span className="text-[13px] font-medium text-[#191F28]">{set.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 선택된 용품 목록 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-semibold text-[#191F28]">
              오늘 사용할 용품
              {selectedProducts.length > 0 && (
                <span className="ml-1.5 text-[13px] text-[#3182F6] font-medium">
                  {selectedProducts.length}개
                </span>
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="h-8 bg-[#F2F4F6] rounded animate-pulse" />
          ) : selectedProducts.length === 0 ? (
            <p className="text-[13px] text-[#ADB5C0] py-1">{WASH_MSGS.EMPTY_PRODUCTS}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-[#F2F4F6] rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-[13px] font-medium text-[#191F28]">{p.displayName}</p>
                    {p.category && <p className="text-[11px] text-[#ADB5C0]">{p.category}</p>}
                  </div>
                  <button onClick={() => removeProduct(i)} className="p-1 text-[#ADB5C0]">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 제품 추가 버튼들 */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setShowPicker(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#3182F6] text-white text-[13px] font-medium"
            >
              <Plus size={15} />
              제품 검색
            </button>
            <button
              onClick={() => setIsAddingCustom(v => !v)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-[#C8D0DA] text-[13px] text-[#6B7684]"
            >
              <Plus size={15} />
              직접 입력
            </button>
          </div>

          {/* 직접 입력 폼 */}
          {isAddingCustom && (
            <div className="mt-3 flex flex-col gap-2">
              <input
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="용품 이름"
                className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
              />
              <input
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                placeholder="카테고리 (선택)"
                className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAddingCustom(false)}
                  className="flex-1 py-2.5 rounded-xl border border-[#E5E8EB] text-[14px] text-[#6B7684]"
                >
                  취소
                </button>
                <button
                  onClick={addCustomProduct}
                  className="flex-1 py-2.5 rounded-xl bg-[#3182F6] text-white text-[14px] font-medium"
                >
                  추가
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 제품 검색 시트 */}
      <ProductPickerSheet
        open={showPicker}
        onClose={() => setShowPicker(false)}
        multiSelect
        selectedIds={selectedIds}
        onConfirm={handlePickerConfirm}
      />

      {/* 레시피 선택 시트 */}
      <BottomSheet open={showRecipePicker} onClose={() => setShowRecipePicker(false)} title="레시피로 불러오기">
        <div className="pb-4">
          {/* 탭 */}
          <div className="flex border-b border-[#F2F4F6] mb-3">
            {([
              { key: 'my' as const, label: '내 레시피' },
              { key: 'saved' as const, label: '즐겨찾기' },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRecipeTab(key)}
                className={`flex-1 py-2.5 text-[14px] font-semibold border-b-2 -mb-px transition-all ${
                  recipeTab === key ? 'border-[#3182F6] text-[#3182F6]' : 'border-transparent text-[#ADB5C0]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {isLoadingRecipes ? (
            <div className="py-10 flex justify-center">
              <div className="w-5 h-5 border-2 border-[#3182F6] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (recipeTab === 'my' ? myRecipes : savedRecipes).length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-[14px] text-[#ADB5C0]">
                {recipeTab === 'my' ? '작성한 레시피가 없어요' : '즐겨찾기한 레시피가 없어요'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(recipeTab === 'my' ? myRecipes : savedRecipes).map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => handleSelectRecipe(recipe)}
                  className="w-full flex items-center justify-between bg-[#F2F4F6] rounded-xl px-4 py-3 text-left active:brightness-95"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-[#191F28]">{recipe.title}</p>
                    <p className="text-[12px] text-[#ADB5C0] mt-0.5">
                      {recipe.steps.filter(s => s.productId).length}개 제품 · by {recipe.authorNickname}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-[#ADB5C0]" />
                </button>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>

      {/* 하단 저장 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#F2F4F6] px-4 py-4 pb-safe">
        <button
          onClick={handleSave}
          disabled={isSaving || selectedProducts.length === 0}
          className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold disabled:opacity-40"
        >
          {isSaving ? '저장 중...' : '세차 준비 저장'}
        </button>
      </div>
    </PageLayout>
  )
}

export default WashNewPage
