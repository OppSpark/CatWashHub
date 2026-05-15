import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getSession, completeSession } from '@/api/washApi'
import { getProducts as fetchProducts } from '@/api/calculatorApi'
import type { Weather, WashProductRequest, WashProductItem } from '@/types/wash'
import type { Product } from '@/types/calculator'
import { useToast } from '@/hooks/useToast'
import { WASH_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'
import { BookOpen } from 'lucide-react'

const WEATHER_OPTIONS: { value: Weather; label: string; emoji: string }[] = [
  { value: 'SUNNY', label: '맑음', emoji: '☀️' },
  { value: 'CLOUDY', label: '흐림', emoji: '☁️' },
  { value: 'RAINY', label: '비', emoji: '🌧️' },
  { value: 'SNOWY', label: '눈', emoji: '❄️' },
]

interface EditingProduct extends WashProductRequest {
  displayName: string
}

const WashReviewPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const toast = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [location, setLocation] = useState('')
  const [weather, setWeather] = useState<Weather | null>(null)
  const [durationMinutes, setDurationMinutes] = useState('')
  const [cost, setCost] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [memo, setMemo] = useState('')
  const [products, setProducts] = useState<EditingProduct[]>([])

  const [recipeId, setRecipeId] = useState<number | null>(null)
  const [recipeTitle, setRecipeTitle] = useState<string | null>(null)

  const [dbProducts, setDbProducts] = useState<Product[]>([])
  const [showProductPanel, setShowProductPanel] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [isAddingCustom, setIsAddingCustom] = useState(false)

  useEffect(() => {
    if (!id) { return }
    getSession(Number(id)).then(session => {
      setLocation(session.location ?? '')
      setRecipeId(session.recipeId)
      setRecipeTitle(session.recipeTitle)
      setProducts(
        session.products.map((p: WashProductItem) => ({
          productId: p.productId,
          customName: p.productId ? null : p.productName,
          category: p.category,
          memo: p.memo,
          sortOrder: p.sortOrder,
          displayName: p.productName,
        }))
      )
    }).finally(() => setIsLoading(false))
  }, [id])

  const openProductPanel = () => {
    setShowProductPanel(true)
    if (dbProducts.length === 0) {
      setIsLoadingProducts(true)
      fetchProducts().then(setDbProducts).finally(() => setIsLoadingProducts(false))
    }
  }

  const addFromDb = (product: Product) => {
    if (products.some(p => p.productId === product.id)) { return }
    setProducts(prev => [...prev, {
      productId: product.id,
      customName: null,
      category: product.categoryName,
      memo: null,
      sortOrder: prev.length,
      displayName: product.name,
    }])
  }

  const addCustom = () => {
    if (!customName.trim()) { return }
    setProducts(prev => [...prev, {
      productId: null,
      customName: customName.trim(),
      category: customCategory.trim() || null,
      memo: null,
      sortOrder: prev.length,
      displayName: customName.trim(),
    }])
    setCustomName('')
    setCustomCategory('')
    setIsAddingCustom(false)
  }

  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!id || isSubmitting) { return }
    setIsSubmitting(true)
    try {
      await completeSession(Number(id), {
        weather,
        durationMinutes: durationMinutes ? Number(durationMinutes) : null,
        cost: cost ? Number(cost) : null,
        rating,
        memo: memo || null,
        recipeId,
        products: products.map(({ displayName: _, ...rest }) => rest),
      })
      toast.success(WASH_MSGS.SESSION_CREATED)
      navigate(`/wash/${id}`, { replace: true })
    } catch (err) {
      console.error('[WashReviewPage] completeSession error:', err)
      toast.error(WASH_MSGS.SESSION_CREATE_ERROR)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <PageLayout isLoading />
  }

  return (
    <PageLayout
      title="후기 작성"
      onBack={true}
      hasFixedButton
    >
      <div className="flex flex-col gap-3">

        {/* 세차장 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <label className="block text-[13px] text-[#6B7684] mb-1.5">세차장</label>
          <input
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder={WASH_MSGS.PLACEHOLDER_LOCATION}
            className="w-full text-[15px] text-[#191F28] outline-none placeholder:text-[#C8D0DA]"
          />
        </div>

        {/* 사용한 레시피 */}
        {recipeId && recipeTitle && (
          <button
            onClick={() => navigate(`/recipe/${recipeId}`)}
            className="w-full bg-white rounded-2xl px-5 py-4 flex items-center gap-3 active:brightness-95 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <BookOpen size={18} className="text-[#3182F6]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#ADB5C0] mb-0.5">사용한 레시피</p>
              <p className="text-[14px] font-semibold text-[#3182F6] truncate">{recipeTitle}</p>
            </div>
          </button>
        )}

        {/* 날씨 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <label className="block text-[13px] text-[#6B7684] mb-2">날씨</label>
          <div className="flex gap-2">
            {WEATHER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setWeather(prev => prev === opt.value ? null : opt.value)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-colors
                  ${weather === opt.value ? 'border-[#3182F6] bg-[#EBF3FF]' : 'border-[#E5E8EB]'}`}
              >
                <span className="text-[20px]">{opt.emoji}</span>
                <span className="text-[11px] text-[#6B7684]">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 소요 시간 / 비용 */}
        <div className="bg-white rounded-2xl px-5 py-4 flex gap-4">
          <div className="flex-1">
            <label className="block text-[13px] text-[#6B7684] mb-1.5">소요 시간</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={durationMinutes}
                onChange={e => setDurationMinutes(e.target.value)}
                placeholder="0"
                className="w-full text-[15px] text-[#191F28] outline-none placeholder:text-[#C8D0DA]"
              />
              <span className="text-[13px] text-[#ADB5C0] shrink-0">분</span>
            </div>
          </div>
          <div className="w-px bg-[#F2F4F6]" />
          <div className="flex-1">
            <label className="block text-[13px] text-[#6B7684] mb-1.5">비용</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={cost}
                onChange={e => setCost(e.target.value)}
                placeholder="0"
                className="w-full text-[15px] text-[#191F28] outline-none placeholder:text-[#C8D0DA]"
              />
              <span className="text-[13px] text-[#ADB5C0] shrink-0">원</span>
            </div>
          </div>
        </div>

        {/* 별점 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <label className="block text-[13px] text-[#6B7684] mb-2">만족도</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(prev => prev === star ? null : star)}
                className={`text-[28px] transition-colors ${star <= (rating ?? 0) ? 'text-[#FFB800]' : 'text-[#E5E8EB]'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* 사용 용품 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[14px] font-semibold text-[#191F28]">
              사용 용품
              {products.length > 0 && (
                <span className="ml-1.5 text-[13px] text-[#3182F6] font-medium">{products.length}개</span>
              )}
            </p>
            <button onClick={openProductPanel} className="text-[13px] text-[#3182F6] font-medium">
              + 추가
            </button>
          </div>

          {products.length === 0 ? (
            <p className="text-[13px] text-[#ADB5C0] py-1">{WASH_MSGS.EMPTY_PRODUCTS}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {products.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-[#F2F4F6] rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-[13px] font-medium text-[#191F28]">{p.displayName}</p>
                    {p.category && <p className="text-[11px] text-[#ADB5C0]">{p.category}</p>}
                  </div>
                  <button onClick={() => removeProduct(i)} className="text-[#ADB5C0] text-[18px] leading-none px-1">×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 메모 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <label className="block text-[13px] text-[#6B7684] mb-1.5">메모 / 차 상태</label>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder={WASH_MSGS.PLACEHOLDER_MEMO}
            rows={4}
            className="w-full text-[14px] text-[#191F28] outline-none resize-none placeholder:text-[#C8D0DA]"
          />
        </div>

      </div>

      {/* 용품 추가 패널 */}
      {showProductPanel && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowProductPanel(false)} />
          <div className="relative bg-white rounded-t-3xl px-4 pt-4 pb-8 max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[16px] font-bold text-[#191F28]">용품 추가</p>
              <button onClick={() => setShowProductPanel(false)} className="text-[#ADB5C0] text-[22px]">×</button>
            </div>
            <div className="overflow-y-auto flex-1">
              {isLoadingProducts ? (
                <div className="h-10 bg-[#F2F4F6] rounded animate-pulse" />
              ) : (
                <div className="flex flex-col gap-1">
                  {dbProducts.map(product => {
                    const added = products.some(p => p.productId === product.id)
                    return (
                      <button
                        key={product.id}
                        onClick={() => !added && addFromDb(product)}
                        disabled={added}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left ${added ? 'opacity-40' : 'active:bg-[#F2F4F6]'}`}
                      >
                        <div>
                          <p className="text-[13px] font-medium text-[#191F28]">{product.name}</p>
                          {product.categoryName && <p className="text-[11px] text-[#ADB5C0]">{product.categoryName}</p>}
                        </div>
                        {added ? <span className="text-[12px] text-[#3182F6]">추가됨</span> : <span className="text-[18px] text-[#3182F6]">+</span>}
                      </button>
                    )
                  })}
                </div>
              )}
              {isAddingCustom ? (
                <div className="mt-3 flex flex-col gap-2">
                  <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="용품 이름" className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]" />
                  <input value={customCategory} onChange={e => setCustomCategory(e.target.value)} placeholder="카테고리 (선택)" className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]" />
                  <div className="flex gap-2">
                    <button onClick={() => setIsAddingCustom(false)} className="flex-1 py-2.5 rounded-xl border border-[#E5E8EB] text-[14px] text-[#6B7684]">취소</button>
                    <button onClick={addCustom} className="flex-1 py-2.5 rounded-xl bg-[#3182F6] text-white text-[14px] font-medium">추가</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsAddingCustom(true)} className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-[#C8D0DA] text-[13px] text-[#6B7684]">
                  + 직접 입력
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 하단 저장 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#F2F4F6] px-4 py-4 pb-safe">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold disabled:opacity-50"
        >
          {isSubmitting ? '저장 중...' : '후기 저장 완료'}
        </button>
      </div>
    </PageLayout>
  )
}

export default WashReviewPage
