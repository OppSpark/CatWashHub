import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getProductSets } from '@/api/washApi'
import { getProducts as fetchProducts } from '@/api/calculatorApi'
import type { ProductSet, ProductSetItem, WashProductRequest } from '@/types/wash'
import type { Product } from '@/types/calculator'
import { WASH_MSGS } from '@/constants/messages'

interface SelectedProduct {
  productId: number | null
  customName: string | null
  category: string | null
  memo: string | null
  sortOrder: number
}

const WashNewPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const preselectedSetId: number | null = location.state?.setId ?? null

  const [sets, setSets] = useState<ProductSet[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    Promise.all([getProductSets(), fetchProducts()])
      .then(([setsData, productsData]) => {
        setSets(setsData)
        setProducts(productsData)

        if (preselectedSetId) {
          const found = setsData.find(s => s.id === preselectedSetId)
          if (found) {
            applySet(found)
          }
        } else {
          const defaultSet = setsData.find(s => s.isDefault)
          if (defaultSet) {
            applySet(defaultSet)
          }
        }
      })
      .finally(() => setIsLoading(false))
  }, [])

  const applySet = (set: ProductSet) => {
    setSelectedProducts(
      set.items.map(item => ({
        productId: item.productId,
        customName: item.productId ? null : item.productName,
        category: item.category,
        memo: null,
        sortOrder: item.sortOrder,
      }))
    )
  }

  const addProductFromDb = (product: Product) => {
    setSelectedProducts(prev => [
      ...prev,
      {
        productId: product.id,
        customName: null,
        category: product.categoryName,
        memo: null,
        sortOrder: prev.length,
      },
    ])
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
      },
    ])
    setCustomName('')
    setCustomCategory('')
    setIsAddingCustom(false)
  }

  const removeProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index))
  }

  const handleNext = () => {
    navigate('/wash/edit', { state: { products: selectedProducts } })
  }

  const isAlreadyAdded = (productId: number) =>
    selectedProducts.some(p => p.productId === productId)

  return (
    <div className="min-h-dvh bg-[#F2F4F6] pb-24">

      {/* 헤더 */}
      <div className="bg-white px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-[#191F28]">
          ←
        </button>
        <h1 className="text-[18px] font-bold text-[#191F28]">세차 준비</h1>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-3">

        {/* 즐겨찾기 세트 선택 */}
        {sets.length > 0 && (
          <div className="bg-white rounded-2xl px-5 py-4">
            <p className="text-[14px] font-semibold text-[#191F28] mb-3">즐겨찾기 세트 불러오기</p>
            <div className="flex gap-2 flex-wrap">
              {sets.map(set => (
                <button
                  key={set.id}
                  onClick={() => applySet(set)}
                  className="flex items-center gap-1.5 bg-[#F2F4F6] rounded-full px-3 py-1.5"
                >
                  {set.isDefault && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3182F6]" />
                  )}
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

          {selectedProducts.length === 0 ? (
            <p className="text-[13px] text-[#ADB5C0] py-2">{WASH_MSGS.EMPTY_PRODUCTS}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-[#F2F4F6] rounded-xl px-3 py-2.5">
                  <div>
                    <p className="text-[13px] font-medium text-[#191F28]">
                      {p.customName ?? products.find(prod => prod.id === p.productId)?.name ?? ''}
                    </p>
                    {p.category && (
                      <p className="text-[11px] text-[#ADB5C0]">{p.category}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeProduct(i)}
                    className="text-[#ADB5C0] text-[18px] leading-none px-1"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 제품 DB에서 추가 */}
        <div className="bg-white rounded-2xl px-5 py-4">
          <p className="text-[14px] font-semibold text-[#191F28] mb-3">제품 추가</p>

          {isLoading ? (
            <div className="h-8 bg-[#F2F4F6] rounded animate-pulse" />
          ) : (
            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
              {products.map(product => {
                const added = isAlreadyAdded(product.id)
                return (
                  <button
                    key={product.id}
                    onClick={() => !added && addProductFromDb(product)}
                    disabled={added}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors
                      ${added ? 'opacity-40' : 'active:bg-[#F2F4F6]'}`}
                  >
                    <div>
                      <p className="text-[13px] font-medium text-[#191F28]">{product.name}</p>
                      {product.categoryName && (
                        <p className="text-[11px] text-[#ADB5C0]">{product.categoryName}</p>
                      )}
                    </div>
                    {added ? (
                      <span className="text-[12px] text-[#3182F6]">추가됨</span>
                    ) : (
                      <span className="text-[18px] text-[#3182F6]">+</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* 직접 입력 */}
          {isAddingCustom ? (
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
          ) : (
            <button
              onClick={() => setIsAddingCustom(true)}
              className="mt-3 w-full py-2.5 rounded-xl border border-dashed border-[#C8D0DA] text-[13px] text-[#6B7684]"
            >
              + 직접 입력
            </button>
          )}
        </div>

      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F2F4F6] px-4 py-4 pb-safe">
        <button
          onClick={handleNext}
          className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold disabled:opacity-40"
        >
          세차 완료 후 일지 작성
        </button>
      </div>
    </div>
  )
}

export default WashNewPage
