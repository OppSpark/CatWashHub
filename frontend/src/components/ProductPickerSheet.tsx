import { useState, useEffect } from 'react'
import { Search, X, BadgeCheck, User, ChevronRight, Check } from 'lucide-react'
import { getCategories, getProducts } from '@/api/calculatorApi'
import type { Category, Product } from '@/types/calculator'
import BottomSheet from '@/components/BottomSheet'

// ==================== 단일 선택 모드 ====================
interface SinglePickerProps {
  open: boolean
  onClose: () => void
  multiSelect?: false
  onSelect: (product: Product) => void
  selectedIds?: never
  onConfirm?: never
}

// ==================== 다중 선택 모드 ====================
interface MultiPickerProps {
  open: boolean
  onClose: () => void
  multiSelect: true
  onConfirm: (products: Product[]) => void
  selectedIds?: number[]   // 이미 추가된 ID (중복 방지)
  onSelect?: never
}

type ProductPickerSheetProps = SinglePickerProps | MultiPickerProps

const ProductPickerSheet = (props: ProductPickerSheetProps) => {
  const { open, onClose } = props

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [keyword, setKeyword] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [checkedProducts, setCheckedProducts] = useState<Product[]>([])

  // ==================== 초기화 함수 ====================
  useEffect(() => {
    if (!open) {
      return
    }
    getCategories().then(setCategories).catch(() => {})
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }
    getProducts({
      categoryId: selectedCategoryId ?? undefined,
      keyword: keyword || undefined,
    }).then(setProducts).catch(() => {})
  }, [open, selectedCategoryId, keyword])

  // 시트가 닫힐 때 내부 상태 초기화
  useEffect(() => {
    if (!open) {
      setKeyword('')
      setSelectedCategoryId(null)
      setCheckedProducts([])
    }
  }, [open])

  // ==================== 기능별 함수 ====================
  const handleProductClick = (product: Product) => {
    if (!props.multiSelect) {
      props.onSelect(product)
      return
    }
    // 다중 선택: 토글
    setCheckedProducts(prev =>
      prev.some(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    )
  }

  const handleConfirm = () => {
    if (props.multiSelect) {
      props.onConfirm(checkedProducts)
    }
  }

  const isExternallySelected = (id: number) =>
    props.multiSelect ? (props.selectedIds ?? []).includes(id) : false

  const isChecked = (id: number) =>
    checkedProducts.some(p => p.id === id)

  const officialProducts = products.filter(p => p.isOfficial)
  const userProducts = products.filter(p => !p.isOfficial)

  const footer = props.multiSelect ? (
    <button
      onClick={handleConfirm}
      disabled={checkedProducts.length === 0}
      className="w-full bg-[#3182F6] text-white rounded-2xl py-4 text-[16px] font-semibold disabled:opacity-40"
    >
      {checkedProducts.length > 0 ? `${checkedProducts.length}개 추가` : '제품 선택'}
    </button>
  ) : undefined

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="제품 선택"
      footer={footer}
    >
      <div className="flex flex-col gap-0 -mx-5">

        {/* 검색 */}
        <div className="px-5 py-3 border-b border-[#F2F4F6]">
          <div className="flex items-center gap-2 bg-[#F2F4F6] rounded-xl px-3 py-2.5">
            <Search size={16} className="text-[#ADB5C0] shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="제품명 검색"
              className="flex-1 bg-transparent text-[14px] text-[#191F28] placeholder-[#ADB5C0] outline-none"
            />
            {keyword && (
              <button onClick={() => setKeyword('')}>
                <X size={14} className="text-[#ADB5C0]" />
              </button>
            )}
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="px-4 py-2.5 flex gap-2 overflow-x-auto border-b border-[#F2F4F6]">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold transition
              ${selectedCategoryId === null ? 'bg-[#3182F6] text-white' : 'bg-[#F2F4F6] text-[#6B7684]'}`}
          >
            전체
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-semibold transition
                ${selectedCategoryId === cat.id ? 'bg-[#3182F6] text-white' : 'bg-[#F2F4F6] text-[#6B7684]'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 제품 목록 */}
        <div className="overflow-y-auto max-h-[45dvh]">
          {products.length === 0 ? (
            <p className="py-12 text-center text-[14px] text-[#ADB5C0]">검색 결과가 없어요</p>
          ) : (
            <>
              {officialProducts.length > 0 && (
                <>
                  <div className="px-5 py-2 flex items-center gap-1.5 bg-[#F8FAFC]">
                    <BadgeCheck size={14} className="text-[#3182F6]" />
                    <span className="text-[12px] font-semibold text-[#3182F6]">공식 제품</span>
                  </div>
                  {officialProducts.map(product => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      multiSelect={!!props.multiSelect}
                      checked={isChecked(product.id)}
                      disabled={isExternallySelected(product.id)}
                      onClick={() => handleProductClick(product)}
                    />
                  ))}
                </>
              )}
              {userProducts.length > 0 && (
                <>
                  <div className="px-5 py-2 flex items-center gap-1.5 bg-[#F8FAFC]">
                    <User size={14} className="text-[#6B7684]" />
                    <span className="text-[12px] font-semibold text-[#6B7684]">사용자 등록 제품</span>
                  </div>
                  {userProducts.map(product => (
                    <ProductRow
                      key={product.id}
                      product={product}
                      multiSelect={!!props.multiSelect}
                      checked={isChecked(product.id)}
                      disabled={isExternallySelected(product.id)}
                      onClick={() => handleProductClick(product)}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>

      </div>
    </BottomSheet>
  )
}

// ==================== 서브 컴포넌트 ====================
interface ProductRowProps {
  product: Product
  multiSelect: boolean
  checked: boolean
  disabled: boolean
  onClick: () => void
}

const ProductRow = ({ product, multiSelect, checked, disabled, onClick }: ProductRowProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center justify-between px-5 py-3.5 border-b border-[#F2F4F6] transition
      ${disabled ? 'opacity-40' : 'active:bg-[#F2F4F6]'}`}
  >
    <div className="text-left">
      <p className="text-[14px] font-semibold text-[#191F28]">{product.name}</p>
      <p className="text-[12px] text-[#6B7684] mt-0.5">
        {product.brand}
        {product.categoryName && ` · ${product.categoryName}`}
        {product.capacityMl && ` · ${product.capacityMl}ml`}
      </p>
    </div>
    {multiSelect ? (
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition
        ${checked ? 'bg-[#3182F6] border-[#3182F6]' : 'border-[#C8D0DA]'}`}
      >
        {checked && <Check size={13} className="text-white" strokeWidth={3} />}
      </div>
    ) : (
      disabled
        ? <span className="text-[12px] text-[#3182F6] shrink-0">추가됨</span>
        : <ChevronRight size={18} className="text-[#ADB5C0] shrink-0" />
    )}
  </button>
)

export default ProductPickerSheet
