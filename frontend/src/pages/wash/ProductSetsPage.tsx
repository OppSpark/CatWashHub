import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  getProductSets,
  createProductSet,
  updateProductSet,
  deleteProductSet,
} from '@/api/washApi'
import { getProducts as fetchProducts } from '@/api/calculatorApi'
import type { ProductSet, ProductSetRequest, ProductSetItemRequest } from '@/types/wash'
import type { Product } from '@/types/calculator'
import { useToast } from '@/hooks/useToast'
import { WASH_MSGS } from '@/constants/messages'
import PageLayout from '@/layouts/PageLayout'

interface EditingItem {
  productId: number | null
  customName: string | null
  category: string | null
  sortOrder: number
  displayName: string
}

const ProductSetsPage = () => {
  const location = useLocation()
  const toast = useToast()

  const startWithCreate = location.pathname.endsWith('/new')

  const [sets, setSets] = useState<ProductSet[]>([])
  const [dbProducts, setDbProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [editingSetId, setEditingSetId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(startWithCreate)
  const [setName, setSetName] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [editingItems, setEditingItems] = useState<EditingItem[]>([])

  const [showProductPanel, setShowProductPanel] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customCategory, setCustomCategory] = useState('')
  const [isAddingCustom, setIsAddingCustom] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    Promise.all([getProductSets(), fetchProducts()])
      .then(([setsData, productsData]) => {
        setSets(setsData)
        setDbProducts(productsData)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const openCreate = () => {
    setEditingSetId(null)
    setSetName('')
    setIsDefault(false)
    setEditingItems([])
    setIsCreating(true)
  }

  const openEdit = (set: ProductSet) => {
    setIsCreating(false)
    setEditingSetId(set.id)
    setSetName(set.name)
    setIsDefault(set.isDefault)
    setEditingItems(
      set.items.map(item => ({
        productId: item.productId,
        customName: item.productId ? null : item.productName,
        category: item.category,
        sortOrder: item.sortOrder,
        displayName: item.productName,
      }))
    )
  }

  const closeEditor = () => {
    setIsCreating(false)
    setEditingSetId(null)
  }

  const addFromDb = (product: Product) => {
    if (editingItems.some(i => i.productId === product.id)) { return }
    setEditingItems(prev => [
      ...prev,
      {
        productId: product.id,
        customName: null,
        category: product.categoryName,
        sortOrder: prev.length,
        displayName: product.name,
      },
    ])
  }

  const addCustom = () => {
    if (!customName.trim()) { return }
    setEditingItems(prev => [
      ...prev,
      {
        productId: null,
        customName: customName.trim(),
        category: customCategory.trim() || null,
        sortOrder: prev.length,
        displayName: customName.trim(),
      },
    ])
    setCustomName('')
    setCustomCategory('')
    setIsAddingCustom(false)
  }

  const removeItem = (index: number) => {
    setEditingItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!setName.trim() || isSaving) { return }
    setIsSaving(true)

    const request: ProductSetRequest = {
      name: setName.trim(),
      isDefault,
      items: editingItems.map(({ displayName: _, ...item }) => item as ProductSetItemRequest),
    }

    try {
      if (isCreating) {
        const created = await createProductSet(request)
        setSets(prev => [...prev, created])
        toast.success(WASH_MSGS.SET_CREATED)
      } else if (editingSetId != null) {
        const updated = await updateProductSet(editingSetId, request)
        setSets(prev => prev.map(s => s.id === editingSetId ? updated : s))
        toast.success(WASH_MSGS.SET_UPDATED)
      }
      closeEditor()
    } catch {
      toast.error(WASH_MSGS.SET_SAVE_ERROR)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (setId: number) => {
    if (!window.confirm(WASH_MSGS.CONFIRM_DELETE_SET)) { return }
    try {
      await deleteProductSet(setId)
      setSets(prev => prev.filter(s => s.id !== setId))
      toast.success(WASH_MSGS.SET_DELETED)
      if (editingSetId === setId) { closeEditor() }
    } catch {
      toast.error(WASH_MSGS.SET_DELETE_ERROR)
    }
  }

  const isEditorOpen = isCreating || editingSetId != null

  return (
    <PageLayout
      title="용품 세트 관리"
      onBack={true}
      hasFixedButton={!isEditorOpen}
    >
      <div className="flex flex-col gap-3">

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sets.length === 0 && !isEditorOpen ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-[15px] font-semibold text-[#191F28]">저장된 세트가 없어요</p>
            <p className="text-[13px] text-[#ADB5C0]">자주 쓰는 용품 조합을 세트로 저장해두세요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sets.map(set => (
              <div key={set.id} className="bg-white rounded-2xl px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {set.isDefault && <span className="w-2 h-2 rounded-full bg-[#3182F6] shrink-0" />}
                    <p className="text-[15px] font-semibold text-[#191F28]">{set.name}</p>
                    <span className="text-[12px] text-[#ADB5C0]">{set.items.length}개</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => openEdit(set)} className="text-[13px] text-[#3182F6]">수정</button>
                    <button onClick={() => handleDelete(set.id)} className="text-[13px] text-[#FF4D4F]">삭제</button>
                  </div>
                </div>
                {set.items.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {set.items.map(item => (
                      <span key={item.id} className="bg-[#F2F4F6] text-[#6B7684] text-[12px] rounded-full px-2.5 py-1">
                        {item.productName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 편집 폼 */}
        {isEditorOpen && (
          <div className="bg-white rounded-2xl px-5 py-4 flex flex-col gap-3">
            <p className="text-[15px] font-bold text-[#191F28]">
              {isCreating ? '새 세트 만들기' : '세트 수정'}
            </p>

            <input
              value={setName}
              onChange={e => setSetName(e.target.value)}
              placeholder="세트 이름 (예: 풀코스, 간단세차)"
              className="w-full border border-[#E5E8EB] rounded-xl px-3 py-2.5 text-[14px] outline-none focus:border-[#3182F6]"
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setIsDefault(prev => !prev)}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                  ${isDefault ? 'bg-[#3182F6] border-[#3182F6]' : 'border-[#C8D0DA]'}`}
              >
                {isDefault && <span className="text-white text-[11px] font-bold">✓</span>}
              </div>
              <span className="text-[13px] text-[#191F28]">기본 세트로 설정</span>
            </label>

            {editingItems.length > 0 && (
              <div className="flex flex-col gap-2">
                {editingItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#F2F4F6] rounded-xl px-3 py-2">
                    <div>
                      <p className="text-[13px] font-medium text-[#191F28]">{item.displayName}</p>
                      {item.category && <p className="text-[11px] text-[#ADB5C0]">{item.category}</p>}
                    </div>
                    <button onClick={() => removeItem(i)} className="text-[#ADB5C0] text-[18px] leading-none px-1">×</button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowProductPanel(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-[#C8D0DA] text-[13px] text-[#6B7684]"
            >
              + 용품 추가
            </button>

            <div className="flex gap-2 pt-1">
              <button onClick={closeEditor} className="flex-1 py-3 rounded-xl border border-[#E5E8EB] text-[14px] text-[#6B7684]">취소</button>
              <button
                onClick={handleSave}
                disabled={!setName.trim() || isSaving}
                className="flex-1 py-3 rounded-xl bg-[#3182F6] text-white text-[14px] font-semibold disabled:opacity-50"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 하단 새 세트 버튼 */}
      {!isEditorOpen && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-[#F2F4F6] px-4 py-4 pb-safe">
          <button onClick={openCreate} className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold">
            + 새 세트 만들기
          </button>
        </div>
      )}

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
              <div className="flex flex-col gap-1">
                {dbProducts.map(product => {
                  const added = editingItems.some(i => i.productId === product.id)
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
    </PageLayout>
  )
}

export default ProductSetsPage
